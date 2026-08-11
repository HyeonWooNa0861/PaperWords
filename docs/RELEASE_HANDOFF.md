# Release Handoff

Date: 2026-08-12 KST.

This handoff records the PaperWords v0.2 release candidate: the verified local MVP plus free, source-separated open-network discovery. External candidates are intentionally not dictionary content.

## Product Scope

- PaperWords is a Korean-first AI and computer-science paper terminology PWA.
- The published corpus has 20 terms: 3 foundational terms, 8 edge-computing terms, and 9 neural-network-quantization terms.
- The published registry has 19 papers, 28 sources, and 6 topics.
- The immutable MVP schedule is `paperwords-mvp-2026-08-11.v1`, spans `2026-08-11` through `2026-11-08` KST, has 90 populated dates, and uses a 20-day no-repeat window.
- Runtime startup, production build, and default verification do not require network access, credentials, or external scholarly APIs. Only an explicit user search contacts the live CSO and Crossref sources.

## Routes And Features

- `/`: Today route resolved from the Asia/Seoul schedule, with schedule transparency and source stamps.
- `/dictionary`: bilingual deterministic search over published terms, using shareable `GET` query parameters.
- `/terms/[slug]`: term detail pages with Korean explanation, related terms, source stamps, and paper relation rationale.
- `/topics` and `/topics/[slug]`: topic browsing and topic-filtered published terms plus representative relation papers.
- `/papers/[id]`: relation-only paper details; abstracts are not copied into the app.
- `/api/discovery/terms`: server-only CSO term-candidate lookup, noindexed and CDN-cached.
- `/api/discovery/papers`: server-only keyless Crossref bibliographic lookup, noindexed and CDN-cached; abstracts are never selected.
- `/~offline`: direct offline fallback route, noindexed and excluded from sitemap.
- `/manifest.webmanifest`, `/sw.js`, `/robots.txt`, and `/sitemap.xml`: local PWA and SEO routes derived from published content and deterministic metadata.

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

## Browser Verification

- Playwright defaults to `PAPERWORDS_PLAYWRIGHT_CHANNEL=chrome`.
- The default Playwright port is `4311`; override with `PAPERWORDS_PLAYWRIGHT_PORT` only when that exact local port is intended.
- `build:browser`, Playwright `baseURL`, the launcher runtime URL, and SEO expected URLs all use `http://127.0.0.1:<selected-port>` from `PAPERWORDS_PLAYWRIGHT_PORT`, defaulting to `4311`.
- Browser tests route through `scripts/playwright-web-server.mjs`.
- `pnpm verify` builds once with `build:browser`, then runs `test:e2e:run`, `test:pwa:run`, `test:a11y:run`, and `test:seo:run` against that production output.
- A selected-port check on `4315` recorded SEO 8 passed and PWA 10 passed, with no TCP listener remaining on port `4315` after each suite exited.

## Production URL

Set `PAPERWORDS_SITE_URL` to the production origin when an explicit canonical override is needed. The app otherwise uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL` in production and `http://localhost:3000` locally. Browser verification sets `PAPERWORDS_SITE_URL=http://127.0.0.1:<port>` through the Playwright launcher.

Because `/sw.js` is a dynamic route that reads environment and optional version-file state per request, production deployment needs a Node-compatible Next.js server runtime such as `next start` or an equivalent server host. A pure static export is not a valid deployment target for the current PWA contract.

## Free Open-Network Operations

- The default runtime uses the public CSO portal and Crossref public REST pool. No paid API, API key, user account, or copied abstract is required.
- `PAPERWORDS_EXTERNAL_DISCOVERY_ENABLED=0` is the immediate rollback switch. Both routes return a no-store `503` without contacting an upstream source.
- `PAPERWORDS_CROSSREF_MAILTO` is an optional maintainer contact for Crossref's free polite pool. It is not a secret and is never sent to the browser.
- Successful term responses use a one-day CDN cache and seven-day upstream revalidation directive. Successful paper responses use a one-hour CDN cache and one-hour upstream revalidation directive. Errors are no-store.
- Treat this as best-effort beta. Unique public queries can consume host and upstream free-tier quota; Crossref concurrency-one serialization is per server instance, not global; CSO parsing depends on the current public portal payload and fails closed when that shape changes.
- Live source smoke checks are separate from the offline release gate and should be kept sparse.

## PWA Version File

- When `PAPERWORDS_PWA_VERSION_FILE` is unset, `/sw.js` uses deterministic defaults from `src/lib/pwa/version.ts` plus direct `PAPERWORDS_APP_VERSION`, `PAPERWORDS_CONTENT_VERSION`, and `PAPERWORDS_CACHE_VERSION` overrides.
- Only `test:pwa:run` sets `PAPERWORDS_PWA_VERSION_FILE=output/playwright/pwa-version.json` so `/sw.js` can switch from version A to version B without a second build.
- E2E, accessibility, and SEO suites leave `PAPERWORDS_PWA_VERSION_FILE` unset; the SEO suite proves `/sw.js` returns `200` with deterministic default versions in that mode.
- When `PAPERWORDS_PWA_VERSION_FILE` is set, the file must be readable strict JSON with only string `appVersion`, `contentVersion`, and `cacheVersion` keys.
- Missing files, malformed JSON, non-object or array payloads, non-string values, and unknown keys make `/sw.js` return `500` with `X-PaperWords-Pwa-Version-File-Error: 1`.
- Partial valid string files are allowed; omitted fields fall back to direct environment overrides or deterministic defaults.

## v0.2 Claude Read-Only Review

- Artifact: `.omx/artifacts/claude-task-id-pw-v020-final-mode-read-only-goal-independently-revi-2026-08-11T15-34-49-973Z.md`
- Verdict: `APPROVE`.
- Follow-up Claude call: unnecessary; all findings were low or advisory.
- Finding disposition:
  - Crossref now validates items independently so one malformed legacy record is dropped without discarding the valid result set.
  - DOI outbound links encode reserved characters such as `#`.
  - CDN response caching remains the operational backstop; server data-cache behavior with a custom abort signal is not claimed as a production load guarantee.
  - The bounded feature remains best-effort beta, with a documented no-code rollback switch. The per-instance Crossref queue is not presented as global rate limiting.

## v0.2 Independent Review And Verification

- Independent code-reviewer: `APPROVE`; its only low finding was a duplicate `.gitignore` rule that overrode the `.env.example` exception. The duplicate rule was removed and a safe example file was added.
- Architect: `WATCH`, blocking 0. The watch items are public unique-query free-tier cost, per-instance rather than global Crossref serialization, and CSO portal-shape dependence. Each is documented above; the rollback switch addresses emergency shutdown.
- Final root verification: `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify` passed on 2026-08-12 KST.
- Verification evidence: lockfile 22, lint, and typecheck passed; content 45, search 6, schedule 11, Vitest 98, production build 53 pages plus two dynamic discovery routes, E2E 16, PWA 10, a11y 18, and SEO 8 passed.
- Final launcher cleanup: port `4311` has no listener; `output/playwright/web-server-4311.json` records `state: "exited"`, `event: "child-exited-after-stop"`, `stopReason: "SIGTERM"`, and `childExitCode: 143`.

## Generated Output

- `.next/`: Next.js production build output.
- `output/playwright/report/`: Playwright HTML report.
- `output/playwright/test-results/`: Playwright traces, screenshots, videos, and run metadata.
- `output/playwright/pwa-version.json`: mutable PWA test version file.
- `output/playwright/web-server-<port>.json`: Playwright launcher state for the exact selected port.
- `public/icons/icon-192.png`, `public/icons/icon-512.png`, and `public/icons/maskable-512.png`: generated local PWA icons from `scripts/generate-pwa-icons.mjs`.

## Interrupted Browser Run Recovery

The launcher state is the first recovery source. Check the exact port, cwd, PID, and process group before cleanup:

- `PORT=${PAPERWORDS_PLAYWRIGHT_PORT:-4311}; STATE="output/playwright/web-server-${PORT}.json"; if [ -f "$STATE" ]; then jq '{state,cwd,hostname,port,launcherPid,childPid,childProcessGroupId,event,updatedAt}' "$STATE"; else printf 'No launcher state at %s\n' "$STATE"; fi`

Recovery rules:

- Trust the state only when `cwd` is `/Users/nahw/Documents/PaperWords` and `port` is the exact port being recovered.
- If a stale process exists, target only the recorded `childProcessGroupId`. Do not use broad process-name, broad port, or workspace-wide kill commands.
- The launcher cleanup contract is the current local macOS/POSIX process-group contract. It depends on detached child process groups and negative-PID signaling, so do not present it as a Windows portability guarantee.
- The targeted termination command is intentionally not executed during documentation validation because it stops local processes. Use it only after confirming the state file values.
- After cleanup, rerun the same pinned command that was interrupted.

## Known Non-Blocking Warning

If local tooling prints the `NO_COLOR` and `FORCE_COLOR` environment warning while the command exits successfully, treat it as non-blocking. A nonzero exit code remains a blocker.

## Release Authority

This document does not grant standing publication authority. The current task has separate, explicit user authorization only for the public GitHub repository `HyeonWooNa0861/PaperWords` on remote `origin`, branch `main`, and Vercel project `sigebert111s-projects/paperwords` with production alias `https://paperwords.vercel.app`. Paid services remain out of scope.
