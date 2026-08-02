# Update Log

## 2026-08-02
* **Creation**: bundle iniziale con la modernizzazione 2026 — [architettura](architecture.md), [comandi](commands.md), [dati](data/members-activity.md), [runbook deploy](runbooks/deploy.md), [rotazione token](runbooks/token-rotation.md), [decisioni](decisions/modernizzazione-2026.md).

## 2026-08-02 (rollout)
* **Cambio progetto GCP**: creato `wdi-telegram-bot` (il vecchio `insieme-dev-4450f` non è accessibile); aggiornati [.firebaserc](../.firebaserc), deploy.yml, script infra e [runbook deploy](runbooks/deploy.md); decisione n.11 in [modernizzazione-2026](decisions/modernizzazione-2026.md).
* **Ruoli deploy SA**: [infra/terraform](../infra/terraform) — set ruoli del SA `github-deploy` ampliato per il primo deploy gen2 (Cloud Run/Artifact Registry/Cloud Build/Eventarc + secrets + firebase.admin), oltre a Firestore rules e `iam.serviceAccountUser`. Vedi [runbook deploy](runbooks/deploy.md).
* **Fix deploy CI**: `ORG_NAME`/`REPOSITORY_NAME` da `defineString` (che in CI non-interattiva chiedeva un valore malgrado il default) a costanti hardcoded in `functions/src/services/BotConfig.ts` — org e repo non variano per ambiente.
* **API + serviceUsageAdmin**: [infra/terraform](../infra/terraform) — pre-abilitate le API extra che firebase-tools tocca al primo deploy gen2 (cloudbilling, firebaseextensions, pubsub, storage, logging, cloudscheduler) e SA deploy passato a `serviceusage.serviceUsageAdmin` per auto-abilitare API future.
