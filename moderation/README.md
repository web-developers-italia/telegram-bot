# Pulizia inattivi (review-gated)

Sistema GitOps per rimuovere dal gruppo i membri inattivi, con revisione umana
prima di ogni kick.

## Flusso

1. **Detection** (mensile, [`inactive-cleanup.yml`](/.github/workflows/inactive-cleanup.yml)):
   `functions/scripts/detect-inactive.ts` legge `members_activity`, seleziona
   chi non scrive da più di `THRESHOLD_DAYS` (60) e scrive la lista in
   [`pending-kicks.json`](pending-kicks.json).
2. **PR di review**: se il file è cambiato (cioè ci sono candidati),
   `peter-evans/create-pull-request` apre una PR con il diff da revisionare
   e mergiare (o chiudere per annullare).
3. **Apply al merge** ([`apply-kicks.yml`](/.github/workflows/apply-kicks.yml)):
   `functions/scripts/apply-kicks.ts` esegue ban+unban (kick rejoinabile) di
   ogni candidato via Bot API, avvisa il gruppo con un riepilogo, e resetta
   `pending-kicks.json` a candidati vuoti (commit automatico).

## Caveat

- **Tracciamo solo chi ha scritto**: `members_activity` si popola quando un
  utente manda un messaggio. I "lurker" (mai scritto) non ci sono, e la Bot
  API di Telegram non permette di elencare i membri di un gruppo. Il sistema
  agisce quindi solo sugli utenti noti, non su tutti i membri effettivi.
- **Soglia 60gg < TTL 90gg**: `THRESHOLD_DAYS` in
  [`functions/src/moderation/inactive.ts`](/functions/src/moderation/inactive.ts)
  deve restare sotto la retention di 90gg di `members_activity` (vedi
  `infra/terraform/main.tf`, `google_firestore_field.members_ttl`). Se la
  soglia raggiungesse o superasse 90gg, il TTL avrebbe già cancellato i
  documenti degli inattivi prima che la detection possa vederli.
- **Kick, non ban**: `banChatMember` + `unbanChatMember(only_if_banned: true)`
  rimuove l'utente ma gli permette di rientrare col link del gruppo.
