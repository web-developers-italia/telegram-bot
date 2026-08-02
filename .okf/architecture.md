---
type: Architecture
title: Architettura del bot
description: Come il bot riceve gli update, li elabora con Effect e dove salva i dati
tags: [grammy, effect, firebase, functions-v2, firestore]
resource: functions/src
generated:
  by: claude-fable-5/2026-08
  at: "2026-08-02"
status: stable
---

# Architettura

```
Telegram ──webhook(secret token)──▶ Cloud Function v2 `telegram-webhook`
                                     (europe-west1, Node 22, ESM)
                                       │  webhookCallback(bot, "express")
                                       ▼
                                  grammY Bot (adapter I/O)
                                       │  runCommand: Effect boundary
                                       ▼
                     programmi Effect (comandi + middleware)
                     servizi Layer: BotConfig · Github · Members
                                       │
                                       ▼
                                  Firestore (members_activity, bot_state)
```

## Boundary Effect

- grammY è **solo** l'adapter I/O. Ogni comando/middleware è un programma
  `Effect<void, CommandError, Deps>` ([CommandsProtocol](/functions/src/telegram/CommandsProtocol.ts)).
- `runCommand` ([runCommand.ts](/functions/src/telegram/runCommand.ts)): adatta il
  ctx grammY alla **porta stretta** `TelegramCtx` (per-call via `Effect.provideService`,
  mai nel layer), **chiude il canale errori** (reply di cortesia per tag; solo log per
  `TelegramApiError`) e esegue su un `ManagedRuntime` creato una volta per istanza,
  mai disposed (su GCF i finalizer non girano: vietati layer con finalizer critici).
- I 5 comandi a reply statica usano `staticCommand` e non toccano Tag/Layer:
  il contributo minimo non richiede di conoscere Effect.

## Entry point

- Produzione: [functions/src/index.ts](/functions/src/index.ts) — `onRequest` v2 con
  **lazy init** (i secret `defineSecret` sono leggibili solo a runtime; grammY rifiuta
  token vuoti), secret webhook via header `X-Telegram-Bot-Api-Secret-Token`.
- Sviluppo: [functions/src/dev.ts](/functions/src/dev.ts) — long polling, niente tunnel.

## Vincoli noti

- Budget GitHub 5s + niente retry su rate-limit: il webhook deve rispondere entro il
  `timeoutMilliseconds` (20s) o Telegram ri-consegna l'update (retry amplificato).
- La funzione si chiama `telegram-webhook` (la gen1 si chiamava `telegram-bot`;
  vedi [decisione modernizzazione](/decisions/modernizzazione-2026.md)).
