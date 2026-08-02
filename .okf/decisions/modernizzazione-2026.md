---
type: Decision
title: Modernizzazione 2026 — scelte e motivazioni
description: Le decisioni prese nella riscrittura di agosto 2026 e le loro alternative scartate
tags: [decisioni, grammy, effect, node, typescript, esm]
generated:
  by: claude-fable-5/2026-08
  at: "2026-08-02"
status: stable
sources:
  - id: telegraf-maintainer
    resource: https://github.com/telegraf/telegraf/discussions/1526
    title: "telegraf@future: NEW MAINTAINER NEEDED"
  - id: gen2-upgrade
    resource: https://firebase.google.com/docs/functions/2nd-gen-upgrade
    title: Upgrade 1st gen Node.js functions to 2nd gen
---

# Decisioni

| # | Decisione | Motivo | Alternativa scartata |
|---|---|---|---|
| 1 | **Telegraf → grammY** | Telegraf senza maintainer dal 2024 (ultima release feb 2024, supporto v4 finito feb 2025)[^telegraf-maintainer]; grammY attivo, TypeScript-first, `webhookCallback` serverless nativo | Restare su Telegraf 4.16.3 (framework morto) |
| 2 | **Node 22** | Unica LTS in GA su Cloud Functions (ago 2026); Node 24 è Active LTS ma runtime beta su GCF | Node 24 (bump pianificato appena GA: engines + .nvmrc) |
| 3 | **Functions gen1 → v2** | gen1 su Node 16 decommissionata, deploy impossibile; v2 = secrets nativi, params | Cloudflare Workers (avrebbe perso Firestore e la pipeline) |
| 4 | **Nome funzione nuovo `telegram-webhook`** | Firebase non fa upgrade in-place gen1→gen2 a parità di nome[^gen2-upgrade] | — |
| 5 | **ESM (`"type": "module"`)** | octokit@5 è ESM-only; NodeNext allineato all'ecosistema | CJS + `require(esm)` (fragile, dipende da TS/Node recenti) |
| 6 | **TypeScript 6.0** | Più recente supportato da typescript-eslint (`<6.1.0`); TS 7 (Go) uscito il 2026-08-02, toolchain non pronto | TS 7 (bloccato dal toolchain), TS 5.9 (downgrade inutile) |
| 7 | **Effect 3.x** | Scelta esplicita del maintainer: errori come valori, servizi iniettabili, TDD senza rete; 4.0 ancora beta | Effect 4.0-beta (instabile), niente FP runtime |
| 8 | **Effect solo dove paga** | 5 comandi su 7 sono reply statiche: `staticCommand` senza Tag/Layer per non alzare la barriera ai contributor | Effect ovunque (ergonomia contributor peggiore) |
| 9 | **Dev in long polling** | Zero tunnel/ngrok, zero setWebhook in dev; il webhook si esercita solo in prod | ngrok/cloudflared (attrito per i contributor) |
| 10 | **TTL 90gg su members_activity** | Dato personale raccolto e mai usato prima; ora usato (/stats, linkGuard) con retention e informativa | Tenere i dati per sempre (rischio GDPR) |

# Contesto

Il piano completo con la revisione che ha originato queste decisioni è stato
sottoposto a check avversariale (3 revisori indipendenti) prima dell'esecuzione;
i finding confermati sono integrati nell'implementazione (cutover esplicito,
lazy init dei secret, porta stretta TelegramCtx, `allowed_updates`, budget
GitHub 5s senza retry su rate-limit).

[^telegraf-maintainer]: Discussione ufficiale nel repo Telegraf, verificata il 2026-08-02.
[^gen2-upgrade]: Documentazione Firebase sull'upgrade gen1→gen2, verificata il 2026-08-02.
