---
okf_version: '0.2'
---

# Web Developers Italia — Telegram bot

Bundle di conoscenza del bot del gruppo. Partire da qui.

- [Architettura](architecture.md) — webhook, boundary Effect, entry points, vincoli
- [Catalogo comandi e automatismi](commands.md) — trigger, file, errori tipizzati
- [Dati Firestore](data/members-activity.md) — schema, TTL 90gg, privacy
- [Runbook: deploy, secrets e cutover](runbooks/deploy.md) — WIF, setup one-shot, sequenza gen1→v2
- [Runbook: rotazione token](runbooks/token-rotation.md) — procedura completa
- [Runbook: pulizia inattivi](runbooks/inactive-cleanup.md) — detection schedulata, PR di review, kick rejoinabile al merge
- [Decisioni: modernizzazione 2026](decisions/modernizzazione-2026.md) — perché grammY/Effect/Node22/ESM
