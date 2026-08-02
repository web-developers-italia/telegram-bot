# infra

Bootstrap dell'infrastruttura GCP del bot come **codice** (OpenTofu), in
`terraform/`. Sostituisce i vecchi script `gcloud` imperativi.

## Cosa gestisce `terraform/`

Progetto `wdi-telegram-bot`, region `europe-west1`:

- **API** abilitate (Cloud Run/Functions, Artifact Registry, Eventarc, Cloud
  Build, Secret Manager, Firestore, Firebase, IAM, …).
- **Service account di deploy** `github-deploy@…` con i ruoli minimi
  (`cloudfunctions.developer`, `firebaserules.admin`, `iam.serviceAccountUser`).
- **Workload Identity Federation**: pool + provider OIDC limitati al repository
  `web-developers-italia/telegram-bot`, così GitHub Actions deploya senza chiavi
  statiche.
- **Firestore** (database `(default)` + **TTL** su `members_activity.expiresAt`,
  ~90gg).
- **Secret Manager**: i contenitori `TELEGRAM_BOT_KEY` e `TELEGRAM_WEBHOOK_SECRET`
  + accesso in lettura per il runtime SA. **I valori NON stanno in Terraform**
  (vedi sotto).

## Uso (bootstrap una tantum, da un admin del progetto)

Prerequisiti fuori da Terraform (richiedono permessi org/billing): creazione del
progetto e collegamento del billing account.

```sh
cd infra/terraform
export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)  # niente ADC separate
tofu init
tofu apply
```

Lo stato è **locale e non committato** (`.gitignore`): il bootstrap è un'azione
rara fatta da un admin. Per un uso a più mani, spostare lo stato su un backend
GCS. `<!-- ponytail: stato locale per un bootstrap solo; backend GCS se serve condivisione -->`

Gli `output` danno i due valori da mettere nei GitHub secrets:

```sh
tofu output -raw wif_provider   # -> gh secret set GCP_WIF_PROVIDER
tofu output -raw deploy_sa_email # -> gh secret set GCP_DEPLOY_SA
```

## Valori dei secret (fuori da Terraform)

I contenitori sono creati da Terraform; le **versioni** (i valori) si aggiungono
a parte, così non finiscono nello stato:

```sh
printf '%s' "$BOT_TOKEN"      | gcloud secrets versions add TELEGRAM_BOT_KEY --data-file=- --project wdi-telegram-bot
openssl rand -hex 32 | tr -d '\n' | gcloud secrets versions add TELEGRAM_WEBHOOK_SECRET --data-file=- --project wdi-telegram-bot
```

## Nota su TELEGRAM_BOT_KEY

`TELEGRAM_BOT_KEY` vive in **due** posti: Secret Manager (runtime del bot) **e**
GitHub secret, perché i workflow di notifica Telegram
(`open_issue_telegram_notify.yml`, ecc.) lo leggono da lì e non passano da GCP.
Non cancellare il GitHub secret. Vedi la [rotazione del token](../.okf/runbooks/token-rotation.md).
