# Matteo Mosti — Portfolio & CV

Sito portfolio personale in HTML, CSS e JavaScript puri (senza framework).
Tema dark con accento rosa (`#ffc0cb`), layout responsive e animazioni leggere.

Include anche un **Curriculum Vitae web** separato, con un design editoriale
chiaro (verde bosco, carta calda, accenti smeraldo e oro), ottimizzato per la
lettura su desktop, tablet e smartphone e per la stampa in PDF.

## Caratteristiche

- **Logo `mff`** in alto a sinistra: wordmark con gradiente e linea di scansione animata, più favicon SVG/PNG abbinate.
- **Design system a variabili CSS** — colori, tipografia, raggi e ombre centralizzati in `:root`.
- **Preloader** con contatore e uscita animata.
- **Header fisso** con effetto vetro, barra di avanzamento e link attivo automatico.
- **Hero** con particelle animate, typewriter, lettura CNC X/Y/Z che segue il mouse e card immagine con tilt 3D.
- **Cursore personalizzato e pulsanti magnetici** su desktop (disattivati con `prefers-reduced-motion`); segue il puntatore anche dentro l’anteprima web, nascondendo il cursore nativo del frame. Nella modale del CV torna il puntatore di sistema, più comodo per leggere.
- **Doppio marquee** con direzioni opposte.
- **Timeline orizzontale** scorrevole con snap delle tappe, rail di avanzamento e schede animate; swipe su mobile.
- **Sezione Web** — anteprima browser interattiva con switch Desktop/Mobile e tre accenti colore; editor HTML/CSS con tab, modalità modifica (matita), altezza fissa e scroll interno, anteprima aggiornata in tempo reale; card front-end, back-end e reti.
- **Sezione CNC** — ruoli di operatore e programmatore; editor G-code modificabile che ridisegna il percorso utensile (movimenti rapidi, tagli e archi G02/G03 con I/J o R) mentre scrivi.
- **Sezione contatti** — email, telefono e zona in righe cliccabili, profili social e anteprima del CV in una finestra modale, senza dover scaricare il PDF.
- **Menu mobile** a pannello laterale con overlay, chiusura con `Esc` e blocco dello scroll.
- **Accessibilità** — skip link, focus visibile, etichette ARIA, contrasti verificati e supporto a `prefers-reduced-motion`.
- **Responsive** — verificato da 320 px a 1440 px senza overflow orizzontale.

## Curriculum Vitae

- **Pagina web** — `cv.html`, con sidebar scura, hero editoriale, timeline delle esperienze, formazione, progetto portfolio e competenze trasversali.
- **Stampa / PDF** — il pulsante “Scarica PDF” apre `CV.pdf`; il pulsante stampa usa un layout A4 dedicato a due pagine, con sidebar trasformata in intestazione orizzontale.
- **Dati aggiornati** — l’esperienza come operatore CNC presso ML Meccanica / Alberti S.r.l. è indicata dal 13 ottobre 2025 a oggi, con badge “In corso”.
- **Responsive** — la sidebar diventa un blocco orizzontale su tablet e una colonna su mobile, senza overflow.

## Struttura

```
index.html                  Struttura e contenuti del portfolio
mff.css                     Stili e design system del portfolio
script.js                   Navigazione, scroll spy, progress, cursore, animazioni
scriptH1.js                 Effetto typewriter dell'hero
finisher-header.es5.min.js  Libreria per le particelle dell'hero
cv.html                     Curriculum Vitae web
cv.css                      Stili del Curriculum, responsive e print
CV.pdf                      Curriculum scaricabile (generato da cv.html)
cv-preview.jpg              Anteprima del CV mostrata nella sezione contatti
favicon.svg                 Favicon vettoriale con logo mff
favicon.png                 Favicon raster 512×512
svg/                        Icone SVG
midj-640.jpg                Immagine profilo ottimizzata (da 1,7 MB a ~78 KB)
midj.png                    Immagine originale
_backup-original/           Copia dei file precedenti e del CV originale
```

## Anteprima

Apri semplicemente `index.html` (portfolio) o `cv.html` (curriculum) nel browser.
Per evitare restrizioni del browser sui file locali puoi anche avviare un server statico, ad esempio:

```bash
npx serve .
```

## Personalizzazione

- **Colore accento:** modifica `--accent` e `--accent-strong` in `mff.css`.
- **Sfondo:** modifica `--bg` (e `theme-color` in `index.html`).
- **Contenuti:** le sezioni sono in `index.html`; i recapiti sono nelle righe della sezione `#contact` e l’anteprima del CV nella modale `#cv-modal`.
- **Testi del typewriter:** modifica l'array `roles` in `scriptH1.js`.
- **Esempi di codice:** modifica `webDefaults.html`, `webDefaults.css` e `gcodeDefault` in `script.js`; il pulsante di ripristino ricarica questi valori.
- **Particelle:** i parametri sono nel blocco `new FinisherHeader({ ... })` in fondo a `index.html`.
- **CV — colori:** modifica le variabili in `:root` all’inizio di `cv.css` (`--forest`, `--accent`, `--gold`, `--paper`).
- **CV — contenuti:** le sezioni sono in `cv.html`; il layout di stampa è nel blocco `@media print` di `cv.css`.
- **CV — PDF:** dopo una modifica, rigenera `CV.pdf` stampando `cv.html` in A4 (9 mm di margine).
