# d1d2dopamine.is-a.dev

Static bilingual portfolio for `https://d1d2dopamine.is-a.dev`. No build step and no external runtime dependencies.

## Preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Pages

- English: `index.html`, `about.html`, `projects.html`
- Russian: `ru.html`, `about-ru.html`, `projects-ru.html`

Each URL is a real standalone HTML document. This keeps metadata, canonical URLs, language alternates, browser history, accessibility, and search indexing straightforward. The language switch preserves the current section.

## Background video

All main pages use:

- `assets/background.webm` — VP9, 1280×720, 24 fps
- `assets/background.mp4` — H.264 fallback, 1280×720, 24 fps
- `assets/background-poster.jpg`

The video is decorative and fills the viewport with `object-fit: cover`. Its playback position is stored on page exit so navigation between documents feels less abrupt. Users who request reduced motion see the poster image instead of the video.

## Assets and metadata

- Canonical URLs, Open Graph tags, Twitter card tags, `robots.txt`, and `sitemap.xml` point to the custom domain.
- `site.webmanifest` includes a dedicated padded maskable icon.
- Shared assets use root-relative paths so nested 404 URLs cannot break CSS or icons.
