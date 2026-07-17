# Dynamic content without a separate server

The site remains static on GitHub Pages. Dynamic information is generated into `data/site-data.json` by GitHub Actions and then rendered by `script.js` with complete static HTML fallbacks.

## What updates automatically

The workflow `.github/workflows/refresh-site-data.yml` runs on the first push to `main` and then every six hours. It reads public repositories, each repository’s latest commit time, and latest releases from the GitHub API, writes up to five recent works to `data/site-data.json`, and commits only when data changed. Commits that change only `data/site-data.json` are excluded from the push trigger, so the workflow cannot create an update loop.

No GitHub token is shipped to the browser. The workflow uses the repository-scoped `GITHUB_TOKEN` supplied by GitHub Actions. Commit times are displayed in the fixed `Asia/Yekaterinburg` timezone so every visitor sees the same time.

There is no fabricated fallback commit time. Before the first successful refresh, the time field stays hidden. The first push to `main` automatically starts the workflow and replaces it with the real latest commit timestamp from GitHub.

## Update the Now block manually

1. Open the `d1d2dopamine.github.io` repository.
2. Select **Actions → Refresh site data → Run workflow**.
3. Enter the English and/or Russian Now text.
4. Run the workflow.

The workflow writes the text and update date to `data/site-data.json`. GitHub Pages then publishes the commit normally.

## Trigger it from a webhook

GitHub Pages cannot safely receive a webhook by itself. The clean option is GitHub's `repository_dispatch` API:

```bash
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_FINE_GRAINED_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/d1d2dopamine/d1d2dopamine.github.io/dispatches \
  -d '{
    "event_type": "update_now",
    "client_payload": {
      "now_en": "Preparing the next validation run.",
      "now_ru": "Готовлю следующий запуск валидации."
    }
  }'
```

Use a fine-grained token restricted to this repository. Store it only in the sender's secret storage. **Never place it in `script.js`, HTML, a public repository, or browser local storage.**

For Notion, Telegram, or another service that cannot call authenticated GitHub APIs safely, use a small trusted relay such as a private GitHub App or a Cloudflare Worker with the token stored as a secret. This relay is optional; scheduled and manual updates work without it.

## Static and local behavior

Opening `index.html` directly may block `fetch()` for local JSON due to browser file security. The page still displays complete fallback text and links from the HTML. On GitHub Pages, `data/site-data.json` is fetched from the same origin normally.

## Add more meow files later

Place approved audio files under `assets/`, add their paths to the `meowFiles` array in `script.js`, and record the author, source URL, license, and any edits in `THIRD_PARTY_NOTICES.md`.
