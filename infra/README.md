# infra

## setup-deploy-wif.sh

Configura, in modo idempotente, l'accesso di GitHub Actions a Google Cloud
(progetto `wdi-telegram-bot`) via Workload Identity Federation, al posto di
credenziali statiche (`FIREBASE_TOKEN`, chiavi JSON di service account).

Crea:

- il service account di deploy `github-deploy@wdi-telegram-bot.iam.gserviceaccount.com`
  con i ruoli minimi per deployare Functions/Firestore e impersonare il
  runtime SA;
- l'accesso in lettura ai secret `TELEGRAM_BOT_KEY` e `TELEGRAM_WEBHOOK_SECRET`
  per il runtime SA delle Functions;
- il Workload Identity Pool + Provider OIDC limitato al repository
  `web-developers-italia/telegram-bot`.

### Quando rilanciarlo

- Prima del primo deploy con il nuovo workflow (`.github/workflows/deploy.yml`).
- Se il progetto GCP, il nome del repository, o i secret usati a runtime
  cambiano.
- Dopo aver creato/rinominato i secret `TELEGRAM_BOT_KEY` o
  `TELEGRAM_WEBHOOK_SECRET` in Secret Manager, per applicare il binding IAM
  che lo script salta con un warning se il secret non esiste ancora.
- Non ha effetti collaterali distruttivi se rilanciato: puoi eseguirlo ogni
  volta che hai un dubbio sullo stato dei permessi.

### Dopo l'esecuzione

Lo script stampa i due valori da salvare come GitHub secrets del repository
(e i comandi `gh secret set` pronti all'uso):

- `GCP_WIF_PROVIDER`: resource name del provider OIDC.
- `GCP_DEPLOY_SA`: email del service account di deploy.

### Nota su TELEGRAM_BOT_KEY

`TELEGRAM_BOT_KEY` deve restare configurato anche come **GitHub secret**
(non solo in Secret Manager): i workflow di notifica Telegram
(`open_issue_telegram_notify.yml`, `close_issue_telegram_notify.yml`,
`open_pr_telegram_notify.yml`) lo leggono da li' e non passano da GCP.
