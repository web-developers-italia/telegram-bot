# Web Dev Italia Community bot

Questo bot aiuta a gestire il gruppo di [Web Developers Italia](https://t.me/webdevitalia), mettendo a disposizione una serie di strumenti.

Sito della community: [web-developers-italia.github.io/telegram-bot](https://web-developers-italia.github.io/telegram-bot/) (sorgente in `site/`, deploy automatico su GitHub Pages).

## Dettagli tecnici

- **Framework bot**: [grammY](https://grammy.dev/) (TypeScript, ESM)
- **Effect system**: [Effect](https://effect.website/) — comandi e middleware sono programmi Effect con errori tipizzati e servizi iniettabili (testabili senza rete)
- **Hosting**: Firebase Cloud Functions v2 (Node 22, region `europe-west1`), webhook protetto da secret token
- **Dati**: Firestore (`members_activity` con TTL a 90 giorni, stato welcome)
- **Secrets**: Google Secret Manager via `defineSecret` (niente `.env` in produzione)

## Comandi

| Trigger | Cosa fa |
|---|---|
| `/start` | In DM: benvenuto con pulsanti per entrare nel gruppo e leggere il regolamento |
| `/regolamento` `/regole` `/rules` | Mostra il regolamento |
| `/ping` | Risponde `/pong 🏓` |
| `/learn` | Risorse per iniziare col web development |
| `/dontasktoask` `/nonchiederedichiedere` | Invita a fare domande dirette |
| `/rielabora` (in reply) | Cancella il messaggio quotato e invita a rileggere le regole |
| `/contribute` `/contribuisci` | Link alla repo + PR e issue aperte |
| `@admin` `/admin` | Notifica gli amministratori (mention invisibili) |
| `/stats` (solo admin) | Membri attivi negli ultimi 7/30 giorni |
| `/invito` `/invite` | Il tuo link d'invito personale: chi entra dal gruppo tramite quel link viene attribuito a te |

Automatismi: benvenuto ai nuovi membri (un solo messaggio di welcome vivo per chat), ban dei messaggi inviati "come canale", blocco link per i nuovi arrivati nelle prime 24 ore, tracking attività con retention 90 giorni, pulizia mensile degli inattivi review-gated via PR (vedi [`moderation/`](moderation/README.md)), digest periodico dei messaggi più reagiti con link diretti nel gruppo (e versione testo per LinkedIn nel log del workflow), attribuzione degli ingressi al link d'invito personale (`/invito`) con classifica inviti periodica (post ogni 3 mesi; i contatori scadono dopo 90 giorni senza nuovi inviti) di chi ha portato più dev nel gruppo.

Il bot deve avere il permesso amministratore "Invite users via link" per poter creare i link d'invito personali di `/invito`.

## Sviluppo locale (senza ngrok!)

Lo sviluppo usa il **long polling**: niente tunnel, niente webhook.

1. Crea un bot di test con [BotFather](https://t.me/BotFather) e copia il token.
2. **Disabilita la privacy mode** del bot di test (`/setprivacy` → Disable su BotFather): senza, il bot non vede i messaggi normali del gruppo e `@admin`, anti-spam e tracking non funzionano.
3. Per testare welcome/ban aggiungi il bot a un gruppo di prova come **admin** con permessi *Delete messages* e *Ban users*.

```sh
cd functions
npm install
echo 'TELEGRAM_BOT_KEY="123456789:il-tuo-token-di-test"' > .env
npm run dev
```

`npm run dev` avvia il bot in polling con reload automatico (`tsx watch`). Per la parte Firestore in locale puoi puntare l'emulatore: `FIRESTORE_EMULATOR_HOST=localhost:8080 npm run dev` (con `firebase emulators:start --only firestore` in un altro terminale).

### Test

```sh
npm test          # vitest, una volta
npm run test:watch
npm run lint      # eslint + prettier check
npm run build     # tsc
```

Il progetto è sviluppato in TDD: ogni comando/middleware ha i suoi test. La CI (`.github/workflows/ci.yml`) esegue lint+build+test su ogni PR.

## Contribuire un comando

I comandi vivono in `functions/src/telegram/commands/`, uno per file, registrati in `commands/index.ts`. Per una risposta statica bastano poche righe e **zero conoscenza di Effect**:

```ts
import { staticCommand } from "../CommandsProtocol.js";

export const salve = staticCommand(["/salve"], "Salve a te! 👋");
```

Poi aggiungi il comando all'array in `commands/index.ts` e un test in `commands.test.ts`. Vedi `_template.ts.example` per l'esempio completo (incluso un comando con servizi e errori tipizzati via `defineCommand`).

## Deploy e operazioni

- **Deploy automatico**: push su `main` → `.github/workflows/deploy.yml` (auth Google via Workload Identity Federation, setup one-shot con `infra/setup-deploy-wif.sh`).
- **Secrets runtime**: `TELEGRAM_BOT_KEY` e `TELEGRAM_WEBHOOK_SECRET` in Secret Manager (`firebase functions:secrets:set`). Per l'emulatore functions: `functions/.secret.local` (gitignorato).
- **Webhook**: dopo il primo deploy, registra il webhook con `TELEGRAM_BOT_KEY=… WEBHOOK_URL=… TELEGRAM_WEBHOOK_SECRET=… npm run webhook:set` (imposta anche `allowed_updates`, necessario per gli eventi di join). **Da rilanciare dopo ogni modifica ad `allowed_updates`** (come l'aggiunta di `message_reaction`/`message_reaction_count` in questa PR): altrimenti Telegram continua a usare la lista registrata l'ultima volta e il tracking reazioni non riceve update.
- **TTL Firestore**: `infra/setup-firestore-ttl.sh` abilita l'eliminazione automatica dei dati di attività (~90 giorni dall'ultima attività).

Il runbook completo (rotazione token, cutover, ruoli IAM) è nel bundle di conoscenza [`.okf/`](.okf/index.md).

## Privacy

Il bot salva per ogni membro solo: user id, username, timestamp di ultima attività e di ingresso nel gruppo. Per i messaggi del gruppo salva inoltre solo: chat id, message id e conteggio delle reazioni ricevute (mai il testo del messaggio). Per i referral salva solo: user id, username, link d'invito personale e conteggio inviti. In tutti i casi i dati scadono automaticamente 90 giorni dopo l'ultimo aggiornamento e non sono accessibili a client esterni (Firestore rules deny-all).
