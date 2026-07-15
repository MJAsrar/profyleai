# Profyle browser extension

Tailor your résumé to the job posting you're viewing, and download it — without leaving the
job board.

This is a from-scratch TypeScript rewrite of the published extension
(`pefncjpobdnoiodnooiefjlcboblpnlf`). The `key` in `manifest.json` pins it to the same Web
Store ID, so a build here updates the existing listing.

## Develop

```bash
cd extension
npm install
npm run build        # → dist/
npm run typecheck    # tsc --noEmit
npm run dev          # rebuild on change (reload the extension after manifest/html/css edits)
```

Load it: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick
`extension/dist`. Nothing is injected into any page until you open the popup, so there's no
tab to reload.

## How it works

- **`src/background/service-worker.ts`** — the only place that holds the session and talks to
  the API. Routes messages from the popup, injects the extractor on demand, runs the
  tailor/cover-letter flows, saves PDFs.
- **`src/lib/inpage.ts`** — `extractInPage()`, injected into the active tab via
  `chrome.scripting.executeScript` when the popup opens. It reads the job text and returns
  it. On-demand injection is what makes this work on SPA job boards like LinkedIn, where a
  declared content script never runs if you reach the job without a full page load — and it
  means nothing executes on any page until you invoke the extension.
- **`src/popup/`** — the UI, styled to match the app (same palette and fonts, bundled
  locally because MV3's CSP blocks remote fonts).
- **`src/lib/`** — `api.ts` (typed client, every call returns a discriminated `ApiResult`),
  `auth.ts` (website-login-only session), `storage.ts`, `messaging.ts`, `types.ts`.

### Auth

Website-login only. The popup opens the Profyle login; after the user signs in (Google **or**
email/password), the service worker obtains a Bearer token from `GET /api/auth/session` (the
cookie'd endpoint) and stores it with its **real** server expiry. Every API call sends that
token; a server `401` — and only that — signs the user out. There is no local expiry fiction,
no cookie/token conflation, and no periodic logout poll (the three things that made the old
build log people out at random).

If the user already has a valid server token the extension can't read (`hasValidToken` with no
raw token), the worker clears it via `extension-logout` and re-mints once — so a token is
always obtainable.

## Endpoints used (all existing; no backend changes)

`GET /api/auth/session`, `POST /api/auth/extension-logout`, `GET /api/resumes`,
`GET /api/resumes/[id]`, `POST /api/resume-tailoring`,
`POST /api/{resumes|tailored-resumes}/[id]/download`, `POST /api/extract-job-data`,
`POST /api/cover-letter-generation`, `POST /api/cover-letter-pdf`.

## Build output

`build.mjs` (esbuild) emits three bundles — `service-worker.js` (ESM module),
`job-detector.js` and `popup.js` (IIFE classic scripts) — and copies the manifest, popup
HTML/CSS, icons, and fonts into `dist/`.
