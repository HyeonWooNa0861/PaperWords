# PaperWords MVP Test Specification

Status: Planner candidate for ralplan iteration 1. Not consensus-approved until Architect then Critic review both approve.
Date: 2026-08-11 KST
Companion PRD: `.omx/plans/prd-paperwords-mvp.md`

## Test Philosophy and Default Network Policy

Default tests must be deterministic and network-independent.

- Unit, component, integration, content integrity, search evaluation, schedule validation, production build, Playwright, accessibility, SEO, offline/install/update, and stale-cache tests must pass without OpenAlex, Crossref, Semantic Scholar, internet access, API keys, user accounts, Git writes, commit, push, or deploy.
- Metadata API behavior is tested through local fixtures by default.
- Live metadata tooling may exist only behind explicit opt-in flags such as `ALLOW_NETWORK_METADATA=1` plus the relevant credential or contact configuration.
- Any default test that performs an external `http` or `https` request outside `localhost` fails.
- Bootstrap may require package installation once, but release claims must cite the generated `pnpm-lock.yaml` rather than the registry snapshot alone.

## Reproducible Commands

These are the target commands execution must provide after bootstrap. Names may be implemented as `package.json` scripts, but the behavior must match.

Bootstrap and lockfile evidence:

```bash
corepack enable
corepack pnpm install
corepack pnpm install --frozen-lockfile
corepack pnpm exec node scripts/verify-lockfile.mjs
```

Default verification, network-independent:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:content
corepack pnpm test:search
corepack pnpm test:schedule
corepack pnpm build
corepack pnpm test:e2e
corepack pnpm test:a11y
corepack pnpm test:seo
corepack pnpm test:pwa
```

Single full local gate:

```bash
corepack pnpm verify
```

Optional tooling-only metadata checks:

```bash
corepack pnpm metadata:fixtures
ALLOW_NETWORK_METADATA=1 CROSSREF_MAILTO=person@example.com corepack pnpm metadata:crossref -- --limit 5
ALLOW_NETWORK_METADATA=1 OPENALEX_API_KEY=replace-me corepack pnpm metadata:openalex -- --limit 5
```

The two `ALLOW_NETWORK_METADATA=1` commands are not part of the default MVP verification gate.

## Unit Tests

Required coverage:

- Content schema accepts valid term, paper, topic, source, and schedule fixtures.
- Content schema rejects missing source references, duplicate slugs, orphaned related terms, invalid DOI formats, copied abstract fields, invalid publication states, and scheduled unpublished terms.
- Source provenance validation rejects missing evidence locators, missing verification dates/reviewer, unknown verified fields, and published fields not covered by a source record plus editorial attestation.
- Publication-state filtering exposes only `published` records to public loaders.
- Search normalization handles Unicode NFKC, acronym punctuation, case-folding, whitespace collapse, Hangul preservation, Korean whitespace, punctuation stripping, empty input, unsupported input, and oversized input.
- Ranking weights enforce exact headword over acronym/alias/Korean/prefix/fuzzy/body matches, with deterministic tie-breaks.
- KST schedule resolver maps dates using `Asia/Seoul` and does not depend on machine local timezone.
- Service-worker helper/version logic produces stable cache names and update states.
- Metadata fixture parsers handle Crossref/OpenAlex success, missing fields, malformed fields, and simulated 429/403/error responses without network.

Acceptance:

- Unit tests pass under `corepack pnpm test`.
- Network is stubbed or blocked during unit tests.
- Any accidental external fetch fails the test run.

## Component and Integration Tests

Required coverage:

- `TodayTermPanel` renders the scheduled term, Korean explanation, topic chips, and source/verification cues.
- `SearchBox` and `SearchResults` support keyboard entry, URL query hydration, empty state, no-result state, Korean query rendering, long-query guard, and ranked result display.
- `TermDetail` joins term, related terms, papers, sources, and topic records correctly.
- `PaperRelationList` shows relation type and Korean relevance rationale and never renders an abstract body.
- `TopicNav` and topic pages show only published content.
- `InstallPrompt` and `CacheUpdateBanner` render accessible labels and state transitions.
- Route-level integration verifies `/`, `/dictionary?q=...`, `/terms/[slug]`, `/topics`, `/topics/[slug]`, `/papers/[id]`, and `/~offline` with local fixtures.

Acceptance:

- Component and integration tests are included in `corepack pnpm test`.
- Tests do not require browser network, external APIs, or API keys.

## Content Integrity Tests

Required checks:

- At least 20 terms are `published`.
- Every published term has an English headword, at least one Korean equivalent, Korean explanation, topic, source reference, verification record, and valid related-term references.
- Every displayed paper has verified title, authors, year, venue/source, identifier or URL, relation type, Korean relevance rationale, and source references.
- Every required published term and paper field is covered by at least one source record whose `verifies` mapping names that record and field, plus an editorial verification attestation.
- No published paper contains copied abstract body fields such as `abstract`, `abstractText`, `abstractKo`, or equivalent.
- `abstractStatus` is `not_copied` for all MVP paper records.
- Source links parse as URLs, DOI links normalize predictably, and duplicate identifiers are rejected.
- Draft, metadata-only, language-reviewed, or retired records do not appear in public indexes, sitemap, JSON-LD, search index, or schedule.

Acceptance:

- `corepack pnpm test:content` passes.
- Failures list record ID, field path, and reason.

## Search Evaluation Dataset

Dataset requirements:

- Store as `tests/fixtures/search-eval.json` or an equivalent committed fixture.
- Include at least 60 cases before release.
- Include at least one English and one Korean query for every published term.
- Include query classes: English exact, acronym exact, alias exact, Korean exact, Korean prefix, English prefix, punctuation-normalized acronym, hyphen/space variation, Unicode compatibility, bounded typo/fuzzy, empty query, no-result, malformed query, unsupported script, and oversized query.
- Each case declares query, class, expected top-1 or top-3 slugs, and rationale.

Acceptance:

- `corepack pnpm test:search` passes 100 percent of required release cases.
- Ranking output is deterministic across repeated runs.
- No live API or remote search service is used.

## Schedule Invariant Tests

Required checks:

- Active schedule declares `scheduleId`, `timezone: Asia/Seoul`, `startDateKst`, `endDateKst`, `durationDays`, and immutable version metadata.
- Baseline v1 spans `2026-08-11` through `2026-11-08` inclusive unless execution creates a documented later v2.
- Every one of the 90 schedule dates maps to exactly one published term slug; reserved or empty slots are invalid.
- The schedule declares `noRepeatWindowDays: 20`, and no term appears more than once in any sliding 20-day window.
- No unpublished, draft, retired, orphaned, or missing term is scheduled.
- KST boundary tests verify dates around `00:00` and UTC offset boundaries.
- Topic balance prevents three consecutive days with the same primary topic when enough topics exist.

Acceptance:

- `corepack pnpm test:schedule` passes.
- The Today route uses the same resolver covered by tests.

## Playwright Mobile and Desktop Tests

Required browsers/viewports:

- Desktop Chromium at a common laptop viewport.
- Mobile Chromium emulating a modern phone viewport.

Required flows:

- `/` loads the Today page, visible Korean explanation, and search entry.
- `/dictionary` accepts English and Korean queries and opens a result.
- `/terms/[slug]` shows term details, related terms, sources, and paper relations.
- `/topics` and `/topics/[slug]` navigate and filter correctly.
- `/papers/[id]` or the paper panel shows metadata, relation rationale, and no abstract body.
- Direct deep links refresh successfully.
- Layout has no incoherent overlap at mobile or desktop widths.
- Keyboard tab order reaches search, result links, term links, topic filters, update banner, and install controls.

Acceptance:

- `corepack pnpm test:e2e` passes against a production build or a documented preview server command.
- Playwright blocks non-localhost external requests by default.

## Offline, Install, and Update Tests

Installability:

- Manifest exists through Next App Router metadata or `app/manifest.ts`.
- Required icon sizes, `name`, `short_name`, `start_url`, `display`, `theme_color`, and `background_color` are present.
- Browser installability checks pass where Playwright can observe them.

Offline:

- After first online load, set browser offline.
- `/`, `/dictionary`, an already visited term route, and `/~offline` behave predictably.
- Uncached navigation shows `/~offline` or an in-app offline state, not a browser error.
- Search over local indexed content continues when offline if the app shell and data were cached.

Update:

- A changed app/content version causes a new service worker waiting state.
- User sees an accessible update banner.
- App reloads only after user action.
- Old caches are deleted after activation, while the current app shell remains usable.
- The worker is served from `/sw.js`, derives its cache version from the shared version module, accepts only the documented `SKIP_WAITING` client message, and never caches cross-origin, mutation, metadata-tooling, or broad API requests.

Acceptance:

- `corepack pnpm test:pwa` passes against production build.
- Tests prove no broad runtime API/data caching is hiding stale scholarly content.

## Accessibility Tests

Required checks:

- Automated axe checks on `/`, `/dictionary`, `/terms/[slug]`, `/topics`, `/topics/[slug]`, `/papers/[id]`, and `/~offline`.
- No critical or serious violations.
- Search result count announced to assistive technology.
- Form controls have programmatic labels.
- English terms inside Korean explanations are marked where practical.
- Focus order is logical and visible.
- Update/install controls are operable by keyboard.
- Color contrast meets WCAG AA.
- Reduced-motion preference suppresses nonessential animation.

Acceptance:

- `corepack pnpm test:a11y` passes.
- Any moderate issue must have a documented rationale or fix before release.

## SEO Tests

Required checks:

- Metadata titles/descriptions exist for Today, dictionary, term, topic, paper, and offline routes.
- Canonical URL generation is deterministic for local/production configuration.
- Sitemap includes only public published routes.
- Robots metadata exists and does not expose draft content.
- JSON-LD is generated only from verified fields and contains no invented paper claims.
- Open Graph and Twitter card metadata render for major public routes.
- HTML `lang` and route-level language handling are appropriate for Korean-first content with English technical terms.

Acceptance:

- `corepack pnpm test:seo` passes.
- SEO tests use local render output or production build output only.

## Production Build Tests

Required checks:

- `corepack pnpm build` succeeds.
- Build does not require external network, OpenAlex API key, Crossref contact settings, Semantic Scholar credentials, Git writes, commit, push, or deploy.
- Static generation or server rendering does not expose draft/unverified content.
- Bundle/build output does not include secrets or tooling-only candidate metadata.
- Generated service-worker assets are present and versioned when PWA is enabled.

Acceptance:

- Production build succeeds after `corepack pnpm install --frozen-lockfile`.
- Build output is compatible with Playwright PWA tests.

## Malformed, Unicode, and Oversized Input Tests

Required malformed tests:

- Invalid JSON/content shape.
- Missing term fields.
- Duplicate slugs.
- Invalid DOI.
- Unknown relation type.
- Orphaned topic, source, paper, or related-term references.
- Invalid schedule dates and timezone fields.

Required Unicode tests:

- NFKC compatibility variants.
- Full-width Latin characters.
- Acronym punctuation.
- Mixed Hangul/ASCII whitespace.
- Combining marks or unexpected punctuation around query terms.

Required oversized tests:

- Search query length over the configured maximum.
- Excessively long alias or Korean equivalent.
- Excessive paper author list.
- Oversized explanation field beyond content budget.
- Large fixture that should fail with a clear validation message rather than crashing.

Acceptance:

- Invalid inputs fail closed with record ID, field path, and reason.
- User-facing oversized search input returns a safe empty/error state without throwing.

## Stale Cache Tests

Required scenarios:

- Load build version A, cache app shell, then serve build version B.
- Verify a waiting worker/update state appears.
- Verify user action activates B and old caches are deleted.
- Verify content version mismatch does not keep old daily term/search data indefinitely.
- Verify offline fallback still works after cleanup.

Acceptance:

- Stale-cache scenarios are included in `corepack pnpm test:pwa` or a dedicated `corepack pnpm test:cache`.
- The service worker has a narrow cache allowlist and does not cache metadata-tooling responses.

## Release Verification Matrix

Release candidate can be considered implemented only when all rows pass:

| Area | Command | Network default | Blocks release on failure |
| --- | --- | --- | --- |
| Lockfile | `corepack pnpm exec node scripts/verify-lockfile.mjs` | no network | yes |
| Lint | `corepack pnpm lint` | no network | yes |
| Typecheck | `corepack pnpm typecheck` | no network | yes |
| Unit/component/integration | `corepack pnpm test` | no network | yes |
| Content integrity | `corepack pnpm test:content` | no network | yes |
| Search eval | `corepack pnpm test:search` | no network | yes |
| Schedule | `corepack pnpm test:schedule` | no network | yes |
| Production build | `corepack pnpm build` | no network | yes |
| Browser E2E | `corepack pnpm test:e2e` | localhost only | yes |
| PWA/offline/update/cache | `corepack pnpm test:pwa` | localhost only | yes |
| Accessibility | `corepack pnpm test:a11y` | localhost only | yes |
| SEO | `corepack pnpm test:seo` | localhost only | yes |
| Full gate | `corepack pnpm verify` | no external network | yes |

## Stop Rules

- Stop if any default command needs an external API, credential, paid service, or network.
- Stop if lockfile verification cannot prove resolved versions or accepted drift.
- Stop if content validation cannot produce at least 20 verified published terms.
- Stop if no deterministic KST daily term can be selected for the active MVP date.
- Stop if service-worker tests show unrecoverable stale content.
- Stop before commit, push, deploy, publication, or credential use without new user authority.
