---
type: Dataset
title: Firestore — members_activity e bot_state
description: Schema, scopo, retention e accessi delle collezioni Firestore del bot
tags: [firestore, dati, privacy, ttl]
resource: firestore/members_activity
generated:
  by: claude-fable-5/2026-08
  at: "2026-08-02"
status: stable
---

# Schema

## `members_activity/{userId}`

| Campo | Tipo | Scritto da | Uso |
|---|---|---|---|
| `username` | string \| null | trackActivity | Visualizzazione in /stats (futuro) |
| `lastActivity` | Timestamp (server) | trackActivity (throttle 15 min/istanza) | `/stats` (attivi 7/30gg) |
| `joinedAt` | Timestamp (server) | welcome (al join) | linkGuard (finestra 24h) |
| `expiresAt` | Timestamp (+90gg) | trackActivity, welcome | **TTL policy Firestore** |

## `bot_state/welcome_{chatId}`

| Campo | Tipo | Uso |
|---|---|---|
| `messageId` | number | Delete del welcome precedente (un solo welcome vivo) |
| `sentAtMs` | number | Cap anti mass-join (60s) |

# Retention & privacy

- TTL policy su `expiresAt` (attivata da [infra/setup-firestore-ttl.sh](/infra/setup-firestore-ttl.sh)):
  i documenti spariscono ~90 giorni dopo l'ultima attività.
- Rules deny-all ([firestore.rules](/firestore.rules), `rules_version = '2'`): nessun
  accesso client, solo Admin SDK dal backend.
- Informativa nel [README](../../README.md) sezione Privacy.

# Costi

Il throttle (15 min per istanza, in-memory) taglia le scritture rispetto alla
versione pre-2026 che scriveva a ogni messaggio.
