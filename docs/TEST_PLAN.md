# Test Plan

All tests are deterministic and network-independent. The app has no external terminology or scholarly-data lookup adapter, and verification never contacts a live dataset service.

## Bootstrap Gate

Use the offline bootstrap gate after dependencies are installed:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify:bootstrap`

For first install or lockfile refresh only, use the online form:

- `npm exec --yes --package=pnpm@10.34.5 -- pnpm install`

Corepack 0.29.4 has a stale signing-key failure in this environment, so project operations use `npm exec` with the pinned `pnpm@10.34.5`.

## Release Gate

Run the current release gate before a local handoff or production release claim:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify`

Use the pinned package-manager entry point in this environment:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm <script>`

`pnpm verify` expands to lockfile verification, lint, typecheck, content tests, focused search and schedule tests, all Vitest tests, one browser production build, then the Playwright run scripts:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify:lockfile`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm lint`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm typecheck`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:content`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:search`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:schedule`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm build:browser`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:e2e:run`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:pwa:run`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:a11y:run`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:seo:run`

Standalone browser scripts run a production build first, then start `next start` on the Playwright port through the bounded launcher:

- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:e2e`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:pwa`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:a11y`
- `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:seo`

`pnpm verify` avoids repeated browser builds by building once, then running the `*:run` Playwright scripts against the same production output. Browser artifacts stay under `output/playwright/`.

## Coverage Expectations

- Content schemas reject malformed records, copied abstracts, orphaned joins, invalid DOI fields, and scheduled unpublished terms.
- Search tests cover English, Korean, acronym, punctuation, Unicode normalization, no-result, malformed, and oversized queries.
- Schedule unit tests prove Asia/Seoul date resolution around the KST day boundary, the immutable `2026-08-11` to `2026-11-08` 90-day range, and the 20-day no-repeat window.
- Today route/component tests prove before-range and after-range fallback copy and stable preview selection.
- The architecture test keeps the retired discovery routes, component, and adapter files absent and prevents dictionary/search code from adding a runtime `fetch` or `/api/` handoff.
- The paper-material design test locks the warm palette, inline local grain and fiber tokens, primary-surface application, native reading type, selected design preset, and no-network visual constraint.
- Product-shell tests cover the absence of public initial-release/prototype labels and raw internal schedule identifiers, desktop active navigation, desktop continuation/topic discovery, compact mobile bottom navigation, safe-area spacing, at least 44px touch targets, and no horizontal overflow at 390px.
- Browser core tests cover desktop and mobile route flows without external requests: Today, local-only dictionary search, removed discovery endpoints returning `404`, term detail, topics, topic detail, relation-only paper detail, offline fallback, keyboard order, and no horizontal overflow.
- The Today browser check also proves the rendered primary sheet resolves to the expected warm paper color and a browser-parsed local data-image texture.
- PWA tests prove installability, strict `/sw.js` version-file failures, offline fallback, waiting-worker update, stale-cache cleanup, no broad runtime caching, and exclusion of non-GET, `/api`, metadata routes, `/sw.js`, and cross-origin requests.
- Accessibility tests run axe against desktop and mobile routes and block release on critical or serious violations. They also cover keyboard-safe forms, live regions, language spans, and install controls.
- SEO tests prove deterministic metadata, manifest, icon, robots, sitemap, published-only JSON-LD, no abstract body exposure, and no draft leakage.
- JSON-LD unit coverage proves malicious script delimiters are escaped before serialization.

## PWA and SEO Test Configuration

- Browser tests use the selected Playwright port from `PAPERWORDS_PLAYWRIGHT_PORT`, defaulting to `4311`. `build:browser`, Playwright `baseURL`, and SEO expected URLs all use `http://127.0.0.1:<selected-port>` so canonical, Open Graph, Twitter, robots, sitemap, and JSON-LD URLs stay deterministic locally.
- Only `test:pwa:run` sets `PAPERWORDS_PWA_VERSION_FILE=output/playwright/pwa-version.json`; the real `/sw.js` route reads that file at request time to prove same-origin version A/B stale-cache behavior without a second build. Non-PWA browser suites leave the variable unset and use deterministic default service-worker versions.
- Playwright blocks non-localhost HTTP(S) requests at the browser context level. Citation links can exist as inert references, but tests and app search do not fetch them.
- Chromium tests default to the installed Chrome channel through `PAPERWORDS_PLAYWRIGHT_CHANNEL=chrome`; set the variable to another local Chromium channel only when that browser is already installed.

## Interrupted Browser Run Recovery

Playwright starts `next start` through `scripts/playwright-web-server.mjs`. If a browser run is interrupted, inspect the launcher state for the exact port before cleanup:

- `PORT=${PAPERWORDS_PLAYWRIGHT_PORT:-4311}; STATE="output/playwright/web-server-${PORT}.json"; if [ -f "$STATE" ]; then jq '{state,cwd,hostname,port,launcherPid,childPid,childProcessGroupId,event,updatedAt}' "$STATE"; else printf 'No launcher state at %s\n' "$STATE"; fi`

Use the state only when `cwd` is this project root and `port` is the port being recovered. If a stale process remains, target only the recorded `childProcessGroupId`; do not use broad name-based or port-wide kill commands. After cleanup, rerun the same pinned command that was interrupted.
