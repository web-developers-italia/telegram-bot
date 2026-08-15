# infra

Bootstrap dell'infrastruttura GCP del bot come **codice** (OpenTofu), in
`terraform/`. Sostituisce i vecchi script `gcloud` imperativi.

## Cosa gestisce `terraform/`

Progetto `wdi-telegram-bot`, region `europe-west1`:

- **API** abilitate (Cloud Run/Functions, Artifact Registry, Eventarc, Cloud
  Build, Secret Manager, Firestore, Firebase, Pub/Sub, Storage, …).
- **Service account di deploy** `github-deploy@…` (app) con i ruoli per il
  deploy gen2 di Functions/Firestore via WIF.
- **Workload Identity Federation**: pool + provider OIDC limitati al repository
  `web-developers-italia/telegram-bot`.
- **Firestore** (database `(default)` + **TTL** su `members_activity.expiresAt`,
  `message_reactions.expiresAt` e `referrals.expiresAt`, ~90gg).
- **Secret Manager**: contenitori `TELEGRAM_BOT_KEY`/`TELEGRAM_WEBHOOK_SECRET`
  + accesso in lettura per il runtime SA. **I valori NON stanno in Terraform.**

## Stato remoto e CI/CD

Lo stato vive su GCS (`gs://wdi-telegram-bot-tfstate`, versioning on) così CI e
admin locali condividono lo stesso stato con locking.

- **`infra-plan.yml`** gira su ogni PR che tocca `infra/terraform/**`: `fmt`,
  `validate`, `plan` (il piano finisce nello step summary della PR). Non applica
  nulla.
- **`infra-apply.yml`** gira sul merge in `main`: `tofu apply -auto-approve`,
  ma **gated** dall'Environment GitHub `infra` (required reviewers): l'apply
  attende un'approvazione umana prima di partire.

Entrambi si autenticano via WIF come **`github-infra@…`**, un SA dedicato con i
ruoli IAM-admin necessari (separato da `github-deploy`, così il deploy dell'app
resta a privilegio minimo).

## Bootstrap seeds (una tantum, fuori da Terraform)

Questi esistono prima che Terraform possa girare in CI e **non** sono gestiti
dalla config (per non far sì che Terraform si tolga la terra da sotto i piedi):

1. Progetto GCP + billing (permessi org/billing).
2. Bucket di stato: `gcloud storage buckets create gs://wdi-telegram-bot-tfstate --location europe-west1 --uniform-bucket-level-access --public-access-prevention` + `--versioning`.
3. SA CI infra `github-infra@…` con ruoli `resourcemanager.projectIamAdmin`,
   `iam.serviceAccountAdmin`, `iam.workloadIdentityPoolAdmin`,
   `serviceusage.serviceUsageAdmin`, `datastore.owner`, `secretmanager.admin`,
   `firebase.admin`, `storage.objectAdmin` (sul solo bucket di stato), + binding
   WIF per il repo.
4. GitHub secrets: `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA` (app), `GCP_INFRA_SA` (infra).

> **Nota sicurezza.** `github-infra` può gestire IAM di progetto: è potente per
> definizione. È vincolato via WIF al solo repo e usato solo dai workflow infra;
> l'apply su `main` è protetto dalla branch protection (merge via PR).

## Uso locale (admin, per debug/convergenza fuori CI)

```sh
cd infra/terraform
export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)
tofu init      # backend GCS
tofu plan
tofu apply
```

## Valori dei secret (fuori da Terraform)

I contenitori sono creati da Terraform; le **versioni** (i valori) si aggiungono
a parte:

```sh
printf '%s' "$BOT_TOKEN" | gcloud secrets versions add TELEGRAM_BOT_KEY --data-file=- --project wdi-telegram-bot
openssl rand -hex 32 | tr -d '\n' | gcloud secrets versions add TELEGRAM_WEBHOOK_SECRET --data-file=- --project wdi-telegram-bot
```

## Nota su TELEGRAM_BOT_KEY

`TELEGRAM_BOT_KEY` vive in **due** posti: Secret Manager (runtime del bot) **e**
GitHub secret, perché i workflow di notifica Telegram lo leggono da lì e non
passano da GCP. Non cancellare il GitHub secret. Vedi la
[rotazione del token](../.okf/runbooks/token-rotation.md).
