# D1D2DOPAMINE personal site — dynamic static version

A bilingual static GitHub Pages portfolio using Verdana, cleaned transparent cat cutouts, a local real-cat recording, and a restrained monochrome design.

## Included

- English `index.html` and Russian `ru.html`
- Personal introduction, collaboration invitation, and current project
- Dynamic `Now` block, recent GitHub activity, and real last-commit times from `data/site-data.json`
- GitHub Actions refresh on the first push and every six hours, plus manual inputs and optional `repository_dispatch`
- Repository and Zenodo links
- Desktop-only cat click animation with three randomly selected local meow recordings
- Mobile cat rain with sound interaction disabled
- Favicon, touch icon, Open Graph image, canonical and language links
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, structured data, and `404.html`
- No external font, framework, analytics, or browser-side secret

## Open locally

Keep all files and folders together. Double-click `index.html` and choose any browser. Browsers may block local JSON fetches, but complete fallback text and links remain visible. To test dynamic JSON locally, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Publish with GitHub Pages

1. Create a public repository named `d1d2dopamine.github.io`.
2. Upload the contents of this folder to the repository root.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, then `main` and `/ (root)`.
5. Open `https://d1d2dopamine.github.io/` after deployment.
6. Open the **Actions** tab and confirm that `Refresh site data` completed successfully. The first push starts it automatically and fills real commit times; no placeholder time is published.

Read `DYNAMIC_CONTENT.md` for manual updates, scheduled refreshes, and safe webhook usage. Read `MEOW_CANDIDATES.md` for additional licensed sound candidates.
