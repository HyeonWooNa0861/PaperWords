# Architecture

PaperWords uses a static-first Next.js App Router architecture.

## Boundaries

- `app/`: routes, metadata, layout, and page composition.
- `components/`: reusable UI components only.
- `content/`: versioned local term, paper, topic, source, and schedule data.
- `src/lib/content/`: Zod schemas, loaders, publication-state filtering, and integrity validation.
- `src/lib/search/`: bilingual normalization, MiniSearch candidate retrieval, and deterministic post-ranking.
- `src/lib/schedule/`: Asia/Seoul date resolution and schedule selection.
- `src/lib/pwa/`: service-worker registration, version state, and update behavior.
- `scripts/`: local validators, asset generation, and bounded test launchers.
- `tests/` and `e2e/`: unit/component/integration and browser checks.

## Data Flow

1. Local content is parsed with Zod.
2. Public loaders expose only `published` records.
3. Search builds from the published registry and applies explicit match classes after MiniSearch candidate retrieval. Query normalization applies Unicode NFKC, ASCII case folding, separator convergence, Hangul preservation, and safe empty/unsupported/oversized states before candidate search.
4. The daily resolver maps an Asia/Seoul date to one scheduled published term from the immutable `paperwords-mvp-2026-08-11.v1` local schedule.
5. Route components join typed records to render terms, topics, papers, sources, and relation rationale.

## Search And Schedule

- `src/lib/search/normalization.ts` owns bilingual query normalization.
- `src/lib/search/index.ts` uses MiniSearch only to retrieve local published candidates, then ranks by explicit classes: exact English headword, exact acronym/alias/Korean, prefix, bounded fuzzy, and body.
- `content/schedule.ts` stores the released 90-day Asia/Seoul schedule as versioned local data.
- `src/lib/schedule` owns KST date resolution, schedule lookup, and invariant validation. It uses UTC arithmetic plus the fixed KST offset so results do not depend on the machine timezone.

## Local-Only Data And Network Policy

- Search, recommendations, topics, and paper relationships read only from the checked-in published registry.
- There is no runtime discovery API, remote terminology adapter, scholarly metadata adapter, or environment switch that can enable one.
- The app does not fetch DOI, publisher, repository, or documentation URLs. Rendered citation anchors are passive references and leave PaperWords only after an explicit user action.
- Runtime startup, production build, and the full release gate require no network, API key, account, or upstream availability.
- Corpus changes happen before release through the local authoring and validation pipeline. No runtime response can mutate or supplement the registry.
- A future personal dataset layer is intentionally unimplemented. If introduced, it must use device-local persistence, schema validation, explicit provenance, and a separate trust state; it cannot silently merge into the shared `published` registry.

## PWA Runtime

- `src/lib/pwa/version.ts` is the single source of truth for app, content, cache versions, and stable PaperWords cache names.
- `src/lib/pwa/worker.ts` generates the owned service worker served by `app/sw.js/route.ts` at `/sw.js` with JavaScript content type, no-cache headers, and `Service-Worker-Allowed: /`.
- The worker precaches only `/`, `/dictionary`, `/topics`, `/~offline`, the manifest, and local PNG icons. Runtime caching is limited to same-origin navigations, explicit core assets, and `/_next/static/` files. The local-only change uses cache version `paperwords-local-only-v1` to retire cached pages from the former network-enabled release.
- Navigation uses network-first behavior, caches visited public pages, and falls back to `/~offline` when a requested page is unavailable offline. The worker skips cross-origin requests, mutations, `/api`, `/sw.js`, robots, and sitemap responses.
- The only client message is `SKIP_WAITING`. The only worker-to-client signal is `PAPERWORDS_VERSION`; `components/PwaControls.tsx` shows an accessible update banner and reloads only after the user activates that banner.
- The PWA Playwright suite sets `PAPERWORDS_PWA_VERSION_FILE=output/playwright/pwa-version.json` for version A/B update coverage. Non-PWA browser suites leave it unset. When `PAPERWORDS_PWA_VERSION_FILE` is unset, `/sw.js` uses deterministic defaults from `src/lib/pwa/version.ts` plus any direct `PAPERWORDS_APP_VERSION`, `PAPERWORDS_CONTENT_VERSION`, and `PAPERWORDS_CACHE_VERSION` environment overrides.
- When `PAPERWORDS_PWA_VERSION_FILE` is set, the file must be readable strict JSON with only string `appVersion`, `contentVersion`, and `cacheVersion` keys. Missing files, malformed JSON, non-object or array payloads, non-string values, and unknown keys make `/sw.js` return `500` with `X-PaperWords-Pwa-Version-File-Error: 1`, so the service worker fails closed instead of serving an ambiguous version.
- `playwright.config.ts` starts browser tests through `scripts/playwright-web-server.mjs` instead of an inline `next start`. The launcher accepts only local hostnames, validates that `--cwd` resolves to a real package root whose `package.json` name is `paperwords`, writes a port-specific state file at `output/playwright/web-server-<port>.json`, and rejects state paths outside `output/playwright` or not matching the selected port.
- The launcher spawns `next start` in a detached child process group, forwards the parent environment, sets `PAPERWORDS_SITE_URL` to the selected-port test base URL, records launcher PID, child PID, child process group ID, cwd, hostname, port, and lifecycle events, and terminates only that child process group when Playwright exits, sends a signal, or loses its parent.

## SEO and Metadata

- `PAPERWORDS_SITE_URL` is the canonical deployment override. When it is unset or invalid, local builds use the deterministic default `http://localhost:3000`; the project does not claim an arbitrary production domain.
- `app/sitemap.ts` and `app/robots.ts` derive from published local content only. The offline fallback route is noindexed and excluded from the sitemap.
- Term pages render escaped `DefinedTerm` JSON-LD and paper pages render minimal `ScholarlyArticle` JSON-LD from locally validated fields only. Paper JSON-LD intentionally omits abstract fields.
