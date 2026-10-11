# d1d2dopamine.github.io

Static bilingual website. No build step, frameworks, analytics, or external font requests.

## Preview this review copy

Unzip the archive and open `ru.html` for Russian or `index.html` for English.

For an HTTP preview (including the custom 404 page), run from this folder:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/ru.html` or `http://localhost:8000/`.

## Background and typography

- Project links, the three-section structure, and Russian/English versions are preserved. Public prose is simplified in round 3.
- The video background is replaced by `assets/wallpaper.png`, copied unchanged from the supplied Neocities site.
- All pages use a local variable Shantell Sans font with complete Russian and Latin coverage.
- Informality is set to 18 for body text and 28 for the main heading; bounce and extra spacing are zero.
- White text and icons, a single dark-blue accent, and dark text surfaces are used against the collage.
- Mobile navigation, long paragraphs, project headings, keyboard focus, and the 404 page share the new style.
- `assets/og-image.png` is updated to match the new style; the existing social metadata and public domain are retained.
- No publishing or external repository changes are included in this review copy.

## Pages

- English: `index.html`, `about.html`, `projects.html`
- Russian: `ru.html`, `about-ru.html`, `projects-ru.html`
- Missing page: `404.html`

## Round 2: navigation, caching, and alignment

Every entry page includes all six views. `site.js` switches the visible view inside the current document, updates the address and metadata, and supports browser back/forward. Background and font elements remain in place. Ordinary links still support opening new tabs, direct URLs, and a no-JavaScript fallback. The language switch stays on the corresponding section.

Home copy and standalone headings are centered. Longer about/project paragraphs remain left-aligned in centered columns for readability. Project link rows are centered. Russian and English prose is rewritten in round 3.

`sw.js` precaches the six pages and local visual assets after the first online visit on HTTPS or localhost. Assets use cache-first requests; direct page visits use network-first requests with an exact-page offline fallback. Opening the files directly also supports in-document switching, but does not enable the persistent service-worker cache.

For future asset changes, update the cache version in `sw.js` and the stylesheet/script query versions in HTML and the worker's file list. The worker waits for old tabs to close before activating a newer version.

## Round 5: one accent color

White (#ffffff) is used for all text, links, headings, and icons. The only accent is dark blue (#303d55), shared by window borders, project dividers, link underlines, active navigation underlines, hover backgrounds, focus outlines, text selection, and the skip-link background. There are no beige, olive, or additional blue shades in the stylesheet.

Rectangular windows retain single 2 px borders; project dividers remain 1 px. Prose, background, typography, and navigation are unchanged. CSS/script query versions and the worker cache name are updated to round 7. Close old site tabs after deployment to let a waiting worker activate.

## Round 6: approved About copy

The About section uses the user's approved six-paragraph Russian text and a corresponding English translation. Both versions are embedded in every entry page, so direct visits and same-document navigation show identical content. The revised section describes the origin of the projects, interests, AI's role, practical work, and research selection. Header contact links remain available.

The palette, layout, home page, project descriptions, wallpaper, font, and navigation behavior are unchanged. Resource query versions and the service-worker cache name are incremented for this review copy.

## Round 7: supplied site icon

The supplied picture is used for the tab favicon, Apple touch icon, and web-app icons. A square crop centers the skull and hat. `favicon.ico` includes 16, 32, 48, 64, 128, and 256 px images; PNG resources include 32, 180, 192, and 512 px variants. The maskable 512 px icon has extra padding. The unmodified original is retained in `assets/site-icon-source.jpg`.

Icon and manifest URLs have a new version query, and the worker precaches those exact URLs. Public copy, visual layout, colors, wallpaper, fonts, and navigation are unchanged.

## Review checks

DOM tests cover the six entry pages, section/language changes, URL and metadata updates, back/forward, scrolling, focus, modifier clicks, and local-file fallback. Worker event tests cover precaching, offline page fallback, asset cache hits, fresh online HTML, and preservation of unrelated caches. The new Russian and English About sections were visually rendered at 1440 and 390 px widths; all six entry pages were checked for consistent view content, local resources, and metadata. Link targets were compared with round 2. A full browser was unavailable in the editing environment; actual browser rendering and service-worker installation should be reviewed in a normal browser.

## Fonts

`assets/fonts/shantell-sans-variable.woff2` is a WOFF2 conversion of the unmodified variable TrueType font from Google Fonts. It preserves all font axes and glyphs. The font is bundled with its SIL Open Font License in `assets/fonts/ShantellSans-OFL.txt`.

Typography, layout, colors, and the collage scale are configured in `styles.css`.
