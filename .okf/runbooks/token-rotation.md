---
type: Runbook
title: Rotazione del token del bot
description: Procedura per ruotare TELEGRAM_BOT_KEY in tutte le sedi senza downtime prolungato
tags: [secrets, security, telegram]
generated:
  by: claude-fable-5/2026-08
  at: "2026-08-02"
status: stable
---

# Quando

- Al primo rollout della v2 (il webhook è stato esposto per anni senza secret token).
- A ogni sospetto di compromissione, o a rotazione periodica.

# Procedura

1. **BotFather** → `/revoke` sul bot → nuovo token (il vecchio smette subito di funzionare).
2. **Secret Manager**: `firebase functions:secrets:set TELEGRAM_BOT_KEY` (nuova versione).
3. **Redeploy** delle functions (le istanze leggono il secret al deploy):
   `git commit --allow-empty -m "chore: rotate bot token" && git push` oppure
   `npm run deploy` da locale.
4. **GitHub secret** (workflow di notifica): `gh secret set TELEGRAM_BOT_KEY --repo web-developers-italia/telegram-bot`.
5. **Webhook**: `npm run webhook:set` col nuovo token (il webhook è legato al bot, va ri-registrato).
6. Verifica: `getWebhookInfo` senza errori + un `/ping` nel gruppo.

Finestra di downtime: dal punto 1 al punto 5 il bot non risponde (minuti). Farlo in orario di basso traffico.
