# Release Handoff

Date: 2026-08-11 KST.

This handoff records the final local release and review state for PaperWords G008. Claude, independent code-reviewer, architect, ai-slop-cleaner, and root verification results are complete and recorded below.

## Product Scope

- PaperWords is a Korean-first AI and computer-science paper terminology PWA.
- The published corpus has 20 terms: 3 foundational terms, 8 edge-computing terms, and 9 neural-network-quantization terms.
- The published registry has 19 papers, 28 sources, and 6 topics.
- The immutable MVP schedule is `paperwords-mvp-2026-08-11.v1`, spans `2026-08-11` through `2026-11-08` KST, has 90 populated dates, and uses a 20-day no-repeat window.
- Runtime, production build, and default verification do not require network access, credentials, external scholarly APIs, commits, pushes, deploys, or publishing authority.

## Routes And Features

- `/`: Today route resolved from the Asia/Seoul schedule, with schedule transparency and source stamps.
- `/dictionary`: bilingual deterministic search over published terms, using shareable `GET` query parameters.
- `/terms/[slug]`: term detail pages with Korean explanation, related terms, source stamps, and paper relation rationale.
- `/topics` and `/topics/[slug]`: topic browsing and topic-filtered published terms plus representative relation papers.
- `/papers/[id]`: relation-only paper details; abstracts are not copied into the app.
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

Set `PAPERWORDS_SITE_URL` to the production origin before a production build that will be deployed. The app uses that value for canonical URLs, Open Graph URLs, robots, sitemap, and JSON-LD. If it is unset or invalid, local builds fall back to `http://localhost:3000`; browser verification sets `PAPERWORDS_SITE_URL=http://127.0.0.1:<port>` through the Playwright launcher.

Because `/sw.js` is a dynamic route that reads environment and optional version-file state per request, production deployment needs a Node-compatible Next.js server runtime such as `next start` or an equivalent server host. A pure static export is not a valid deployment target for the current PWA contract.

## PWA Version File

- When `PAPERWORDS_PWA_VERSION_FILE` is unset, `/sw.js` uses deterministic defaults from `src/lib/pwa/version.ts` plus direct `PAPERWORDS_APP_VERSION`, `PAPERWORDS_CONTENT_VERSION`, and `PAPERWORDS_CACHE_VERSION` overrides.
- Only `test:pwa:run` sets `PAPERWORDS_PWA_VERSION_FILE=output/playwright/pwa-version.json` so `/sw.js` can switch from version A to version B without a second build.
- E2E, accessibility, and SEO suites leave `PAPERWORDS_PWA_VERSION_FILE` unset; the SEO suite proves `/sw.js` returns `200` with deterministic default versions in that mode.
- When `PAPERWORDS_PWA_VERSION_FILE` is set, the file must be readable strict JSON with only string `appVersion`, `contentVersion`, and `cacheVersion` keys.
- Missing files, malformed JSON, non-object or array payloads, non-string values, and unknown keys make `/sw.js` return `500` with `X-PaperWords-Pwa-Version-File-Error: 1`.
- Partial valid string files are allowed; omitted fields fall back to direct environment overrides or deterministic defaults.

## Final Claude Read-Only Review

- Artifact: `.omx/artifacts/claude-task-id-pw-g008-final-release-mode-read-only-goal-independen-2026-08-11T11-14-32-167Z.md`
- Verdict: `APPROVE`.
- Follow-up Claude call: unnecessary; the findings were non-blocking and could be dispositioned from current repo evidence.
- Finding disposition:
  - Before-range and after-range Today fallback tests exist in `tests/routes/core-routes.test.tsx`.
  - `src/lib/schedule/dates.ts` uses UTC milliseconds and ISO slicing for KST arithmetic, not local timezone getters.
  - Dynamic port handling was fixed so `build:browser`, Playwright runtime, and SEO expected URLs follow `PAPERWORDS_PLAYWRIGHT_PORT`.
  - PWA version-file scoping was fixed so only `test:pwa:run` sets `PAPERWORDS_PWA_VERSION_FILE`; non-PWA browser suites exercise `/sw.js` defaults.
  - POSIX process-group behavior and the Node-compatible production runtime prerequisite are documented here.

## Final Independent Review And Verification

- ai-slop-cleaner: `CLEAN`.
- Independent code-reviewer: `APPROVE`, 0 issues.
- Architect: `CLEAR`, blocking 0. The architect proposed two documentation precision items, both reflected here: launcher cwd validation is package-name based, and final review and verification results are explicit.
- Final root verification: `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify` passed.
- Verification evidence: lockfile, lint, and typecheck passed; content 45, search 6, schedule 11, Vitest 77, production build 53 pages, E2E 14, PWA 10, a11y 18, and SEO 8 passed.
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

No commit, push, deploy, credential use, paid service use, external scholarly API use, or publication authority is granted for this handoff.
