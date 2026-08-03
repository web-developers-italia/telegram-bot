---
type: Runbook
title: Deploy, secrets e cutover
description: Come si deploya il bot, setup one-shot WIF/IAM, secrets e sequenza di cutover dalla gen1
tags: [deploy, firebase, wif, secrets, cutover]
resource: .github/workflows/deploy.yml
generated:
  by: claude-fable-5/2026-08
  at: "2026-08-02"
status: stable
stale_after: "2027-08-01"
---

> **Stato**: rollout completato il 2026-08-02. Il bot di produzione
> `@web_dev_italia_bot` gira su `wdi-telegram-bot` (funzione gen2
> `telegram-webhook`, europe-west1); il webhook punta al nuovo URL.

# Deploy ordinario

Push su `main` → [deploy.yml](/.github/workflows/deploy.yml): checkout → npm ci →
auth Google via **Workload Identity Federation** → `firebase-tools deploy
--only functions,firestore --force --project wdi-telegram-bot`.
La CI ([ci.yml](/.github/workflows/ci.yml)) fa lint+build+test su ogni PR.

# Setup one-shot (nuovo ambiente o primo rollout)

L'infrastruttura è **codice** ([infra/terraform](/infra/terraform), OpenTofu):
API, service account `github-deploy` + ruoli, WIF pool/provider OIDC, Firestore
+ TTL, contenitori dei secret + accesso runtime.

1. Prerequisiti fuori Terraform (permessi org/billing): creare il progetto e
   collegare il billing account.
2. `cd infra/terraform && export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token) && tofu init && tofu apply`.
3. GitHub secrets: `gh secret set GCP_WIF_PROVIDER --body "$(tofu output -raw wif_provider)"` e
   `gh secret set GCP_DEPLOY_SA --body "$(tofu output -raw deploy_sa_email)"`.
4. Valori dei secret (fuori dallo stato): `gcloud secrets versions add TELEGRAM_BOT_KEY --data-file=-`
   col token del BotFather, e `openssl rand -hex 32 | gcloud secrets versions add TELEGRAM_WEBHOOK_SECRET --data-file=-`.

Vedi [infra/README](/infra/README.md) per i dettagli. La TTL su
`members_activity.expiresAt` è gestita da Terraform (`google_firestore_field`).

**Infra in CI/CD**: dopo il seed, l'infra è gestita dai workflow
[infra-plan.yml](/.github/workflows/infra-plan.yml) (plan su PR che toccano
`infra/terraform/**`) e [infra-apply.yml](/.github/workflows/infra-apply.yml)
(apply sul merge in `main`), autenticati via WIF come SA dedicato `github-infra`.
Stato remoto su GCS. `tofu apply` locale resta possibile per admin (debug).
L'apply su merge è **gated**: attende l'approvazione di un reviewer
dell'Environment GitHub `infra` prima di partire.

# Cutover gen1 → v2 (eseguito una volta, ordine obbligato)

La vecchia gen1 (`telegram-bot`) vive nel **vecchio progetto** `insieme-dev-4450f`,
non accessibile con l'account attuale: il nuovo deploy va sul progetto
`wdi-telegram-bot` (decisione del 2026-08-02).

1. Deploy della v2 (`telegram-webhook` su `wdi-telegram-bot`).
2. `npm run webhook:set` con `WEBHOOK_URL` = URL della v2 — imposta anche
   `secret_token` e **`allowed_updates` completo** (senza, gli update `chat_member`
   del welcome non arrivano; una lista parziale disattiva i tipi non elencati).
3. Verifica `getWebhookInfo`: `pending_update_count` ≈ 0, nessun `last_error_message`.
4. La gen1 nel vecchio progetto resta inerte (nessun update le arriva più):
   chiedere al proprietario storico di `insieme-dev-4450f` la dismissione.

# Post-rollout

- Alert log-based su severity ERROR (Cloud Logging) + budget alert GCP.
- Ricontrollo `getWebhookInfo` a 24h.
- Nota doppia sede del token: `TELEGRAM_BOT_KEY` vive in Secret Manager (runtime)
  **e** come GitHub secret (workflow di notifica issue/PR): non cancellare il GH secret.
