# Product

<!-- impeccable:product-schema 1 -->

Nota: interview saltata su direttiva esplicita dell'utente ("non fermarti a chiedere"); i fatti vengono dal repo (README, regolamento, codice bot). Le voci inferite sono marcate [ASSUNTO].

## Platform

web

## Stack

static HTML/CSS self-contained in `site/` (deploy su GitHub Pages via Actions; vincolo committato nel repo: zero richieste esterne, niente CDN/webfont remoti, tutto inline o locale).

## Users

Sviluppatori web italiani: frontend, backend, DevOps, dal junior che studia al senior che lavora. Situazione tipica [ASSUNTO]: telefono o secondo monitor, in pausa o la sera, stanchi di gruppi morti o pieni di spam; cercano un posto dove fare una domanda tecnica e ricevere risposte da pari, in italiano.

## Product Purpose

Il "prodotto" è il gruppo Telegram Web Developers Italia (t.me/webdevitalia): community italiana quotidiana di sviluppatori web. La landing esiste per farsi trovare su Google (query tipo "gruppo telegram sviluppatori web") e convertire il visitatore in membro. Successo = tap su "Entra nel gruppo".

## Positioning

Un gruppo italiano con regole dure contro il rumore che altrove non esistono: offerte di lavoro solo con RAL o range, niente spam, "non chiedere di chiedere", moderazione attiva 24/7 fatta da un bot open source (grammY + Effect) che chiunque può leggere e migliorare. La community possiede la propria infrastruttura.

## Operating Context

Telegram è il luogo reale del prodotto: bolle di chat, reply, reaction, comandi bot (/regole, /learn, /contribute, /start). Il repo GitHub è pubblico e riceve PR dei membri. Automatismi reali: welcome ai nuovi, blocco link nelle prime 24h, ban dei messaggi "come canale", pulizia inattivi review-gated, job day settimanale, digest settimanale dei messaggi top per reazioni, referral con link personali.

## Capabilities and Constraints

- La pagina deve restare self-contained: nessuna richiesta esterna (niente webfont remoti, CDN, analytics). Font di sistema.
- SEO è un requisito di prodotto (la pagina è la leva "landing SEO" del piano crescita): head completo, canonical https://web-developers-italia.github.io/telegram-bot/, sitemap e robots esistenti da preservare.
- Light e dark entrambi supportati via prefers-color-scheme.
- Accessibilità: contrasto AA, un solo H1, semantica pulita (già verificata con html-validate).
- Lingua: italiano.
- Numeri di membri/attività NON disponibili come fatto verificato: non inventare metriche.

## Brand Commitments

- Nome: "Web Developers Italia" (non abbreviare nel titolo).
- Copy: separatore " - ", mai em-dash (regola di stile del maintainer).
- Tono del gruppo: diretto, pratico, zero hype; il regolamento parla per ✅/❌.
- Il blu Telegram-family è il colore storico del bot/gruppo [ASSUNTO: non vincolante come tinta esatta, vincolante come familiarità].

## Evidence on Hand

- Regolamento reale in `functions/src/telegram/commands/rules.ts` (✅/❌, RAL obbligatoria, ecc.).
- Risorse reali in `functions/src/telegram/commands/learn.ts` (roadmap.sh, MDN, freeCodeCamp, ...).
- Comandi bot reali: /regole, /learn, /contribute, /start (+ /invito in arrivo su questo branch).
- Repo pubblico: https://github.com/web-developers-italia/telegram-bot
- Privacy vera: il bot salva solo id, username, timestamp e conteggi, mai i testi; retention 90 giorni.
- ASSENZE da non fabbricare: numero membri, testimonial, loghi aziende, screenshot reali della chat (le conversazioni mostrate in pagina vanno etichettate come illustrative).

## Product Principles

1. Prova, non affermare: mostra com'è il gruppo dentro (domande vere per forma, regole vere), non slogan.
2. Le regole sono il brand: la durezza anti-rumore è il motivo per entrare, va esibita, non nascosta.
3. Un'unica azione: tutto converge su "Entra nel gruppo".
4. Verità tecnica: la pagina di una community di dev è essa stessa un artefatto tecnico giudicato da dev; craft del codice = credibilità.
5. Niente metriche inventate, niente persone inventate spacciabili per reali.
