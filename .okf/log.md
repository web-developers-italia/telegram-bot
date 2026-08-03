# Update Log

## 2026-08-03
* **Pulizia inattivi review-gated (#71)**: nuova logica pura
  [`functions/src/moderation/inactive.ts`](../functions/src/moderation/inactive.ts)
  (`selectInactive`, soglia 60gg < TTL 90gg) + script
  `functions/scripts/detect-inactive.ts` / `apply-kicks.ts` (tsx, non compilati).
  Due workflow: [`inactive-cleanup.yml`](../.github/workflows/inactive-cleanup.yml)
  (mensile, apre PR con i candidati) e
  [`apply-kicks.yml`](../.github/workflows/apply-kicks.yml) (al merge, kick
  rejoinabile + avviso gruppo + reset del file). Nuovo SA read-only
  `github-moderation` (`roles/datastore.viewer`, WIF) in
  [infra/terraform/main.tf](../infra/terraform/main.tf). Dettagli e caveat nel
  nuovo [runbook](runbooks/inactive-cleanup.md) e in
  [`moderation/README.md`](../moderation/README.md).

## 2026-08-02
* **Creation**: bundle iniziale con la modernizzazione 2026 — [architettura](architecture.md), [comandi](commands.md), [dati](data/members-activity.md), [runbook deploy](runbooks/deploy.md), [rotazione token](runbooks/token-rotation.md), [decisioni](decisions/modernizzazione-2026.md).

## 2026-08-02 (rollout)
* **Cambio progetto GCP**: creato `wdi-telegram-bot` (il vecchio `insieme-dev-4450f` non è accessibile); aggiornati [.firebaserc](../.firebaserc), deploy.yml, script infra e [runbook deploy](runbooks/deploy.md); decisione n.11 in [modernizzazione-2026](decisions/modernizzazione-2026.md).
* **Ruoli deploy SA**: [infra/terraform](../infra/terraform) — set ruoli del SA `github-deploy` ampliato per il primo deploy gen2 (Cloud Run/Artifact Registry/Cloud Build/Eventarc + secrets + firebase.admin), oltre a Firestore rules e `iam.serviceAccountUser`. Vedi [runbook deploy](runbooks/deploy.md).
* **Fix deploy CI**: `ORG_NAME`/`REPOSITORY_NAME` da `defineString` (che in CI non-interattiva chiedeva un valore malgrado il default) a costanti hardcoded in `functions/src/services/BotConfig.ts` — org e repo non variano per ambiente.
* **API + serviceUsageAdmin**: [infra/terraform](../infra/terraform) — pre-abilitate le API extra che firebase-tools tocca al primo deploy gen2 (cloudbilling, firebaseextensions, pubsub, storage, logging, cloudscheduler) e SA deploy passato a `serviceusage.serviceUsageAdmin` per auto-abilitare API future.
* **Rollout completato**: bot di produzione `@web_dev_italia_bot` migrato su `wdi-telegram-bot` (gen2 `telegram-webhook`, europe-west1), webhook ripuntato, secret token attivo, `/ping`→`/pong` verificato in produzione. La gen1 sul vecchio progetto `insieme-dev-4450f` è inerte (nessun update le arriva più). Convergenza IaC residua: un `tofu apply` per allineare `serviceUsageAdmin` e adottare in state le API pre-abilitate via gcloud (non bloccante).
* **Infra in CI/CD**: stato Terraform migrato su GCS (`wdi-telegram-bot-tfstate`); SA dedicato `github-infra` (IAM-admin, WIF); workflow `infra-plan.yml` (plan su PR) e `infra-apply.yml` (apply su merge). `deploy.yml` filtrato sui path dell'app. Vedi [infra/README](../infra/README.md).
* **Gate infra-apply**: attivato l'Environment GitHub `infra` con required reviewer (scaccogatto); `infra-apply.yml` ora usa `environment: infra` → l'apply attende approvazione umana. Notify Telegram lasciati attivi (scelta utente).
* **Comando `/start` (#64)**: onboarding in DM con benvenuto + InlineKeyboard (Entra nel gruppo → t.me/webdevitalia, Regolamento → deep-link `?start=regole`). Estesi la porta `TelegramCtx` (payload comando + `replyMarkup`) e `BotConfig` (groupUrl, botUsername). Test TDD in `commands.test.ts`.
