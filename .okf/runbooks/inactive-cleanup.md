---
type: Runbook
title: Pulizia inattivi (review-gated)
description: Detection schedulata dei membri inattivi, PR di review e kick rejoinabile al merge
tags: [moderation, firestore, ci, telegram]
resource: moderation
generated:
  by: claude-sonnet-5/2026-08
  at: "2026-08-03"
status: stable
---

# Flusso

1. **Detection** (mensile, `0 9 1 * *`, o `workflow_dispatch`):
   [`inactive-cleanup.yml`](/.github/workflows/inactive-cleanup.yml) esegue
   [`functions/scripts/detect-inactive.ts`](/functions/scripts/detect-inactive.ts),
   che legge `members_activity` (auth via WIF come `github-moderation@…`,
   sola lettura `roles/datastore.viewer`) e scrive i candidati in
   [`moderation/pending-kicks.json`](/moderation/pending-kicks.json) usando
   `selectInactive` da
   [`functions/src/moderation/inactive.ts`](/functions/src/moderation/inactive.ts).
2. **PR di review**: `peter-evans/create-pull-request` apre una PR solo se il
   file è cambiato (quindi solo se ci sono candidati). La PR va revisionata
   e mergiata (o chiusa per annullare la pulizia di quel mese).
3. **Apply al merge**: [`apply-kicks.yml`](/.github/workflows/apply-kicks.yml)
   (trigger: push su `main` che tocca `moderation/pending-kicks.json`) esegue
   [`functions/scripts/apply-kicks.ts`](/functions/scripts/apply-kicks.ts):
   ban+unban (`only_if_banned: true`, quindi kick rejoinabile) di ogni
   candidato via Bot API, messaggio di riepilogo al gruppo, poi commit di
   reset del file a candidati vuoti (identità `github-actions[bot]`). Il
   commit di reset ritrigghera il workflow ma, con candidati vuoti, lo script
   esce subito senza scrivere: il loop si ferma da solo.

# Soglia e vincolo col TTL

`THRESHOLD_DAYS = 60` in `inactive.ts`. **Deve restare sotto i 90gg di TTL**
di `members_activity` (`infra/terraform/main.tf`,
`google_firestore_field.members_ttl`): a 90gg o oltre, Firestore avrebbe già
cancellato i documenti degli inattivi prima che la detection possa vederli.

# Caveat

Tracciamo solo chi ha scritto almeno un messaggio: i lurker non compaiono in
`members_activity` e la Bot API non elenca i membri di un gruppo. Il sistema
agisce quindi solo sugli utenti noti, non su tutti i membri effettivi.

# Infra

SA dedicato `github-moderation@…` (sola lettura, `roles/datastore.viewer`),
vincolato via WIF allo stesso repo di `github-deploy`
(`infra/terraform/main.tf`). Secret GitHub: `GCP_MODERATION_SA`.

Vedi anche [`moderation/README.md`](/moderation/README.md).
