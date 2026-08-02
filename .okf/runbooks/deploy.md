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

# Deploy ordinario

Push su `main` → [deploy.yml](/.github/workflows/deploy.yml): checkout → npm ci →
auth Google via **Workload Identity Federation** → `firebase-tools deploy
--only functions,firestore --force --project wdi-telegram-bot`.
La CI ([ci.yml](/.github/workflows/ci.yml)) fa lint+build+test su ogni PR.

# Setup one-shot (nuovo ambiente o primo rollout)

1. `infra/setup-deploy-wif.sh` — API, service account `github-deploy`, ruoli minimi
   (`cloudfunctions.developer`, `firebaserules.admin`, `iam.serviceAccountUser` sul
   runtime SA, `secretmanager.secretAccessor` al runtime SA sui due secret), pool/provider
   OIDC GitHub. Stampa i `gh secret set` per `GCP_WIF_PROVIDER` e `GCP_DEPLOY_SA`.
2. Secrets runtime: `firebase functions:secrets:set TELEGRAM_BOT_KEY` e
   `firebase functions:secrets:set TELEGRAM_WEBHOOK_SECRET` (genera il secret con
   `openssl rand -hex 32`).
3. `infra/setup-firestore-ttl.sh` — TTL policy su `members_activity.expiresAt`.

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
