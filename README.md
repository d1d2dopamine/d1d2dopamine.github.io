# d1d2dopamine.github.io

Static bilingual portfolio with separate Home, About, and Projects pages. No build step and no external runtime dependencies.

## Preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Background video

All Home, About, and Projects pages use:

- `assets/background.webm`
- `assets/background.mp4`
- `assets/background-poster.jpg`

The upscaled 16:9 source is exported at 1920×1080 and displayed with `object-fit: cover`, so it fills the viewport on every device. The final two seconds crossfade into the beginning to hide the loop seam. Both web versions have no audio stream. Users who request reduced motion see the poster frame instead.

## Pages

- English: `index.html`, `about.html`, `projects.html`
- Russian: `ru.html`, `about-ru.html`, `projects-ru.html`

Home, About, and Projects are grouped in the header beside the social icon buttons. All six Home, About, and Projects sections are embedded in the initial HTML and switched locally without fetching another page. The background video element is never replaced, while session storage preserves playback time if a full reload occurs. The language switch preserves the current section. There is no footer, video control, counter, or numbered About section.
