# Matteo Mosti — Portfolio

Sito portfolio personale in HTML, CSS e JavaScript puri (senza framework).
Tema dark con accento rosa (`#ffc0cb`), layout responsive e animazioni leggere.

## Caratteristiche

- **Logo `mff`** in alto a sinistra: wordmark con gradiente e linea di scansione animata, più favicon SVG/PNG abbinate.
- **Design system a variabili CSS** — colori, tipografia, raggi e ombre centralizzati in `:root`.
- **Preloader** con contatore e uscita animata.
- **Header fisso** con effetto vetro, barra di avanzamento e link attivo automatico.
- **Hero** con particelle animate, typewriter, lettura CNC X/Y/Z che segue il mouse e card immagine con tilt 3D.
- **Cursore personalizzato e pulsanti magnetici** su desktop (disattivati con `prefers-reduced-motion`).
- **Doppio marquee** con direzioni opposte.
- **Timeline** alternata con linea di avanzamento legata allo scroll e numeri animati.
- **Sezione Web** — anteprima browser interattiva con switch Desktop/Mobile e tre accenti colore, finestra HTML con codice digitato e card front-end, back-end e reti.
- **Sezione CNC** — ruoli di operatore e programmatore, programma G-code digitato e percorso utensile animato su griglia.
- **Sezione contatti** a card cliccabili (email, telefono, CV).
- **Menu mobile** a pannello laterale con overlay, chiusura con `Esc` e blocco dello scroll.
- **Accessibilità** — skip link, focus visibile, etichette ARIA, contrasti verificati e supporto a `prefers-reduced-motion`.
- **Responsive** — verificato da 320 px a 1440 px senza overflow orizzontale.

## Struttura

```
index.html                  Struttura e contenuti
mff.css                     Stili e design system
script.js                   Navigazione, scroll spy, progress, cursore, animazioni
scriptH1.js                 Effetto typewriter dell'hero
finisher-header.es5.min.js  Libreria per le particelle dell'hero
favicon.svg                 Favicon vettoriale con logo mff
favicon.png                 Favicon raster 512×512
svg/                        Icone SVG
midj-640.jpg                Immagine profilo ottimizzata (da 1,7 MB a ~78 KB)
midj.png                    Immagine originale
CV.pdf                      Curriculum scaricabile
_backup-original/           Copia dei file precedenti alla revisione grafica
```

## Anteprima

Apri semplicemente `index.html` nel browser. Per evitare restrizioni del browser sui file locali
puoi anche avviare un server statico, ad esempio:

```bash
npx serve .
```

## Personalizzazione

- **Colore accento:** modifica `--accent` e `--accent-strong` in `mff.css`.
- **Sfondo:** modifica `--bg` (e `theme-color` in `index.html`).
- **Contenuti:** le sezioni sono in `index.html`; i dati di contatto sono nelle card della sezione `#contact`.
- **Testi del typewriter:** modifica l'array `roles` in `scriptH1.js`.
- **Codice digitato:** modifica gli array `webCode` e `gcode` in `script.js`.
- **Particelle:** i parametri sono nel blocco `new FinisherHeader({ ... })` in fondo a `index.html`.
