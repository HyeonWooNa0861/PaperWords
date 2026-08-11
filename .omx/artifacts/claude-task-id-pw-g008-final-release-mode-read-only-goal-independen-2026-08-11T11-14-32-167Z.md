# claude advisor artifact

- Provider: claude
- Exit code: 0
- Created at: 2026-08-11T11:14:32.168Z

## Original task

TASK_ID: PW-G008-FINAL-RELEASE
MODE: READ_ONLY
GOAL: Independently review the PaperWords local MVP release candidate for release-blocking defects or contract contradictions. Codex remains the sole implementation owner. Do not edit files, run mutation commands, call external services, or broaden scope.
FILES_TO_READ:
- AGENTS.md
- CLAUDE.md
- docs/SPEC.md
- docs/ARCHITECTURE.md
- docs/CONTENT_SCHEMA.md
- docs/TEST_PLAN.md
- docs/RELEASE_HANDOFF.md
- package.json
- playwright.config.ts
- scripts/playwright-web-server.mjs
- src/lib/content/registry.ts
- src/lib/search/index.ts
- src/lib/schedule/validation.ts
- src/lib/schedule/index.ts
- content/schedule.ts
- app/sw.js/route.ts
- src/lib/pwa/worker.ts
- src/lib/pwa/version.ts
- tests/content/production-registry.test.ts
- tests/search/search.test.ts
- tests/schedule/schedule.test.ts
- tests/components/json-ld.test.tsx
- e2e/pwa.spec.ts
- e2e/seo.spec.ts
QUESTIONS:
1. Do any release-blocking defects remain against the MVP invariants, especially published-only provenance, deterministic bilingual search, immutable KST scheduling, PWA offline/update/cache behavior, and SEO/JSON-LD safety?
2. Does the ownership-bounded Playwright web-server launcher introduce any concrete safety, lifecycle, portability, or stale-state defect that should block this local handoff?
3. Do the architecture, test plan, and release handoff contradict the implementation or omit a production-critical prerequisite?
EVIDENCE_REQUIRED:
- Cite exact file and line for every finding.
- Separate code defects from documented deployment prerequisites and non-blocking risks.
- Do not infer missing behavior without checking the named implementation and tests.
OUTPUT_LIMIT:
- Maximum 5 findings.
- Maximum 1200 words.
- End with exactly one verdict: APPROVE or BLOCKED.
STOP_CONDITION:
- Stop after answering the three questions with evidence and the final verdict.
- Do not implement, modify files, suggest scope expansion, or request a second pass unless a concrete release blocker is found.

## Final prompt

TASK_ID: PW-G008-FINAL-RELEASE
MODE: READ_ONLY
GOAL: Independently review the PaperWords local MVP release candidate for release-blocking defects or contract contradictions. Codex remains the sole implementation owner. Do not edit files, run mutation commands, call external services, or broaden scope.
FILES_TO_READ:
- AGENTS.md
- CLAUDE.md
- docs/SPEC.md
- docs/ARCHITECTURE.md
- docs/CONTENT_SCHEMA.md
- docs/TEST_PLAN.md
- docs/RELEASE_HANDOFF.md
- package.json
- playwright.config.ts
- scripts/playwright-web-server.mjs
- src/lib/content/registry.ts
- src/lib/search/index.ts
- src/lib/schedule/validation.ts
- src/lib/schedule/index.ts
- content/schedule.ts
- app/sw.js/route.ts
- src/lib/pwa/worker.ts
- src/lib/pwa/version.ts
- tests/content/production-registry.test.ts
- tests/search/search.test.ts
- tests/schedule/schedule.test.ts
- tests/components/json-ld.test.tsx
- e2e/pwa.spec.ts
- e2e/seo.spec.ts
QUESTIONS:
1. Do any release-blocking defects remain against the MVP invariants, especially published-only provenance, deterministic bilingual search, immutable KST scheduling, PWA offline/update/cache behavior, and SEO/JSON-LD safety?
2. Does the ownership-bounded Playwright web-server launcher introduce any concrete safety, lifecycle, portability, or stale-state defect that should block this local handoff?
3. Do the architecture, test plan, and release handoff contradict the implementation or omit a production-critical prerequisite?
EVIDENCE_REQUIRED:
- Cite exact file and line for every finding.
- Separate code defects from documented deployment prerequisites and non-blocking risks.
- Do not infer missing behavior without checking the named implementation and tests.
OUTPUT_LIMIT:
- Maximum 5 findings.
- Maximum 1200 words.
- End with exactly one verdict: APPROVE or BLOCKED.
STOP_CONDITION:
- Stop after answering the three questions with evidence and the final verdict.
- Do not implement, modify files, suggest scope expansion, or request a second pass unless a concrete release blocker is found.

## Raw output

```text
All 24 supplied files reviewed. Below is the advisor report within the contract limits (≤5 findings, ≤3 questions, ≤1200 words).

Housekeeping first, since this session is non-interactive: the `claudelint` CLI is not installed, so claudelint plugin skills won't work (install with `npm install -g claude-code-lint` if wanted — I did not install anything under the read-only contract). The claude.ai Gmail/Calendar/Notion connectors also need authorization via claude.ai connector settings before they can be used. Neither affects this review.

# PaperWords G008 Final Release Review (read-only advisor)

## Question 1 — MVP invariants

No release-blocking defect found in the supplied files.

- **Published-only provenance**: `loadPublishedContent` validates the full registry before filtering (`src/lib/content/registry.ts:113-126`), and validation fails closed — scheduled non-published slugs are rejected both in `checkPublicationExposure` (`src/lib/content/registry.ts:558-576`) and `checkScheduledTerms` (`src/lib/schedule/validation.ts:102-120`). Draft leak-through search is directly tested (`tests/search/search.test.ts:104-128`); draft/orphan schedule rejection is tested (`tests/schedule/schedule.test.ts:97-142`).
- **Deterministic bilingual search**: the comparator is a total order — match class, then weight, then headword, then slug (`src/lib/search/index.ts:305-312`) — so sort instability cannot surface; repeated-run determinism is tested (`tests/search/search.test.ts:97-102`) and the eval set enforces English and Korean top-1 coverage for all 20 published terms (`tests/search/search.test.ts:60-69`).
- **Immutable KST schedule**: `content/schedule.ts` has exactly 90 entries (`2026-08-11`–`2026-11-08`), a 20-term rotation repeating at exactly 20-day spacing. The window check (`src/lib/schedule/validation.ts:126-139`) scans indices `index-19..index-1`, so a repeat at day +20 (e.g. `transformer` at entries 0 and 20, `content/schedule.ts:13,33`) is correctly allowed — a term never appears twice within any 20 consecutive days. Duration/sequence/topic-balance checks all match the spec and are exercised (`tests/schedule/schedule.test.ts:36-66,144-241`).
- **PWA offline/update/cache**: the worker scope is narrow and matches ARCHITECTURE.md:40-44 (`src/lib/pwa/worker.ts:134-153` excludes non-GET, cross-origin, `/api/`, `/sw.js`, robots, sitemap; stale-cache cleanup at `worker.ts:48-59`); `/sw.js` fails closed with 500 + error header on any invalid version file (`app/sw.js/route.ts:14-25,89-97`), and e2e coverage proves banner-gated activation with exactly one reload and stale-cache deletion (`e2e/pwa.spec.ts:130-214`).
- **SEO/JSON-LD safety**: `<` is escaped as `\u003c` before serialization (`tests/components/json-ld.test.tsx:25-28`, re-verified in the browser at `e2e/seo.spec.ts:127-128,143`), no abstract exposure (`e2e/seo.spec.ts:137-138`), and the sitemap count of 48 (`e2e/seo.spec.ts:5,104`) arithmetically corroborates the handoff's corpus (3 index pages + 6 topics + 20 terms + 19 papers), with `/~offline` excluded and noindexed (`e2e/seo.spec.ts:43-48,110`).

## Question 2 — Playwright web-server launcher

No blocking defect. Ownership bounds hold: cwd must be the `paperwords` package root (`scripts/playwright-web-server.mjs:234-247`), state path is confined to `output/playwright` and must be port-specific (`:249-264`), hostname is allowlisted (`:9,213-219`), and the detached child is its own process-group leader, so `process.kill(-childPid, …)` (`:281-309`) targets only that group. Parent-loss polling (`:114-121`) and SIGTERM→SIGKILL escalation (`:139-180`) close the orphan-server gap. Non-blocking risks are listed as findings 3–4.

## Question 3 — Docs vs implementation

The architecture and handoff descriptions of `/sw.js` semantics, worker scope, launcher behavior, and `PAPERWORDS_SITE_URL` fallback all match the code I read. Two documentation mismatches/omissions found (findings 1, 2, 5); the production-URL prerequisite is properly documented (`docs/RELEASE_HANDOFF.md:63-65`).

## Findings (all non-blocking; none is a code-correctness defect in the release path)

1. **[Doc/test mismatch]** `docs/TEST_PLAN.md:55` claims schedule tests prove "before-range and after-range Today fallbacks," but the supplied `tests/schedule/schedule.test.ts:19-242` contains no out-of-range case; `getScheduledTermForDate` simply returns `undefined` outside the range (`src/lib/schedule/index.ts:33-36`) and the fallback rendering lives in the Today route, uncovered by any supplied test. Possibly covered by an unsupplied file (e.g. `e2e/core.spec.ts`) — see question 1 below.
2. **[Doc/config inconsistency, non-blocking risk]** `docs/RELEASE_HANDOFF.md:59` presents `PAPERWORDS_PLAYWRIGHT_PORT` as a supported override, but `build:browser` hardcodes `PAPERWORDS_SITE_URL=http://127.0.0.1:4311` (`package.json:13`) into the prerendered build, and `e2e/seo.spec.ts:4-5` hardcodes the same base URL and a URL count. On any non-default port, canonical/OG/sitemap assertions would fail even though the launcher sets the runtime env correctly (`scripts/playwright-web-server.mjs:61`). Default-port verification is coherent; the override path is not.
3. **[Non-blocking risk / stale-state]** The launcher unconditionally sets `PAPERWORDS_PWA_VERSION_FILE` for every browser project (`scripts/playwright-web-server.mjs:34,60`). On a fresh clone, `output/playwright/pwa-version.json` does not exist until `e2e/pwa.spec.ts:34-37` creates it, so during e2e/a11y/seo runs `/sw.js` returns 500 (`app/sw.js/route.ts:16-25`) and service-worker registration silently fails on every page. This is fail-closed and evidently passes the gate, but it makes non-PWA browser runs exercise pages without a worker unless something else prepares the file — see question 3.
4. **[Non-blocking risk / portability]** The launcher's lifecycle depends on POSIX process-group semantics (`spawn(..., { detached: true })` at `scripts/playwright-web-server.mjs:55-57`; negative-PID kill at `:284`) and the config's single-quote shell quoting (`playwright.config.ts:103-105`), so it is macOS/Linux-only; and if the launcher itself is SIGKILLed, the state file is left claiming `"running"`. Both are acceptable for this local darwin handoff, and the documented recovery procedure (`docs/RELEASE_HANDOFF.md:86-95`) mitigates the stale-state case.
5. **[Documented-deployment-prerequisite omission]** `/sw.js` is a `force-dynamic` route handler that reads the filesystem/env per request (`app/sw.js/route.ts:12-27`), so any future production deployment requires a Node server runtime (`next start` or equivalent) — a pure static export would have no working service worker. `docs/RELEASE_HANDOFF.md:63-73` covers `PAPERWORDS_SITE_URL` and the version file but does not state this server-runtime prerequisite. Not a blocker for the local handoff, which explicitly grants no deployment authority (`docs/RELEASE_HANDOFF.md:101-103`).

## Clarification questions

1. Does an unsupplied test (another file under `tests/schedule/`, or `e2e/core.spec.ts`) cover the before-range/after-range Today fallback claimed at `docs/TEST_PLAN.md:55`, or should that line be corrected?
2. `src/lib/schedule/dates.ts` was not supplied; ARCHITECTURE.md:30 claims UTC-plus-fixed-offset arithmetic. Since the KST-independence test (`tests/schedule/schedule.test.ts:68-78`) cannot distinguish a local-time implementation when run on a machine already set to Asia/Seoul, does any config force a non-KST `TZ` for unit tests, or has `dates.ts` been verified to use only UTC getters?
3. Does `e2e/core.spec.ts` (or global setup) create `output/playwright/pwa-version.json` before e2e/a11y/seo runs, given finding 3?

No finding is evidence-backed as unsafe or materially incorrect for this local release; all five are documentation accuracy items or non-blocking risks for Codex to disposition.

APPROVE

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
