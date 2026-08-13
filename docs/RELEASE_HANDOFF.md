# Release Handoff

Date: 2026-08-13 KST.

This handoff records the PaperWords v0.4 local-only release candidate. The shared dictionary, search, Today recommendations, topics, and paper relationships use only versioned, verified local content.

## Product Scope

- PaperWords is a Korean-first AI and computer-science paper terminology PWA.
- The published corpus has 20 terms: 3 foundational terms, 8 edge-computing terms, and 9 neural-network-quantization terms.
- The published registry has 19 papers, 28 sources, and 6 topics.
- The immutable MVP schedule is `paperwords-mvp-2026-08-11.v1`, spans `2026-08-11` through `2026-11-08` KST, has 90 populated dates, and uses a 20-day no-repeat window.
- Runtime startup, production build, and full verification do not require network access, credentials, external scholarly APIs, or paid services.

## Routes And Features

- `/`: Today route resolved from the Asia/Seoul schedule, with schedule transparency and source stamps.
- `/dictionary`: deterministic English, acronym, alias, and Korean search over the local published registry, using shareable `GET` query parameters.
- `/terms/[slug]`: term detail pages with Korean explanation, related terms, source stamps, and paper relation rationale.
- `/topics` and `/topics/[slug]`: topic browsing and topic-filtered published terms plus representative relation papers.
- `/papers/[id]`: relation-only paper details; abstracts are not copied into the app.
- `/~offline`: direct offline fallback route, noindexed and excluded from sitemap.
- `/manifest.webmanifest`, `/sw.js`, `/robots.txt`, and `/sitemap.xml`: local PWA and SEO routes derived from published content and deterministic metadata.
- Former `/api/discovery/terms` and `/api/discovery/papers` routes are removed and return `404`.

## Local-Only Data Operations

- No runtime route, component, adapter, cache, or environment flag can search a remote terminology or scholarly dataset.
- DOI, publisher, repository, and documentation URLs remain passive citations. They are opened only after an explicit user action and never enrich the registry automatically.
- Shared corpus expansion requires local authoring, provenance mapping, Korean language review, schema validation, and explicit publication in a later version.
- A future per-device personal dataset is not implemented in v0.4. It requires a separate validated schema, local persistence design, provenance state, and conflict policy before implementation.
- App version `0.4.0` and cache version `paperwords-local-only-v1` retire installed-client caches from the former network-enabled release.

## Pinned Commands

Use this package-manager entry point in this environment:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm <script>`

Development server:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm dev`

Production build:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm build`

Full release verification:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify`

Useful focused checks:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm lint`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm typecheck`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:content`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:search`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:schedule`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:e2e`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:pwa`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:a11y`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:seo`

## Browser And PWA Verification

- Playwright defaults to `PAPERWORDS_PLAYWRIGHT_CHANNEL=chrome` and local port `4311`.
- `build:browser`, Playwright `baseURL`, the bounded launcher, and SEO expected URLs share `PAPERWORDS_PLAYWRIGHT_PORT`.
- Browser contexts block non-localhost HTTP(S) requests.
- Only `test:pwa:run` sets `PAPERWORDS_PWA_VERSION_FILE=output/playwright/pwa-version.json`; other browser suites use deterministic defaults from `src/lib/pwa/version.ts`.
- A configured PWA version file must be strict JSON with only string `appVersion`, `contentVersion`, and `cacheVersion` keys. Invalid files make `/sw.js` fail closed with status `500`.
- The service worker excludes non-GET requests, `/api`, metadata routes, `/sw.js`, and cross-origin requests from runtime caching.

## Production URL

Set `PAPERWORDS_SITE_URL` to the production origin when an explicit canonical override is needed. The app otherwise uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL` in production and `http://localhost:3000` locally. Browser verification sets a selected localhost URL through the bounded Playwright launcher.

Because `/sw.js` reads environment and optional version-file state per request, production deployment needs a Node-compatible Next.js server runtime such as `next start` or an equivalent host. A pure static export is not a valid deployment target for the current PWA contract.

## Verification Evidence

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify` passed on 2026-08-13 KST.
- Verified 22 direct dependency pins; lint and typecheck passed; content 45, search 6, schedule 11, and all Vitest 83 tests passed.
- The production browser build generated 53 pages with no discovery API route. Desktop/mobile E2E 16, PWA 10, accessibility 18, and SEO 8 tests passed.
- The local-only E2E check proves both retired discovery URLs return `404`, the dictionary exposes one local search surface, and no external-candidate control remains.
- A separate Playwright CLI inspection at desktop and 390px mobile widths showed app version `0.4.0`, the local-only copy, eight deterministic `양자화` results, no former discovery section, and only localhost requests.
- Structural audit found no `ExternalDiscovery`, discovery implementation path, external discovery environment variable, or runtime CSO/Crossref host outside tests that prove removal, the superseding decision, the superseded ADR, and historical OMX artifacts.

## Generated Output

- `.next/`: Next.js production build output.
- `output/playwright/report/`: Playwright HTML report.
- `output/playwright/test-results/`: Playwright traces, screenshots, videos, and run metadata.
- `output/playwright/pwa-version.json`: mutable PWA test version file.
- `output/playwright/web-server-<port>.json`: bounded launcher state for the selected port.
- `public/icons/*.png`: generated local PWA icons.

## Release Authority

This document grants no standing commit, push, deployment, or publication authority. The current local-only change has not been committed, pushed, or deployed.
