---
name: Web Developers Italia
description: Skin "Millennium" - la board italiana anni 2000 ricostruita con craft 2026, subSilver in light e board notturna in dark
colors:
  # Light "subSilver 2026" (:root in site/index.html)
  page: "#dfe8f4"
  panel: "#ffffff"
  panel-alt: "#eef4fb"
  bar-top: "#dcE9f8"
  bar-bottom: "#bcd4ec"
  bar-text: "#113a66"
  border: "#9db8d6"
  border-soft: "#c8d8ec"
  text: "#1c2c44"
  muted: "#4e6584"
  link: "#0b5aa5"
  link-visited: "#6a4a9c"
  accent: "#0b5aa5"
  cta: "#0f76c2"
  cta-deep: "#0b5aa5"
  cta-text: "#ffffff"
  sticky-bg: "#fdf3d7"
  sticky-border: "#e3c26e"
  sticky-text: "#7a5410"
  ok: "#14713d"
  "no": "#a92e3c"
  online: "#1d8a4e"
  new-badge: "#b12f2f"
  logo-fill: "#ffffff"
  logo-edge: "#0b3f74"
  logo-shadow: "#7ea9d4"
  head-band: "#0f2c50"
  head-band-2: "#123a68"
  head-text: "#e8f1fb"
  head-muted: "#a9c4e2"
  kbd-bg: "#10233c"
  kbd-text: "#bfe0ff"
  logo-italia: "#58c26e"
  # Dark "board notturna" (@media prefers-color-scheme: dark)
  page-dark: "#0d1522"
  panel-dark: "#141f31"
  panel-alt-dark: "#182539"
  bar-top-dark: "#1e3a61"
  bar-bottom-dark: "#16304f"
  bar-text-dark: "#cfe3fa"
  border-dark: "#2c4165"
  border-soft-dark: "#223350"
  text-dark: "#d9e4f3"
  muted-dark: "#91a7c4"
  link-dark: "#6fb4f5"
  link-visited-dark: "#b39ae0"
  accent-dark: "#6fb4f5"
  cta-dark: "#1f6fb4"
  cta-deep-dark: "#15507f"
  cta-text-dark: "#f2f8ff"
  sticky-bg-dark: "#2b2410"
  sticky-border-dark: "#6e5716"
  sticky-text-dark: "#ecc35c"
  ok-dark: "#56c187"
  "no-dark": "#ef7c88"
  online-dark: "#4cc38a"
  new-badge-dark: "#b93a3a"
  logo-fill-dark: "#eaf3fd"
  logo-edge-dark: "#0a2c52"
  logo-shadow-dark: "#071c33"
  head-band-dark: "#0a1626"
  head-band-2-dark: "#0e1f38"
  head-text-dark: "#e8f1fb"
  head-muted-dark: "#9db8d8"
  kbd-bg-dark: "#0a1626"
  kbd-text-dark: "#9fd2ff"
typography:
  display:
    fontFamily: "Verdana, Tahoma, 'DejaVu Sans', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 6.2vw, 3.4rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Verdana, Tahoma, 'DejaVu Sans', system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
  title:
    fontFamily: "Verdana, Tahoma, 'DejaVu Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "0.01em"
  body:
    fontFamily: "Verdana, Tahoma, 'DejaVu Sans', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Verdana, Tahoma, 'DejaVu Sans', system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.07em"
  meta:
    fontFamily: "Verdana, Tahoma, 'DejaVu Sans', system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.86em"
rounded:
  sm: "3px"
  md: "6px"
spacing:
  cell: "1rem"
  gutter: "1.25rem"
  stack: "1.7rem"
components:
  button-primary:
    backgroundColor: "{colors.cta}"
    textColor: "{colors.cta-text}"
    rounded: "{rounded.md}"
    padding: "0.72rem 1.35rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.head-text}"
    rounded: "{rounded.md}"
    padding: "0.72rem 1.35rem"
  board:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
  board-bar:
    backgroundColor: "{colors.bar-top}"
    textColor: "{colors.bar-text}"
    padding: "0.62rem 1rem"
  row-sticky:
    backgroundColor: "{colors.sticky-bg}"
    textColor: "{colors.sticky-text}"
  kbd:
    backgroundColor: "{colors.kbd-bg}"
    textColor: "{colors.kbd-text}"
    rounded: "{rounded.sm}"
    padding: "0.14em 0.5em"
  badge-new:
    backgroundColor: "{colors.new-badge}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.1rem 0.4rem"
  tag-sticky:
    textColor: "{colors.sticky-text}"
    rounded: "{rounded.sm}"
    padding: "0.05rem 0.4rem"
---

# Design System: Web Developers Italia

Registrato dal codice costruito (`site/index.html` + `site/favicon.svg`), non dalle intenzioni. Un solo artefatto: la landing statica self-contained della community Telegram.

## Overview

**Creative North Star: "Millennium"**

Il forum italiano dove questi dev sono cresciuti, ricostruito con craft 2026. La pagina non imita una SaaS-landing (niente hero a gradiente decorativo, niente card fluttuanti): imita una board phpBB dei primi anni 2000 e la rifà con gli strumenti di oggi (custom properties, `color-mix()`, `clamp()`, grid, `prefers-color-scheme`). Ogni superficie è un pezzo di forum: barre di categoria a gradiente, righe alternate, thread sticky ambra, firma del bot, paginazione "1 di 1".

La densità è da bacheca: testo piccolo e fitto (base 15px Verdana), tanti livelli di meta-testo, bordi 1px ovunque. Il tono visivo è nostalgico ma pulito: la nostalgia sta nella struttura (colonne autore, breadcrumb con "»", ospite in sola lettura), il 2026 sta nella resa (contrasto AA, focus ring, reduced-motion, dark mode nativa).

Anti-riferimento confermato (dal direction contract nel sorgente): la SaaS-landing a gradiente e card.

**Key Characteristics:**
- Doppia skin token-pari: "subSilver 2026" in light, "board notturna" in dark, via `prefers-color-scheme`
- Verdana ovunque; mono solo dentro `kbd`/`code` per i comandi del bot
- Barre di categoria a gradiente verticale 2-stop, righe alternate, sticky ambra
- Icone disegnate come SVG inline "pixel-web" (viewBox 16), mai emoji
- Contenitore 960px, bordi 1px, radius 3/6px, una sola ombra ambientale
- Self-contained: font di sistema, zero richieste esterne, tutto inline

## Colors

Palette da board azzurrina: blu strutturali freddi per la gerarchia, ambra per l'evidenza, verde/rosso semantici, il tutto duplicato in una skin notturna. I valori normativi sono nel frontmatter; ogni token light ha il gemello `-dark`.

### Primary
- **Blu link/accent** (`accent`, `link`): il blu forum classico. Colore dei link, delle icone di categoria (`fill: var(--accent)`), del focus ring e dell'avatar del bot.
- **Blu CTA** (`cta` sopra, `cta-deep` sotto): esiste solo come gradiente verticale dei bottoni e come bordo inferiore 4px della testata. `cta-text` è il testo del bottone.
- **Fascia di testata** (`head-band-2` sopra, `head-band` sotto, con `head-text` e `head-muted`): il portale scuro in cima, identico come ruolo in light e dark.

### Secondary
- **Ambra sticky** (`sticky-bg`, `sticky-border`, `sticky-text`): il trio dei thread in evidenza (righe sticky, tag "Importante"). Non è mai usata fuori dal materiale sticky.

### Tertiary (semantici)
- **Verde consentito** (`ok`) e **rosso vietato** (`no`): solo i mark SVG del regolamento.
- **Verde online** (`online`): pallino "bot online" (9px), ruolo "Amministratore", puntini typing.
- **Rosso badge** (`new-badge`): solo il chip "nuovo" pulsante.
- **Verde Italia** (`logo-italia`, #58c26e): la parola "Italia" nel logo. Hardcoded, identico nei due temi; unico colore fuori dal sistema a token.

### Neutral
- **Fondale** (`page`): l'azzurrino subSilver dietro tutto (in dark diventa il blu notte, che è anche il `theme-color` del meta: #0d1522).
- **Pannelli** (`panel` e `panel-alt`): superfici di board e thread; `panel-alt` fa le righe pari, la colonna autore e i quote.
- **Barre** (`bar-top`/`bar-bottom`/`bar-text`): il gradiente delle barre di categoria.
- **Bordi** (`border` strutturale, `border-soft` interno): la vera griglia della pagina.
- **Testo** (`text`, `muted`): corpo e meta-testo; `link-visited` (viola) distingue i link visitati.
- **Kbd** (`kbd-bg`, `kbd-text`): chip scuri dei comandi bot.
- **Logo** (`logo-fill`, `logo-edge`, `logo-shadow`): riempimento, doppio contorno e ombra dura del logotipo.

### Named Rules
**La Regola delle Due Skin.** Ogni colore vive come coppia di custom property su `:root` (light) e nel blocco `prefers-color-scheme: dark`; `color-scheme: light dark` è dichiarato. I componenti consumano solo `var()`, mai hex diretti. Unica eccezione canonizzata: il verde #58c26e di "Italia" nel logo.

**La Regola dell'Ambra Sticky.** L'evidenza è un materiale, non un'enfasi: ciò che è "in evidenza" usa il trio ambra, mai il blu accent e mai un rosso.

**La Regola del Visited.** I link visitati cambiano colore (viola `link-visited`): su una board la cronologia di lettura si vede.

## Typography

**Body Font:** Verdana (fallback Tahoma, "DejaVu Sans", system-ui, sans-serif)
**Mono Font:** ui-monospace ("SF Mono", Menlo, Consolas, monospace), solo per `code`/`kbd`

**Character:** Verdana a 15px con interlinea 1.65 è la voce dell'intera pagina: densa, onesta, da forum. Niente webfont, niente display face: il "display" è la stessa Verdana portata a 900 italico nel solo logotipo.

### Hierarchy
- **Display** (900 italico, `clamp(1.9rem, 6.2vw, 3.4rem)`, lh 1.05, ls -0.02em): solo il logo H1, con doppio contorno via text-shadow a 8 direzioni + ombra dura `5px 5px 0` e `rotate(-1deg)`.
- **Headline** (700, 1.35rem): solo l'H2 della chiusura.
- **Title** (700, 1rem, ls 0.01em): gli H2 dentro le barre di categoria; i titoli riga scendono a 0.95rem/700.
- **Body** (400, 15px, lh 1.65): il default; dentro i pannelli il corpo scala a 0.9rem (regole, risorse) e 0.85rem (firma, quote).
- **Label** (700, 0.78rem, uppercase, ls 0.07em): gli H3 delle colonne risorse; il micro-label sticky-tag scende a 0.66rem (ls 0.06em) e il badge "nuovo" a 0.64rem (ls 0.08em).
- **Meta** (400, banda 0.72-0.8rem in `muted`): bar-meta e post-meta a 0.72rem; row-last, colonna autore e footer a 0.75rem; breadcrumb, guest-box e paginazione a 0.78rem; descrizioni riga a 0.8rem.
- **Mono** (0.86em relativo): solo comandi bot e codice, quasi sempre dentro il chip `kbd`.

### Named Rules
**La Regola Verdana.** Tutto il testo UI è lo stack Verdana di sistema; il mono esiste solo dentro `kbd`/`code`. Nessun webfont, mai.

**La Regola del Logotipo.** Il trattamento display (900 italico, doppio contorno, rotazione -1°, ombra dura) esiste in un solo posto: il logo. Nessun altro testo lo imita.

## Layout

Colonna unica centrata a **960px** (`masthead-inner`, `crumbs-inner`, `main`, `footer-inner`) con gutter laterale 1.25rem. `main` ha padding `1.6rem 1.25rem 3rem`; le sezioni board/thread si impilano con margine 1.7rem.

Griglie interne:
- **Riga di board**: `30px 1fr 170px` (icona / titolo+descrizione / ultimo messaggio a destra), gap 0.9rem, celle `0.85rem 1rem`.
- **Post**: `168px 1fr` (colonna autore / corpo).
- **Risorse e firma**: due colonne `1fr 1fr` con gap orizzontale 2rem.
- **Masthead**: 1 colonna; da **900px** in su diventa `1fr auto` e appare la guest-box.

Breakpoint:
- **`max-width: 680px`** (mobile): righe a `26px 1fr` con l'ultimo messaggio che scende in colonna 2 allineato a sinistra (il ritmo diventa inline con separatore " · " generato via `::after`); post a colonna singola con l'autore trasformato in striscia orizzontale (avatar 72px -> 52px); colonne risorse/firma a 1; board-bar in colonna; breadcrumb in colonna; il bottone di chiusura scambia `label-long`/`label-short`; masthead con padding-top ridotto a 1.9rem.
- **`min-width: 900px`**: masthead a due colonne, guest-box visibile.

Il ritmo verticale è in rem su passi piccoli e ricorrenti (0.5 / 0.9 / 1 / 1.25 / 1.6-1.7rem), non su una scala formale.

## Elevation & Depth

Sistema bordi-prima: la profondità la fanno i **bordi 1px** (`border` fuori, `border-soft` dentro), le **righe alternate** (`panel-alt` sulle pari) e le **barre a gradiente**. Le ombre sono un contorno, non la struttura.

### Shadow Vocabulary
- **Ambientale** (`--shadow`: light `0 2px 6px rgba(23,43,72,0.18)`, dark `0 3px 10px rgba(0,0,0,0.45)`): board, thread e bottoni a riposo.
- **Bottone hover/focus** (`0 5px 12px rgba(10,30,60,0.35)` + `inset 0 1px 0 rgba(255,255,255,0.35)`): il rialzo di 1px del bottone.
- **Bottone attivo** (`0 1px 3px rgba(10,30,60,0.35)` + `inset 0 1px 2px rgba(0,0,0,0.25)`): il bottone premuto dentro.
- **Logotipo** (`5px 5px 0 var(--logo-shadow)` sopra il doppio contorno a 8 direzioni): l'unica ombra dura a offset, parte del logotipo da board.

### Named Rules
**La Regola Bordi-Prima.** Nuove superfici prendono bordo 1px + eventuale `--shadow`; le ombre dure a offset restano confinate al logotipo.

## Shapes

Angoli piccoli e costanti: **6px** per i contenitori (board, thread, bottoni, avatar, guest-box, chiusura), **3px** per i chip (kbd, sticky-tag, badge, celle paginazione), 4px una tantum sul quote, 2px sul focus ring. Cerchi pieni solo per i pallini (dot online 9px, typing 4px).

Bordi sempre `1px solid`; la sola eccezione è la chiusura, `1px dashed` (il "riquadro finale" della board). I gradienti sono esclusivamente verticali a 2 stop `linear-gradient(180deg, ...)`: barra di categoria (`bar-top`->`bar-bottom`), fascia di testata (`head-band-2`->`head-band`), bottone (`cta`->`cta-deep`). Il favicon replica la forma: rettangolo arrotondato blu con barra superiore e pallino online.

### Named Rules
**La Regola della Barra di Plastica.** Il gradiente è il lucido "plastica" della board: verticale, 2 stop, chiaro sopra scuro sotto, solo su barre/fascia/bottoni. Mai gradienti decorativi di sfondo.

## Components

### Masthead e Logo
- **Masthead:** fascia `linear-gradient(180deg, head-band-2, head-band)` con `border-bottom: 4px solid var(--cta)`, padding `2.4rem 1.25rem 1.9rem`; contiene H1, payoff (0.95rem `head-muted` con strong in `head-text`), CTA row e members-note (0.8rem).
- **Logo:** H1 unico, trattamento della Regola del Logotipo; lo span "Italia" in `logo-italia` #58c26e con lo stesso contorno.

### Guest-box
Aside "Benvenuto, ospite!" visibile solo da 900px: bordo e sfondo semitrasparenti via `color-mix` (bordo: `head-muted` 45%; sfondo: `head-band-2` 40%), radius 6px, 0.78rem, max-width 250px.

### Breadcrumb (crumbs)
Barra `panel` con bordo inferiore, 0.78rem `muted`; separatori "»" con `aria-hidden`; a destra il pallino online (9px, alone `0 0 0 2px color-mix(online 25%)`) + link al bot. Su mobile va in colonna.

### Buttons (btn)
- **Shape:** radius 6px, bordo 1px `cta-deep`, padding `0.72rem 1.35rem`, inline-flex con gap 0.5rem per l'icona SVG.
- **Primary:** gradiente `cta`->`cta-deep`, testo `cta-text` 700/1rem, ombra ambientale + inset highlight `rgba(255,255,255,0.35)`.
- **Hover / Focus-visible:** `translateY(-1px)` + ombra maggiore; transizione `140ms cubic-bezier(0.16, 1, 0.3, 1)` su transform e box-shadow.
- **Active:** `translateY(1px)` + ombra ridotta + inset scuro (il click "affonda").
- **Ghost:** sfondo trasparente, testo `head-text`, bordo 1px `head-muted`, senza ombra; vive solo sulla fascia scura.
- **Focus ring globale:** `outline: 3px solid var(--accent)`, offset 2px, radius 2px su `a`, `button`, `summary`.

### Board e Board-bar
- **Board:** contenitore `panel`, bordo 1px `border`, radius 6px, `overflow: hidden`, `--shadow`.
- **Board-bar:** gradiente `bar-top`->`bar-bottom`, testo `bar-text`, bordo inferiore, padding `0.62rem 1rem`; H2 1rem/700 con icona SVG 18px; a destra `bar-meta` 0.72rem in opacità 0.85.

### Rows e Sticky-row
- **Row:** grid `30px 1fr 170px`; icona SVG 20px in `accent`; titolo 0.95rem/700 (link senza sottolineatura, underline in hover); descrizione 0.8rem `muted`; colonna destra 0.75rem allineata a destra con `rhythm` a blocco.
- **Alternanza:** righe pari su `panel-alt`; prima riga senza bordo superiore.
- **Sticky-row:** sfondo `sticky-bg`, titolo in `sticky-text`, descrizione in `color-mix(sticky-text 80%, text)`, icona pin/cartella in `sticky-text`; chip **sticky-tag** (uppercase 0.66rem, bordo `sticky-border`, radius 3px).
- **Badge "nuovo":** chip bianco su `new-badge`, 0.64rem, radius 3px, animazione `newpulse` 2.6s infinita (solo background-color, verso il 78% mixato con #7c1f1f).

### Thread e Post (regolamento)
- **Thread:** stesso guscio della board; il regolamento è un thread con board-bar propria.
- **Post:** grid `168px 1fr`; colonna autore su `panel-alt` con bordo destro: avatar 72px (box bordato radius 6px con robot SVG inline in `accent`/`panel`), nick 0.85rem/700, ruolo in `online`, meta 0.75rem.
- **Post-body:** padding `1.1rem 1.3rem 1.3rem`; post-meta 0.72rem con hairline sotto.
- **Rules:** lista senza bullet, 0.9rem; ogni voce ha mark SVG (check in `ok`, croce in `no`) con prefisso testuale per screen reader ("Consentito:"/"Vietato:") in `.visually-hidden`; le voci vietate sono leggermente attenuate (`color-mix(text 82%, muted)`).
- **Quote:** box `panel-alt` bordo `border-soft`, radius 4px, 0.85rem, con q-head 0.72rem/700.

### Link-list e Link-cols
Due colonne `1fr 1fr`; H3 label uppercase 0.78rem; ogni voce con chevron SVG 14px in `accent`, link + descrizione " - " sulla stessa riga; esterni con `target="_blank" rel="noopener noreferrer"`.

### Kbd (comandi bot)
`kbd` scuro `kbd-bg`/`kbd-text`, radius 3px, padding `0.14em 0.5em`, mono 0.86em, `white-space: nowrap`. Nella firma i comandi sono una lista flex di chip (gap ~0.5rem).

### Typing dots
Tre `<i>` da 4px in `online`, animazione `typing` 1.4s ease-in-out infinita con delay 0.18s/0.36s (translateY -3px + opacità), `aria-hidden`.

### Closing
Riquadro centrato `1px dashed border` su `panel`, radius 6px, padding `2rem 1.3rem 2.2rem`; H2 1.35rem, paragrafo `muted` max-width 34rem, bottone primary con etichetta lunga/corta scambiata a 680px.

### Pagination
Riga centrata 0.78rem `muted`: "Pagine: [1] di 1"; il numero è uno span bordato `border-soft`, radius 3px, min-width 1.7rem, su `panel`.

### Footer
Bordo superiore, sfondo `panel`, 0.75rem `muted`; footer-links in flex (gap 1.2rem); tre paragrafi (descrizione, privacy, colophon "Stile Millennium").

### Icone (signature)
Tutte SVG inline disegnate "pixel-web" su `viewBox="0 0 16 16"` (l'avatar su 24), rese a 14-20px, `fill` in `currentColor` o token (`accent`, `sticky-text`), decorative con `aria-hidden="true"`. Mai emoji, mai icon font, mai `<img>`.

### Accessibilità strutturale
Skip-link (`.skip`) che appare in focus; utility `.visually-hidden` con `clip-path: inset(50%)`; `prefers-reduced-motion: reduce` spegne newpulse, typing e la transizione/transform del bottone.

## Do's and Don'ts

### Do:
- **Do** definire ogni nuovo colore come coppia light/dark di custom property su `:root` e consumarlo solo via `var()`; `color-scheme: light dark` resta dichiarato.
- **Do** usare " - " come separatore nel copy e nei titoli (regola di brand, vale anche per i meta tag).
- **Do** disegnare le icone come SVG inline su viewBox 16, fill `currentColor` o token, `aria-hidden="true"` se decorative.
- **Do** mantenere il focus ring `3px solid var(--accent)` offset 2px su ogni interattivo e i prefissi `.visually-hidden` dove il significato è solo visivo (✅/❌).
- **Do** proteggere ogni animazione con `prefers-reduced-motion: reduce`.
- **Do** tenere la pagina self-contained: font di sistema, tutto inline, zero richieste esterne.

### Don't:
- **Don't** em-dash, mai; niente webfont, CDN, analytics o qualunque richiesta esterna.
- **Don't** emoji come icone: i ✅/❌ del regolamento sono SVG check/cross in `ok`/`no`.
- **Don't** mono fuori da `kbd`/`code`: solo comandi del bot e codice.
- **Don't** metriche inventate (numero membri, testimonial) né persone fittizie spacciabili per reali.
- **Don't** ombre dure a offset fuori dal logotipo; niente gradienti oltre i 2-stop verticali di barre, fascia e bottoni.
- **Don't** maiuscolo esteso fuori dai micro-label (sticky-tag, H3 risorse); "REGOLAMENTO" nei titoli è copy, non uno stile di sistema.
