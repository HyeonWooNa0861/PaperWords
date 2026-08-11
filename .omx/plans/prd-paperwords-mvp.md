# PaperWords MVP PRD and Consensus Candidate

Status: Planner candidate for ralplan iteration 1. Not consensus-approved until Architect then Critic review both approve.
Date: 2026-08-11 KST
Owned follow-up artifact: `.omx/plans/test-spec-paperwords-mvp.md`

## Evidence Base

- Deep-interview spec requires a Next.js PWA with daily term, bilingual search, sourced Korean explanations, related terms, verified paper relationships, 20 seed terms, 90-day Asia/Seoul schedule, and full validation gates. Source: `.omx/specs/deep-interview-paperwords-mvp.md:12`, `.omx/specs/deep-interview-paperwords-mvp.md:16`, `.omx/specs/deep-interview-paperwords-mvp.md:20`.
- Non-goals and authority limits exclude auth, personalization, payments, social, push, CMS, vector search, runtime generation, automatic publication, commit, push, and deployment. Source: `.omx/specs/deep-interview-paperwords-mvp.md:32`, `.omx/specs/deep-interview-paperwords-mvp.md:36`, `.omx/specs/deep-interview-paperwords-mvp.md:39`.
- Research requires local validated display data, network-free validation, optional credentialed OpenAlex tooling, Crossref tooling-only verification, no copied abstracts, and a PWA ADR between minimal service worker and Serwist. Source: `.omx/plans/research-paperwords-stack.md:21`, `.omx/plans/research-paperwords-stack.md:31`, `.omx/plans/research-paperwords-stack.md:33`, `.omx/plans/research-paperwords-stack.md:68`.
- Current registry snapshot is evidence for bootstrap targets but must be proven by the generated lockfile before implementation claims. Source: `.omx/plans/research-paperwords-stack.md:45`, `.omx/plans/research-paperwords-stack.md:49`.
- Runtime state requires dedicated planner ownership and says existing planning artifacts are not consensus evidence. Architect then Critic approval remains required. Source: `.omx/state/autopilot-state.json:13`, `.omx/state/autopilot-state.json:29`, `.omx/state/autopilot-state.json:35`.
- Session handoff prohibits publication authority, commit, push, deploy, and secrets. Source: `/Users/nahw/Documents/.LLM-Wiki/projects/PaperWords/sessions/mvp-build/context.md:3`, `/Users/nahw/Documents/.LLM-Wiki/projects/PaperWords/sessions/mvp-build/context.md:8`.
- Current local inspection found no app source, `package.json`, or lockfile in `/Users/nahw/Documents/PaperWords`; bootstrap is part of execution, and lockfile verification is a required first gate.
- External primary docs refreshed during planning: Next.js 16.3 docs list Node >=20.9, App Router manifest support, and Turbopack as the default bundler; OpenAlex documents free API-key usage and rate/cost headers; Crossref documents public and polite access with rate/concurrency limits; Serwist documents both webpack and Turbopack Next guides.

## Product and Technical Outcome

PaperWords MVP is a production-shaped local Next.js App Router PWA for Korean-speaking AI and computer-science learners who encounter English terminology in papers.

The product outcome:

- A daily curated term selected deterministically from a versioned Asia/Seoul schedule.
- Search across English headwords, acronyms, aliases, Korean equivalents, and topic terms.
- Term detail pages with Korean explanations, related terms, source-backed definitions, and verified related papers.
- Topic browsing for lightweight discovery.
- Installable PWA behavior with an offline app shell and explicit update handling.
- Local-first content and paper metadata that build, test, and run without network or API keys.

The technical outcome:

- A strict TypeScript Next.js App Router application bootstrapped with pnpm through Corepack.
- Zod-validated local content and schedule files.
- Deterministic MiniSearch-backed search with explicit bilingual normalization and ranking tests.
- A minimal owned service worker and Next `app/manifest.ts` rather than Serwist for MVP.
- Vitest, React Testing Library, Playwright, accessibility, SEO, content integrity, and production-build checks.

## Non-Goals

- Authentication, user profiles, personalization, payments, social features, web push, CMS, vector database/search, runtime generative answers, automatic publication, commit, push, deployment, or external production setup.
- Runtime or build-time dependency on OpenAlex, Crossref, Semantic Scholar, or any external API.
- Copying paper abstracts into the app, even when metadata comes from a public source.
- Treating Claude as an implementation owner. Claude remains read-only advisory through bounded `$ask claude` review only.
- Treating these files as consensus approval. They are inputs to the next Architect and Critic gates.

## Architecture Boundaries

Use a static-first local content architecture:

- UI and routing live in the Next App Router.
- Content data lives in versioned local files and is parsed through a single content registry.
- Search index construction is local and deterministic.
- Daily scheduling is data-driven, versioned, and timezone-explicit.
- Metadata enrichment is tooling-only and optional; generated candidate records cannot become published content without validation.
- Tests and production build must not require network access, credentials, user accounts, Git mutations, or deployment.

Planned source boundaries for implementation:

- `app/`: route files, route metadata, layout, manifest, offline fallback route, and page composition.
- `components/`: reusable UI components only; no content validation or search ranking logic.
- `content/`: checked-in seed term, paper, topic, source, and schedule data.
- `src/lib/content/`: schemas, loaders, publication-state filtering, and integrity validators.
- `src/lib/search/`: normalization, index construction, ranking, and search evaluation helpers.
- `src/lib/schedule/`: KST date resolution and schedule selection.
- `src/lib/pwa/`: service-worker registration and update state.
- `scripts/`: optional metadata tooling, content validation, search evaluation, and schedule validation.
- `tests/` or colocated `*.test.ts(x)`: unit, integration, and regression tests.
- `e2e/`: Playwright browser tests.

## Routes, Components, and Data Flow

Required routes:

- `/`: Today route. Shows the KST daily term, short Korean explanation, topic chips, source state, and search entry.
- `/dictionary`: Search route. Uses `?q=` for shareable queries and exposes result ranking states.
- `/terms/[slug]`: Term detail route. Shows headword, acronym, aliases, Korean equivalents, explanation, examples, related terms, and paper relationships.
- `/topics`: Topic index route. Lists all published topics with term counts.
- `/topics/[slug]`: Topic detail route. Lists published terms and featured papers in that topic.
- `/papers/[id]`: Paper metadata route or deep-linked panel. Shows verified metadata, relation rationale, source links, and no copied abstract body.
- `/~offline`: Offline fallback route for navigation requests when cached pages are unavailable.

Core components:

- `TodayTermPanel`: renders the scheduled term and version metadata.
- `SearchBox`: handles query entry, Korean/English input, empty state, and oversized-query guard.
- `SearchResults`: renders weighted ranking, no-result state, and matched field labels.
- `TermHeader`, `TermExplanation`, `RelatedTerms`, `PaperRelationList`, `SourceList`.
- `TopicNav` and `TopicTermList`.
- `PublicationStateBadge` for internal review screens or development-only diagnostics; unpublished content must not be public-facing.
- `InstallPrompt` and `CacheUpdateBanner` for PWA install/update handling.

Data flow:

1. Local files in `content/` are parsed with Zod during validation and at build/runtime import boundaries.
2. The registry exposes only `published` terms, papers, and topics to route components unless a test explicitly loads fixtures.
3. The search builder receives the published registry, normalizes index fields, applies stable weights, and returns deterministic ranked results.
4. The schedule resolver receives the KST local date and a schedule version, then returns one published term slug.
5. Term pages join term records to related term slugs, topic slugs, paper relations, and source records through typed IDs.
6. Optional metadata scripts write candidate artifacts only under a tooling area and never publish directly.

## Schema and Publication States

Term record required fields:

- `slug`: stable ASCII slug.
- `headword`: canonical English headword.
- `acronym`: optional canonical acronym.
- `aliases`: English aliases, spelling variants, or expanded forms.
- `koreanEquivalents`: Korean term equivalents.
- `shortDefinitionKo`: short Korean definition.
- `explanationKo`: sourced Korean explanation.
- `topicSlugs`: one or more topic IDs.
- `relatedTermSlugs`: explicit related-term IDs.
- `paperRelations`: relation entries to verified paper IDs.
- `sourceRefs`: source IDs for the explanation and metadata.
- `publicationState`: publication workflow state.
- `verification`: reviewer, date, source checks, and notes.

Paper record required fields:

- `id`: stable local ID, preferably DOI-derived when DOI exists.
- `title`: verified title.
- `authors`: ordered author display list, truncated only with an explicit `displayTruncated` flag.
- `venue`: conference, journal, or publisher name when known.
- `year`: publication year.
- `doi`: optional DOI, normalized lowercase with `https://doi.org/` display link.
- `openAlexId`: optional, tooling-only source identifier.
- `url`: source or publisher URL.
- `metadataSources`: source IDs proving where metadata came from.
- `abstractStatus`: must be `not_copied` for MVP.
- `relations`: term relation type plus Korean relevance rationale.

Source record required fields:

- `id`: stable local source ID.
- `kind`: controlled source kind such as `publisher`, `doi-registry`, `openalex-record`, `official-documentation`, or `editorial-review`.
- `url` or normalized `doi`: resolvable evidence locator.
- `title`: human-readable source title.
- `publisherOrVenue`: publisher, registry, organization, or venue when applicable.
- `retrievedAt` and `verifiedAt`: ISO dates for retrieval and editorial verification.
- `reviewer`: non-secret reviewer identifier.
- `usagePolicy`: note covering metadata reuse and the MVP `not_copied` abstract policy.
- `verifies`: explicit record ID plus field names this source supports, such as paper title, authors, venue, year, DOI, or term explanation.

Verification is a provenance contract rather than a claim that tests can independently rediscover truth. Offline integrity tests must prove that every required published field is covered by at least one source record and an editorial verification attestation; human/source review establishes factual correctness.

Publication workflow:

- `draft`: editable content, not searchable, not schedulable, not public.
- `metadata_verified`: paper/source identifiers verified, not public unless language review passes.
- `language_reviewed`: Korean explanation reviewed, not daily-eligible until final publish.
- `published`: public routes, search index, topic pages, and schedule eligibility.
- `retired`: hidden from schedule and default search, accessible only if explicitly linked and not harmful.

Publication invariants:

- Only `published` terms may appear in search results, topic pages, or the daily schedule.
- Only `published` or verified paper records may render publicly.
- A term cannot become `published` without at least one source reference and all paper relations validating.
- No abstract body fields are allowed in published paper records.
- Build/test validation fails on orphaned slugs, duplicate slugs, DOI format errors, missing Korean rationale, invalid publication transitions, and scheduled unpublished terms.

## Paper Metadata Pipeline

Runtime, build, and default tests use only local curated content. No API key or network call is required.

Tooling-only pipeline:

1. Author seed term drafts manually with candidate papers and source links.
2. Run local content validation; drafts may fail publication checks but must parse.
3. Use Crossref only as an optional DOI/metadata verification tool with polite identification when configured. Crossref is not a runtime dependency.
4. Use OpenAlex only as an optional enrichment adapter when `OPENALEX_API_KEY` is present. OpenAlex anonymous access must not be assumed because current docs define API-key budget advantages and usage limits.
5. Treat Semantic Scholar as optional discovery only; discovered records stay unpublished until independently verified.
6. Store only bibliographic metadata, identifiers, source links, and Korean relevance notes. Do not persist copied abstracts.
7. Promote candidates through publication states using local review fields.

Required offline behavior:

- If `OPENALEX_API_KEY` is absent, the OpenAlex script exits with a skipped status and does not fail build/test.
- If Crossref contact configuration is absent, Crossref tooling exits with a skipped status or uses fixture mode, and does not fail build/test.
- Fixture tests cover parser behavior for successful, missing, malformed, and rate-limit-like responses without network.

## Search Normalization, Ranking, and Evaluation

Normalization requirements:

- Apply Unicode NFKC normalization.
- Case-fold ASCII English terms and acronyms.
- Normalize punctuation and separators so `R.A.G.`, `RAG`, `retrieval augmented generation`, and `retrieval-augmented generation` can converge where aliases define that relationship.
- Collapse whitespace.
- Preserve Hangul syllables and normalize Korean whitespace.
- Strip surrounding punctuation from queries.
- Reject or truncate oversized queries predictably before search.

Ranking requirements:

- Exact English headword match outranks acronym, alias, Korean equivalent, prefix, fuzzy, and body-text matches.
- Exact acronym and exact Korean equivalent are high-priority first-page matches.
- Prefix matches outrank fuzzy matches.
- Explanation/body text matches may help discovery but cannot outrank exact title/headword/acronym/alias/Korean matches.
- Ties sort deterministically by match class, configured weight, headword, then slug.
- Search returns an empty state for nonsensical, unsupported-script-only, or no-match queries without throwing.
- MiniSearch supplies candidate retrieval only. A deterministic pre-classifier and post-ranker assign explicit match classes and apply the hierarchy above, so package score changes cannot silently redefine product ranking.

Evaluation dataset:

- `tests/fixtures/search-eval.json` or equivalent must include at least 60 cases before release.
- Every published term must have at least one English and one Korean query case.
- Cases must cover headword exact, acronym exact, alias exact, Korean exact, Korean prefix, English prefix, punctuation/acronym normalization, bounded typo/fuzzy, Unicode compatibility, empty query, no-result, and oversized query.
- Each case declares expected top-1 or top-3 slugs and the rationale.
- The search evaluation command must pass deterministically with network blocked.

## Versioned 90-Day KST Schedule

Schedule v1 baseline:

- `scheduleId`: `paperwords-mvp-2026-08-11.v1`
- `timezone`: `Asia/Seoul`
- `startDateKst`: `2026-08-11`
- `endDateKst`: `2026-11-08`
- `durationDays`: 90

Schedule invariants:

- The schedule maps each KST calendar date to exactly one published term slug.
- All 90 dates are populated at release; reserved or empty active dates are invalid.
- `noRepeatWindowDays` is versioned with the schedule and is 20 for MVP v1. The same term cannot appear more than once in any sliding 20-day window, so at least 20 published terms can provide a complete 90-day schedule without pretending that all 90 terms are unique.
- Adding content later cannot rewrite a released schedule version or change past recommendations. A new schedule version is required for future changes.
- Topic distribution should avoid three consecutive days with the same primary topic when enough topics exist.
- Date resolution must use Asia/Seoul, not the local machine timezone or UTC day.
- Schedule versions are immutable after release. If execution starts after 2026-08-11 and v1 is stale, create a new `paperwords-mvp-YYYY-MM-DD.v2` schedule and record the reason.

## PWA Offline and Update Decision

MVP decision: implement a minimal owned service worker plus `app/manifest.ts`.

Required behavior:

- The app is installable with valid manifest metadata and icons.
- The service worker caches only the app shell, offline fallback, core static assets needed for navigation, and version metadata.
- It avoids broad runtime caching of scholarly content until cache invalidation is proven.
- It exposes a controlled update path: when a new service worker is waiting, show an update banner and reload only after user action.
- Offline navigation to cached core pages succeeds; non-cached pages show `/~offline` rather than a browser error.
- Stale cache tests prove that content version changes do not leave users permanently stuck on old data.

Minimal service-worker contract:

- Author the worker as the typed `app/sw.js/route.ts` route and serve it at `/sw.js` with JavaScript content type, no-cache response headers, and root scope permission.
- Keep app/content/cache version values in `src/lib/pwa/version.ts`, imported by both registration/update UI and the worker route generator.
- Use a narrow cache contract: navigation network-first with `/~offline` fallback; cache visited same-origin public pages and same-origin `/_next/static/` assets; never cache cross-origin requests, metadata tooling, mutation requests, or broad API responses.
- Define one client message, `SKIP_WAITING`, and one worker-to-client update signal. Never reload without explicit user action.
- The version-A/version-B Playwright harness must build two known cache versions and prove waiting-worker activation, old-cache deletion, and offline fallback.

Deferred Serwist trigger:

- Adopt Serwist later if requirements expand to complex precaching, background sync, sophisticated runtime caching, or cross-route cache policies that outweigh dependency and bundler complexity.

## Accessibility and SEO

Accessibility requirements:

- Korean explanations render with correct language context; root language should reflect the primary page language and terms can mark English spans with `lang="en"` where useful.
- Keyboard navigation covers search, result list, term links, topic filters, update banner, and install prompt.
- Focus states are visible and not color-only.
- Search input has a programmatic label and announces result counts.
- Color contrast meets WCAG AA for text and controls.
- Reduced-motion preference is honored for nonessential animation.
- Playwright plus axe checks report no critical or serious violations on required routes.

SEO requirements:

- Every public route has deterministic metadata title and description.
- Term and paper routes produce canonical URLs in local build configuration.
- `sitemap` and `robots` metadata routes exist for public pages.
- JSON-LD is generated for term/detail pages where schema fields are complete, without invented scholarly claims.
- Open Graph and Twitter summary metadata exist for Today, dictionary, term, topic, and paper surfaces.
- No unpublished/draft content appears in sitemap or structured data.

## Phased Stories and Dependencies

1. Bootstrap and verification harness
   - Dependencies: none.
   - Deliverables: Next App Router app, TypeScript strict mode, Tailwind, pnpm lockfile, lint/type/test/build scripts, Playwright plus `@axe-core/playwright`, and network-blocking test defaults.
   - Gate: lockfile resolves the registry snapshot or documents acceptable patch drift.

2. Content schema and publication registry
   - Dependencies: bootstrap.
   - Deliverables: Zod schemas, sample topics, sources, terms, papers, publication-state filters, content validation command.
   - Gate: malformed fixture tests fail for the right reasons.

3. Seed content and paper metadata
   - Dependencies: schema.
   - Deliverables: at least 20 published verified terms, verified related paper metadata, Korean relevance notes, no copied abstracts.
   - Gate: content integrity command passes with network disabled.

4. Search and evaluation
   - Dependencies: schema plus seed content.
   - Deliverables: normalization, index, search route integration, search eval dataset.
   - Gate: all search eval cases pass deterministically.

5. Daily schedule
   - Dependencies: published terms.
   - Deliverables: v1 KST schedule, resolver, Today route integration, schedule validation.
   - Gate: KST boundary and no-repeat tests pass.

6. Core routes and UI
   - Dependencies: content registry, search, schedule.
   - Deliverables: Today, dictionary, term, topic, paper, offline routes and components.
   - Gate: component/integration tests and mobile/desktop Playwright route checks pass.

7. PWA install, offline, and update behavior
   - Dependencies: core routes and manifest assets.
   - Deliverables: manifest, minimal service worker, registration, update banner, offline fallback.
   - Gate: Playwright install/offline/update tests pass in production build.

8. Accessibility, SEO, review, and QA
   - Dependencies: full app.
   - Deliverables: axe pass, SEO metadata checks, production build, code review, adversarial QA.
   - Gate: all verification commands pass or a documented safe blocker stops execution before commit/push/deploy.

## Exact Acceptance Criteria

- Bootstrap creates `package.json`, `pnpm-lock.yaml`, strict TypeScript config, Next App Router routes, and scripts for lint, typecheck, test, content validation, search evaluation, schedule validation, build, and Playwright.
- Lockfile verification proves `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `zod`, `minisearch`, `vitest`, `@testing-library/react`, `@playwright/test`, and `@axe-core/playwright` resolved from the registry snapshot or records the exact accepted drift.
- No runtime, production build, or default test command requires `OPENALEX_API_KEY`, Crossref contact settings, Semantic Scholar credentials, or live network.
- At least 20 `published` terms validate with source references, Korean equivalents, Korean explanations, related terms, and verified paper relationships.
- Every displayed paper validates title, author display, venue or source, year, identifier/source URL, relation type, Korean relevance rationale, and `abstractStatus: not_copied`.
- Draft or unverified terms never appear in search, daily schedule, topic pages, sitemap, or JSON-LD.
- Search evaluation passes at least 60 cases covering exact English, acronym, alias, Korean exact, Korean prefix, English prefix, punctuation normalization, Unicode normalization, bounded fuzzy behavior, no-result, malformed, and oversized input.
- Schedule validation proves the active version uses Asia/Seoul date math, contains exactly 90 populated KST dates, uses a versioned 20-day no-repeat window, has deterministic term selection, never schedules unpublished terms, and is immutable once released.
- Today, dictionary, term detail, topic index/detail, relation-only paper detail, and offline fallback routes pass Playwright checks at mobile and desktop widths. The paper route is not a discovery index or a second search product.
- PWA installability, offline app shell, offline fallback, service-worker waiting update, and stale-cache recovery pass Playwright checks against a production build.
- Accessibility checks report no critical or serious axe violations on required public routes.
- SEO checks prove deterministic route metadata, sitemap/robots, canonical URLs, Open Graph/Twitter metadata, and no unpublished content in structured output.
- Lint, typecheck, unit/integration tests, content integrity, search eval, schedule validation, production build, and Playwright all pass locally.
- Independent code review recommendation is `APPROVE` with architecture `CLEAR`, or execution stops with a concrete safe blocker.
- No commit, push, deploy, credential use, paid service, or external publication occurs without new user authority.

## Risks and Mitigations

- Scholarly accuracy risk: source or paper claims can be wrong. Mitigate with schema-required source references, DOI/source validation, Korean relevance notes, and read-only Claude review at content milestones.
- Metadata API drift risk: OpenAlex and Crossref policies can change. Mitigate by keeping APIs tooling-only, optional, cached, and skipped by default.
- Serwist/Next 16 integration risk: PWA plugins may add bundler constraints. Mitigate by choosing a minimal owned service worker for MVP.
- Search quality risk: bilingual and acronym queries can rank poorly. Mitigate with explicit weights and a release-blocking eval dataset.
- Timezone risk: Today page can shift at UTC boundaries. Mitigate with KST-only schedule resolver tests.
- Cache staleness risk: service worker can trap old content. Mitigate with versioned caches, update banner tests, and stale-cache Playwright scenarios.
- Content variety risk: a 20-term seed repeats across a 90-day schedule. Mitigate with the explicit 20-day no-repeat window, topic/difficulty balance, immutable schedules, and later content expansion through new versions.
- Scope creep risk: research features can pull in auth, CMS, vector search, or live APIs. Mitigate with non-goals and stop conditions.

## Definition of Done

- Architect then Critic approve the PRD and test spec, and the ralplan consensus gate is recorded by the owning workflow.
- All implementation stories are complete with local evidence.
- All acceptance criteria above pass.
- Test evidence includes command output summaries for lint, typecheck, unit/integration, content integrity, search eval, schedule validation, production build, Playwright, accessibility, SEO, offline/install/update, and stale cache.
- Claude advisory reviews, if run, are recorded as read-only input and cannot override Codex verification.
- No secrets are written to the project or handoff files.
- Execution stops before commit, push, or deploy unless the user gives new explicit authority.

## Rollback and Stop Conditions

Rollback conditions:

- If a dependency bootstrap corrupts the project shape, revert only the bootstrap files created in this task and preserve user or other-agent changes.
- If service-worker behavior causes stale or broken navigation, disable registration and keep manifest-only install metadata while preserving route functionality until fixed.
- If content validation reveals invalid scholarly claims, demote affected records to `draft` and remove them from schedule/search.

Stop conditions:

- Stop before using credentials, paid services, external production, commit, push, deployment, destructive cleanup, or secret storage.
- Stop if runtime/build/default tests require network.
- Stop if fewer than 20 terms can be verified from local sources.
- Stop if the active schedule cannot provide a deterministic KST daily term for the MVP period.
- Stop after three repeated identical QA or review failures with no new recovery path.
- Stop if Architect or Critic rejects the plan and requests replanning.

## RALPLAN-DR

### Summary

Build PaperWords as a static-first local Next.js 16 PWA with typed local content, deterministic bilingual search, a fully populated 90-day KST schedule with a versioned 20-day repeat window, verified scholarly metadata, and a minimal owned service worker. Keep metadata APIs out of runtime/build/default tests and require lockfile verification before implementation claims.

### Principles

1. Source-gated publication: no scholarly fact appears publicly without traceable source evidence.
2. Local-first operation: runtime, build, and default tests must work without network or API keys.
3. Determinism over personalization: daily terms and search rankings must be reproducible and testable.
4. Minimal PWA ownership: satisfy install/offline/update requirements without broad cache machinery until needed.
5. Consent boundary: no commit, push, deploy, credentials, paid services, or external publication without new user authority.

### Drivers

1. Correctness and trust for Korean explanations and paper relationships.
2. Network-independent development, testing, and runtime behavior.
3. Compatibility and testability under Next.js 16 with current package constraints.

### Options

Option A: Static-first Next.js app with local content, MiniSearch, a fully populated 90-day schedule with a versioned 20-day repeat window, and minimal owned service worker.

- Pros: small dependency surface, deterministic tests, avoids runtime API keys, easier cache reasoning, fits MVP scope.
- Cons: manual service-worker maintenance, no automatic advanced precaching, content updates require local release workflow.

Option B: Static-first Next.js app with Serwist-managed PWA caching.

- Pros: stronger precache/runtime-cache tooling, common PWA patterns, easier future expansion.
- Cons: adds service-worker framework complexity, requires careful Next 16 bundler mode choice, larger cache behavior surface to test.

Option C: Live metadata-backed app using OpenAlex/Crossref at runtime.

- Pros: fresher metadata and less manual enrichment.
- Cons: violates network-free runtime/build/test constraint, depends on API policies/keys, increases privacy and failure risk. Invalid for MVP.

### Decision

Choose Option A for MVP. Use local curated content, MiniSearch, a versioned KST schedule, and a minimal owned service worker. Keep OpenAlex and Crossref as optional tooling-only adapters and defer Serwist until advanced caching requirements justify it.

### Consequences

- Execution must build and test a small service worker directly instead of outsourcing cache policy.
- Content validation becomes a release-critical path.
- Search quality is governed by a local eval dataset rather than external ranking.
- Metadata freshness depends on explicit tooling runs and editorial review.
- Future PWA expansion has a clear ADR trigger instead of being mixed into MVP bootstrap.

### Follow-ups

- Architect review should challenge the owned service-worker maintenance burden and schedule/content volume tension.
- Critic review should verify that acceptance criteria are testable and that no external API is required for default validation.
- Execution should update the ralplan handoff state only after Architect then Critic approval, not after this planner candidate alone.
- If the implementation later requires complex cache policies, create a follow-up ADR for Serwist adoption.

## ADR: Minimal Owned Service Worker vs Serwist

Status: Proposed, pending Architect and Critic consensus.

Decision:

- Use a minimal owned service worker for the PaperWords MVP.
- Do not adopt `@serwist/next` or `@serwist/turbopack` in the MVP bootstrap.

Drivers:

- MVP offline scope is app shell, fallback navigation, and controlled update behavior, not complex background sync or broad runtime caching.
- Next.js 16 uses Turbopack by default, while service-worker frameworks still require explicit bundler/config choices that increase verification surface.
- The project has no existing app source or lockfile, so minimizing bootstrap complexity has high value.
- The acceptance criteria require network-independent default tests and predictable stale-cache behavior.

Alternatives considered:

- Minimal owned service worker: chosen for small scope and direct testability.
- Serwist with webpack-oriented `@serwist/next`: rejected for MVP because it adds plugin and bundler-mode coupling before advanced caching is needed.
- Serwist with Turbopack route integration: deferred because it adds extra route/build mechanics and native esbuild concerns for a simple app shell.
- Manifest-only PWA without a service worker: invalid because the MVP explicitly requires offline app shell and update behavior.

Why chosen:

- The owned worker can cache a narrow allowlist, expose a simple version/update flow, and be fully covered by Playwright stale-cache tests.
- It preserves Next 16 default build behavior unless execution evidence proves a flag change is needed.
- It keeps PWA behavior understandable for reviewers and future maintainers.

Consequences:

- Executors must write and test cache versioning, install, activate, fetch, waiting-worker, and client-message flows.
- Future requirements such as route-level runtime caching, background sync, or large precache manifests may require a new ADR and migration to Serwist.
- The service worker must be intentionally conservative: no broad API/data caching and no hidden update reloads.

Follow-ups:

- Add a service-worker contract test before broad UI work depends on offline behavior.
- Record cache names and app/content version fields in one source of truth.
- Revisit Serwist only after MVP verification passes or a concrete cache requirement exceeds the owned worker.

## Available-Agent Roster and Staffing Recommendation

Available agent types from the current workspace model catalog:

- `explore`: repo-local lookup and impact mapping.
- `researcher`: official docs and external reference checks.
- `dependency-expert`: package or SDK selection and upgrade decisions.
- `planner`: sequencing and risk planning.
- `architect`: architecture soundness review.
- `debugger`: root-cause diagnosis.
- `executor`: implementation.
- `test-engineer`: test strategy and coverage.
- `verifier`: completion evidence and claim validation.
- `code-reviewer`: independent review.
- `designer`: UI/UX architecture.
- `writer`: documentation and release notes.
- `critic`: plan and quality challenge.

Recommended staffing after consensus approval:

- Default durable path: `$ultragoal` as the goal ledger owner, with this PRD and test spec as inputs.
- Parallel delivery path: `$team` under Ultragoal checkpoints if speed matters. Suggested lanes are one executor for bootstrap/app shell, one executor for content/schema, one executor for search/schedule, one test-engineer for validation/Playwright/PWA, one designer for UI polish if needed, then code-reviewer and verifier as independent gates.
- Solo path: one executor can complete the MVP sequentially if coordination overhead is not worth it. The solo order should be bootstrap, schema, seed content, search, schedule, routes, PWA, then verification.
- Ralph fallback: use `$ralph` only if the user explicitly wants a persistent single-owner verification/fix loop instead of Ultragoal tracking.

Suggested reasoning levels by lane:

- Executor lanes: medium.
- Search/schedule correctness lane: medium to high.
- Test-engineer and verifier lanes: high.
- Architect/Critic review lanes: high.
- Designer lane: medium unless major visual rework is requested.

Execution hints, not launched here:

- Do not start Team, Ultragoal, Ralph, commit, push, or deploy from this planner lane.
- Architect should review this PRD first, then Critic should review both PRD and test spec after Architect completes.
- If approved, hand execution the two plan files plus `.omx/specs/deep-interview-paperwords-mvp.md`, `.omx/plans/research-paperwords-stack.md`, and `.omx/state/autopilot-state.json`.

## Team Verification Path

Before any Team lane shuts down, it should return:

- Files changed, scoped to its assigned area.
- Validation commands run and exact pass/fail summary.
- Known residual risks or blockers.
- Confirmation that no network, credentials, commit, push, deploy, or publication occurred.

Before Ultragoal checkpoints completion, it should verify:

- The team evidence maps to every acceptance criterion.
- Lockfile verification was completed.
- All default commands pass with network disabled.
- Architect/Critic consensus and later code-review/QA gates are recorded separately.
