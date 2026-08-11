# PaperWords G007 Cleanup Plan

Status: pre-implementation plan artifact. This document must exist before any G007 source or test edits begin.

## Scope

G007 is a cleanup and behavior-lock pass for `/Users/nahw/Documents/PaperWords`, not a feature redesign. It should tighten tests and contracts first, then remove dead code, then simplify small duplication, with fresh verification after each pass.

In scope:

- Behavior lock and boundary repair for content provenance, search terminal cases, schedule validator negatives, and configured PWA version-file failure behavior.
- Dead deletion for `TermTitleBlock` unused heading/link props and the unused `offlineHref` route export.
- Small duplication cleanup for generated metadata returns and duplicate `searchTerms` calls.
- Final local verification and independent review handoff.

Out of scope:

- No registry-wide abstraction or broad content architecture redesign.
- No UI redesign, layout redesign, color/type system work, or Today rail rework beyond preserving already grounded behavior.
- No new dependencies.
- No commit, push, deploy, credentials, paid service, external scholarly API, or publication.

## Evidence Base

- Repo authority starts with the PaperWords docs and ADRs, and forbids credentials, paid services, external scholarly APIs, commit, push, deploy, and network-dependent default tests: `AGENTS.md:5`, `AGENTS.md:13`, `AGENTS.md:14`.
- The app must remain static-first, source-backed, and preserve the 90-day Asia/Seoul schedule with the versioned 20-day no-repeat window: `AGENTS.md:18`, `AGENTS.md:19`, `AGENTS.md:20`.
- The MVP spec requires published scholarly fields to have source references plus editorial verification, local network-independent default verification, deterministic search, PWA offline fallback, and controlled updates: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_SCHEMA.md`, `docs/TEST_PLAN.md`.
- Consensus preserves the provenance-vs-truth boundary and keeps PWA update behavior as an independent release-blocking lane: `.omx/plans/ralplan-consensus-paperwords-mvp.md:18`, `.omx/plans/ralplan-consensus-paperwords-mvp.md:26`, `.omx/plans/ralplan-consensus-paperwords-mvp.md:30`.
- G007 objective is cleanup without behavior drift, fresh verification, independent code-reviewer approval, and architecture CLEAR: `.omx/ultragoal/goals.json:83`, `.omx/ultragoal/goals.json:85`.
- Read-only content audit found provenance/attestation risk around aliases and source claims, including an unsupported RAG alias example from the initial three-term review artifact.
- Read-only representative UI audit found no release blocker and its Today rail recommendations are already reflected by `showSources={false}` and slice hints in `components/TodayTermPanel.tsx:45`.

## Fallback Classification

Preserve grounded fallbacks:

- Service worker navigation failure chain is legitimate product fallback: network fetch, cached page, cached `/dictionary` shell for dictionary requests, cached `/~offline`, then explicit 503 if no offline fallback is cached. Evidence: `src/lib/pwa/worker.ts:86`, `src/lib/pwa/worker.ts:94`, `src/lib/pwa/worker.ts:100`, `src/lib/pwa/worker.ts:108`, `src/lib/pwa/worker.ts:113`.
- Today out-of-range fallback is legitimate deterministic preview behavior: outside the schedule range, use the first or last released schedule entry and show a Korean explanation. Evidence: `src/lib/ui/content.ts:135`, `src/lib/ui/content.ts:136`, `src/lib/ui/content.ts:146`, `src/lib/ui/content.ts:152`; currently covered in `tests/routes/core-routes.test.tsx:61`.

Repair masking fallbacks:

- A configured `PAPERWORDS_PWA_VERSION_FILE` that is missing, unreadable, or malformed must not silently fall back to direct/default versions. The current route catches every error and returns direct overrides at `app/sw.js/route.ts:39` and `app/sw.js/route.ts:48`, while Playwright always configures the file path at `playwright.config.ts:26`. Treat this as masking slop.
- Production default behavior remains valid only when `PAPERWORDS_PWA_VERSION_FILE` is unset. Evidence: `docs/ARCHITECTURE.md` states absent override files use deterministic defaults; the cleanup should preserve that unset-env contract.

## Ownership Split

- Implementation owner: one executor lane should make the changes sequentially in the pass order below.
- Test owner: same executor may add the narrow tests, but each pass must fail on the intended defect before or during the repair when practical, then pass after the repair.
- Review owner: independent code-reviewer/verifier after implementation should check for behavior drift and architecture CLEAR, separate from the implementation context.
- Planner artifact owner: this plan file only. No implementation should be performed inside this planning pass.

## Exact File Ownership

Behavior lock and boundary repair:

- `src/lib/content/registry.ts`: conditional published-term provenance requirements for non-empty `acronym` and non-empty `aliases`, using the existing `checkProvenanceCoverage` path at `src/lib/content/registry.ts:646`.
- `tests/content/registry.test.ts`: minimal failing tests for missing source provenance, missing editorial attestation, and source/attestation mismatch for `terms.acronym` and `terms.aliases`.
- `tests/content/fixtures.ts`: update valid fixtures so acronym/alias source mappings and editorial `sourceChecks` align with the stricter validator.
- `content/terms.ts` and `content/sources.ts`: align production acronym/alias field-source mappings and editorial source checks. Existing examples already use `acronym` and `aliases` in records such as `retrieval-augmented-generation` at `content/terms.ts:59` and matching source mappings at `content/sources.ts:85`.
- `tests/search/search.test.ts` and `tests/fixtures/search-eval.json`: make empty `expectedTop3` assertions exact empty, and add/verify terminal query status expectations.
- `tests/schedule/schedule.test.ts`: negative validator cases for date sequence, duration mismatch, repeat-window violation, and three-entry primary-topic streak.
- `app/sw.js/route.ts`: fail closed when a configured version file cannot be parsed or read.
- `e2e/pwa.spec.ts` and `e2e/helpers/pwa.ts`: clean version-file preparation plus missing/malformed configured-file tests.

Dead deletion:

- `components/TermTitleBlock.tsx`: remove unused `headingLevel`, `linkHeading`, `Link`, `termHref`, and the link/dynamic-heading branch after confirming no call sites pass those props.
- `src/lib/ui/routes.ts`: remove unused `offlineHref`.

Duplication cleanup:

- `app/terms/[slug]/page.tsx`, `app/topics/[slug]/page.tsx`, and `app/papers/[id]/page.tsx`: return `createRouteMetadata(...)` directly for missing-record metadata instead of wrapping it in `{ ...createRouteMetadata(...) }`.
- `tests/search/search.test.ts`: in `runAllQueries`, call `searchTerms` once per case and reuse the response for `slugs` and `status`.

## Pass 0: Behavior Lock And Boundary Repair

1. Content provenance lock.
   - Add minimal tests that fail when a published term has `acronym` or non-empty `aliases` without matching source `verifies` coverage.
   - Add minimal tests that fail when source coverage exists but editorial `verification.sourceChecks` lacks the same field.
   - Add a mismatch test that proves the same declared source must satisfy both source provenance and editorial attestation, using the existing reason text from `src/lib/content/registry.ts:747`.
   - Implement conditional required fields for published terms: existing required fields stay unchanged, `acronym` is required only when present, and `aliases` is required only when `term.aliases.length > 0`.
   - Update `tests/content/fixtures.ts`, `content/terms.ts`, and `content/sources.ts` until `test:content` passes with the stricter contract.
   - Do not make broad registry helper abstractions unless the local code becomes harder to read without one.

2. Search eval terminal lock.
   - Extend the search eval fixture shape with optional `expectedStatus`.
   - Add `expectedStatus` for terminal and no-result cases: `empty-query` -> `empty`, `malformed-punctuation-only` -> current normalized terminal status, `unsupported-script-only` -> `unsupported`, `oversized-query` -> `oversized`, and `no-result-supported` -> `ready`.
   - Replace the vacuous `expect.arrayContaining([])` path in `tests/search/search.test.ts:80` with exact empty assertion when `expectedTop3` is `[]`.
   - Preserve partial top-3 containment for non-empty `expectedTop3` cases unless a stronger exact ordering assertion is intentionally added for a specific case.

3. Schedule validator negative tests.
   - Add tests that mutate a fixture schedule to prove `validateScheduleIntegrity` reports date sequence gaps/duplicates through `checkDateSequence` at `src/lib/schedule/validation.ts:58`.
   - Add a duration mismatch test for inclusive span vs `durationDays`, covering `src/lib/schedule/validation.ts:15`.
   - Add a repeat-window violation test covering `src/lib/schedule/validation.ts:123`.
   - Add a three-entry primary-topic streak test using three different published terms with the same primary topic so the failure is the topic streak, not repeat-window duplication. Target `src/lib/schedule/validation.ts:163`.

4. PWA configured version-file contract.
   - Change `app/sw.js/route.ts` so an unset `PAPERWORDS_PWA_VERSION_FILE` keeps deterministic defaults/direct env overrides, but a set path that is missing, unreadable, or malformed produces an explicit non-2xx response and does not generate a service worker.
   - Suggested contract: `GET /sw.js` returns `500` with a short plain-text diagnostic and a dedicated header such as `X-PaperWords-Pwa-Version-File-Error: 1`; no generated worker body is returned.
   - Add Playwright/request tests that remove the configured version file and write malformed JSON, then assert the explicit failure contract.
   - Add helper preparation so every normal PWA test starts from a known valid `output/playwright/pwa-version.json` and leaves later tests clean. `e2e/helpers/pwa.ts:29` already owns valid writes.
   - Preserve the current PWA update, stale-cache deletion, and offline fallback tests at `e2e/pwa.spec.ts:60`, `e2e/pwa.spec.ts:87`, and `e2e/pwa.spec.ts:168`.

Targeted verification after Pass 0:

```bash
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:content
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:search
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:schedule
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:pwa
```

## Pass 1: Dead Deletion

1. `components/TermTitleBlock.tsx`.
   - Confirm with `rg "linkHeading|headingLevel|TermTitleBlock"` that no caller relies on these props.
   - Remove `headingLevel` and the dynamic `Heading` branch if every call site is an H1 today.
   - Remove `linkHeading`, the conditional `<Link>` branch, and the now-unused `Link` and `termHref` imports.
   - Keep the public rendered title, acronym display, aliases, Korean equivalents, topic chips, and `id={headingId}` behavior unchanged.

2. `src/lib/ui/routes.ts`.
   - Confirm with `rg "offlineHref"` that only the export remains.
   - Delete `offlineHref`.
   - Do not replace working literal `/~offline` route usage or introduce a route registry abstraction.

Targeted verification after Pass 1:

```bash
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm lint
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm typecheck
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test
```

## Pass 2: Small Duplication Cleanup

1. Direct route metadata returns.
   - In `app/terms/[slug]/page.tsx:33`, `app/topics/[slug]/page.tsx:29`, and `app/papers/[id]/page.tsx:31`, replace the missing-record `return { ...createRouteMetadata(...) }` shape with direct `return createRouteMetadata(...)`.
   - Leave `app/layout.tsx:7` alone because it intentionally spreads route metadata and adds manifest/icons/application metadata.

2. Single `searchTerms` call.
   - In `tests/search/search.test.ts:132`, compute `const response = searchTerms(testCase.query, { index })` once per fixture case and reuse it for both slugs and status.
   - Do not change search ranking logic, MiniSearch options, normalization, or field weights in this pass.

Targeted verification after Pass 2:

```bash
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm lint
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm typecheck
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:search
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test
```

## Pass 3: Final Verification And Review Gate

Run the full release gate after all targeted checks pass:

```bash
npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify
```

Then perform the required independent review handoff:

- Independent code review must return `APPROVE` or the implementation must fix blocking findings.
- Architecture review must return `CLEAR` or the implementation must stop with a concrete blocker and repair plan.
- Final G007 report should include changed files, exact verification commands and outcomes, residual risks, and confirmation that no commit, push, deploy, credentials, paid service, or external publication occurred.

## Acceptance Criteria

- Published terms with present `acronym` or non-empty `aliases` cannot pass content validation unless the same declared source both maps the exact field in `source.verifies` and appears in editorial `verification.sourceChecks`.
- Minimal content tests fail for missing acronym/alias source provenance, missing acronym/alias editorial attestation, and mismatched source/attestation alignment.
- Production content and fixture content pass the stricter validator without demoting published records or weakening existing source-backed fields.
- `expectedTop3: []` search eval cases assert exact empty result lists, not `arrayContaining([])`.
- Terminal search cases assert `response.query.status`, and no-result-supported remains `ready` with exact empty results.
- Schedule tests include negative coverage for sequence, duration, no-repeat window, and primary-topic streak.
- When `PAPERWORDS_PWA_VERSION_FILE` is unset, `/sw.js` can still use deterministic default/direct versions.
- When `PAPERWORDS_PWA_VERSION_FILE` is set and the file is missing or malformed, `/sw.js` fails explicitly instead of silently serving fallback versions.
- Normal PWA Playwright tests prepare a clean valid version file before service-worker requests.
- `TermTitleBlock` rendered output is unchanged for current Today and term detail call sites, with dead props/imports removed.
- `offlineHref` is removed and no references remain.
- Missing-record metadata in term/topic/paper routes returns `createRouteMetadata(...)` directly.
- Search eval helper calls `searchTerms` once per query in `runAllQueries`.
- No dependency is added and `package.json`/`pnpm-lock.yaml` should remain unchanged unless an unrelated pre-existing drift is discovered and explicitly reported.
- Full `pnpm verify` passes locally, or execution stops with the first unrecovered blocker and exact failing output.

## Rollback And Stop Conditions

Rollback conditions:

- If Pass 0 validator changes produce excessive content churn beyond acronym/alias field alignment, revert only the validator/test/content edits from that pass and re-plan the provenance boundary.
- If the explicit PWA version-file failure contract breaks normal version-A/version-B PWA tests after clean preparation, revert the PWA route/test edits from that pass and rework the failure contract before touching later passes.
- If dead deletion changes rendered headings, links, or route accessibility, revert only the `TermTitleBlock` deletion and keep the behavior-lock changes intact.

Stop conditions:

- Stop before commit, push, deploy, external publication, credentials, paid services, or external scholarly APIs.
- Stop if a planned cleanup requires a new dependency.
- Stop if fixing acronym/alias provenance requires factual source research outside the current local evidence; record the exact unsupported field and defer source research rather than inventing provenance.
- Stop if any verification command begins requiring external network access.
- Stop if preserving the 90-day KST schedule, the 20-day no-repeat window, the service-worker offline fallback chain, or the Today out-of-range stable fallback conflicts with a cleanup step.
- Stop after three repeated identical verification failures with no new recovery path.

## Handoff Notes

- Start implementation at Pass 0. Do not perform Pass 1 or Pass 2 before the behavior-lock tests exist.
- Keep changes small and commit-ready, but do not commit.
- Prefer deletion and existing utilities over new abstractions.
- Defer registry broad abstraction and UI redesign to later explicitly scoped work.
