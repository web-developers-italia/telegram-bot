---
type: Catalog
title: Catalogo comandi e automatismi
description: Tutti i trigger del bot, il loro comportamento e dove vivono nel codice
tags: [comandi, telegram]
resource: functions/src/telegram/commands
generated:
  by: claude-fable-5/2026-08
  at: "2026-08-02"
status: stable
---

# Comandi

| Trigger | File | Comportamento | Errori tipizzati |
|---|---|---|---|
| `/start` | `start.ts` | DM: benvenuto + InlineKeyboard (Entra nel gruppo, Regolamento via deep-link `?start=regole`) | — |
| `/regolamento` `/regole` `/rules` | `rules.ts` | Regolamento + link repo | — |
| `/ping` | `pong.ts` | `/pong 🏓` | — |
| `/learn` | `learn.ts` | Risorse per iniziare (reply al quotato se presente) | — |
| `/dontasktoask` `/nonchiederedichiedere` | `dontasktoask.ts` | Invito a domande dirette | — |
| `/rielabora` | `rielabora.ts` | Solo in reply: manda regole, cancella il quotato, menziona l'autore | `MissingReply` |
| `/contribute` `/contribuisci` | `contribute.ts` | Repo + PR/issue aperte (cache 5 min, split `pull_request`) | `GithubRateLimited`, `GithubUnavailable` |
| `@admin` `/admin` | `admin.ts` | Mention invisibili agli admin umani | `NotAGroup` |
| `/stats` | `stats.ts` | Attivi 7/30 giorni (solo admin) | `NotAGroup`, `NotAdmin`, `StorageError` |

# Automatismi (middleware)

| Evento | File | Comportamento |
|---|---|---|
| ogni messaggio | `middleware/trackActivity.ts` | Aggiorna `members_activity` (throttle 15 min per istanza) |
| messaggio "come canale" | `middleware/channelBan.ts` | Ban del sender_chat + delete + avviso (esclusi auto-forward) |
| messaggio con link | `middleware/linkGuard.ts` | Se l'autore è entrato da <24h: delete + avviso (niente ban) |
| join (`chat_member`) | `middleware/welcome.ts` | Benvenuto; un solo welcome vivo per chat; cap 60s anti mass-join |
| schedulato (mensile) | `inactive-cleanup.yml` → `apply-kicks.yml` | Rileva inattivi >60gg, apre PR di review, kick rejoinabile al merge — vedi [pulizia inattivi](runbooks/inactive-cleanup.md) |

# Come si aggiunge un comando

Vedi il template [`_template.ts.example`](/functions/src/telegram/commands/_template.ts.example)
e la sezione "Contribuire un comando" del [README](../README.md). Regola TDD: prima il
test in `commands.test.ts`, poi l'implementazione, poi la registrazione in `index.ts`.
