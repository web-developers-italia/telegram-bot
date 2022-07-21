# Web Developers Italia Community bot

Questo bot aiuta a gestire il gruppo di [Web Developers Italia](https://t.me/webdevitalia), mettendo a disposizione una serie di strumenti.

## Dettagli tecnici

Il bot è costruito su Telegraf e Firebase. Utilizza un avvio tramite Webhook manuale.

## Sviluppo e test

1. Installa e configura [ngrok](https://ngrok.com/) o un altro strumento di local tunneling equivalente

2. Clona la repository

3. Installa le dipendenze con `npm install`

4. Assicurati di essere loggato in Firebase CLI eseguendo `npx firebase login`

5. Apporta le tue modifiche che vuoi suggerire

6. Testa le modifiche seguendo le istruzioni qui sotto, pusha e poi invia una Pull Request.

Assicurati di aver creato un bot di test attraverso l'uso del [BotFather](https://t.me/BotFather) e di averne copiato il token.

Crea un file `.env` dentro la cartella `functions/` e inserisci il seguente contenuto, rimpiazzando il token di esempio con quello ottenuto dal BotFather.

```env
TELEGRAM_BOT_KEY="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
```

---

Esegui le functions in locale. Eseguendo il comando qui sotto, lo strumento CLI di Firebase ti mostrerà l'indirizzo, la porta e l'indirizzo delle cloud functions esposte.

```sh
$ npm run serve
```

**Esempio di output**

```
✔  functions[europe-west1-telegram-webdevitalia-default]: http function initialized (http://localhost:5001/insieme-dev-4450f/europe-west1/telegram-webdevitalia-default).
```

Al momento della scrittura ne è presente solo una, chiamata come segue. La composizione del nome è dettata da come vengono esportate le variabili.

```
telegram-webdevitalia-default
```

---

In un altra finestra terminale, aprire ngrok o un programma alternativo ed eseguire il seguente comando:

```sh
$ ngrok http 5001
```

Dove **5001** è la porta che `npm run serve` ha aperto per voi nell'altra cli.

**Esempio output**:

```sh
Forwarding    https://c4b8-93-34-146-64.ngrok.io -> http://localhost:5001
```

---

Apri quindi una nuova tab del browser ed recati al seguente indirizzo, prestando attenzione a rimpiazzare i placeholder, descritti sotto:

```
https://api.telegram.org/bot<bot-token>/setWebhook?url=<url-webhook>
```

- \<bot-boken\> => il token del bot ottenuto da BotFather
- <\url-webhook\> => È l'url restiuito da `npm run serve` con l'URL _forwarded_ da ngrok al posto del dominio.

Quindi se `npm run serve` ha restituito:

```
http://localhost:5001/insieme-dev-4450f/europe-west1/telegram-webdevitalia-default
```

E `ngrok` ha restituito

```
https://c4b8-93-34-146-64.ngrok.io
```

L'url del webhook sarà

```
https://c4b8-93-34-146-64.ngrok.io/insieme-dev-4450f/europe-west1/telegram-webdevitalia-default
```

Quindi l'url, ad esempio, verso cui fare la richiesta sarà:

```
https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook?url=https://c4b8-93-34-146-64.ngrok.io/insieme-dev-4450f/europe-west1/telegram-webdevitalia-default
```

La richiesta verso questo URL va eseguita ogni volta che riavvierete ngrok o cambiate token del bot. Ngrok, a meno di necessità particolari, non necessità di venir riavviato.

---

Invia quindi un comando sul tuo bot per verificare che risponda correttamente. Verifica eventuali errori nella console dove hai eseguito `npm run serve`.
