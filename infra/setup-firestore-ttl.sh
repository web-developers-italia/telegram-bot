#!/usr/bin/env bash
#
# Abilita la TTL policy su members_activity.lastActivity: Firestore elimina
# automaticamente i documenti quando il timestamp è più vecchio della policy.
# Retention effettiva: il codice scrive lastActivity a ogni messaggio, quindi
# restano solo i membri inattivi da oltre la finestra TTL (~privacy by design).
#
# Idempotente: rilanciarlo è sicuro (l'update di una policy esistente è no-op).
#
# Nota: la TTL usa il valore del campo stesso; per una retention di ~90 giorni
# il codice deve scrivere in lastActivity il timestamp corrente (già così) e
# la policy va combinata con il campo `expiresAt` SOLO se si volesse una
# finestra diversa dal "ultimo aggiornamento". Qui la scelta di prodotto è:
# un membro sparisce dal tracking 90 giorni dopo l'ultima attività — quindi
# il campo TTL è `expiresAt`, scritto dal codice come lastActivity + 90gg.

set -euo pipefail

PROJECT_ID="wdi-telegram-bot"

gcloud firestore fields ttls update expiresAt \
  --collection-group=members_activity \
  --enable-ttl \
  --project="${PROJECT_ID}"

echo "TTL policy attiva su members_activity.expiresAt (eliminazione ~90gg dopo l'ultima attività, campo scritto dal codice)."
