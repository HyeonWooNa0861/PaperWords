# claude advisor artifact

- Provider: claude
- Exit code: 0
- Created at: 2026-08-11T15:34:49.975Z

## Original task

TASK_ID: PW-V020-FINAL
MODE: READ_ONLY
GOAL: Independently review the free open-network discovery release candidate for correctness, safety, provenance boundaries, and release blockers.
FILES_TO_READ:
- AGENTS.md
- CLAUDE.md
- app/dictionary/page.tsx
- components/ExternalDiscovery.tsx
- app/api/discovery/terms/route.ts
- app/api/discovery/papers/route.ts
- src/lib/discovery/contracts.ts
- src/lib/discovery/query.ts
- src/lib/discovery/errors.ts
- src/lib/discovery/http.ts
- src/lib/discovery/cso.ts
- src/lib/discovery/crossref.ts
- src/lib/pwa/worker.ts
- tests/discovery/cso.test.ts
- tests/discovery/crossref.test.ts
- tests/routes/discovery-api.test.ts
- tests/components/external-discovery.test.tsx
- e2e/core.spec.ts
- docs/decisions/0002-free-open-network-discovery.md
QUESTIONS:
1. Is any issue severe enough to block release under the no-paid-API, no-required-key, no-abstract, external-unverified separation contract?
2. Do the CSO parsing/cache and Crossref public-pool adapter have an evidence-backed correctness, security, or operational flaw?
3. Is the local published registry still protected from automatic external-data promotion and SEO/PWA leakage?
EVIDENCE_REQUIRED: Cite exact file and line for every finding. Fresh Codex evidence: full pnpm verify passed with Vitest 97, E2E 16, PWA 10, a11y 18, SEO 8; live production-build smoke returned CSO 10 and Crossref 6 with both same-origin APIs HTTP 200, zero console errors, cache headers present, and mobile scrollWidth equal clientWidth. Do not call external APIs.
OUTPUT_LIMIT: At most 5 findings and 1200 words. No patches.
STOP_CONDITION: End with APPROVE or BLOCK and concise reasons.

## Final prompt

TASK_ID: PW-V020-FINAL
MODE: READ_ONLY
GOAL: Independently review the free open-network discovery release candidate for correctness, safety, provenance boundaries, and release blockers.
FILES_TO_READ:
- AGENTS.md
- CLAUDE.md
- app/dictionary/page.tsx
- components/ExternalDiscovery.tsx
- app/api/discovery/terms/route.ts
- app/api/discovery/papers/route.ts
- src/lib/discovery/contracts.ts
- src/lib/discovery/query.ts
- src/lib/discovery/errors.ts
- src/lib/discovery/http.ts
- src/lib/discovery/cso.ts
- src/lib/discovery/crossref.ts
- src/lib/pwa/worker.ts
- tests/discovery/cso.test.ts
- tests/discovery/crossref.test.ts
- tests/routes/discovery-api.test.ts
- tests/components/external-discovery.test.tsx
- e2e/core.spec.ts
- docs/decisions/0002-free-open-network-discovery.md
QUESTIONS:
1. Is any issue severe enough to block release under the no-paid-API, no-required-key, no-abstract, external-unverified separation contract?
2. Do the CSO parsing/cache and Crossref public-pool adapter have an evidence-backed correctness, security, or operational flaw?
3. Is the local published registry still protected from automatic external-data promotion and SEO/PWA leakage?
EVIDENCE_REQUIRED: Cite exact file and line for every finding. Fresh Codex evidence: full pnpm verify passed with Vitest 97, E2E 16, PWA 10, a11y 18, SEO 8; live production-build smoke returned CSO 10 and Crossref 6 with both same-origin APIs HTTP 200, zero console errors, cache headers present, and mobile scrollWidth equal clientWidth. Do not call external APIs.
OUTPUT_LIMIT: At most 5 findings and 1200 words. No patches.
STOP_CONDITION: End with APPROVE or BLOCK and concise reasons.

## Raw output

```text
Review complete. I read all 19 supplied files and nothing else, ran nothing, and changed nothing, per the advisor contract. Verdict summary first, then findings with citations.

## Answers to the three questions

**Q1 — Release blocker?** No. The no-paid-API / no-required-key / no-abstract / external-unverified contract is upheld in the supplied code: Crossref runs keyless with an optional validated `mailto` (`src/lib/discovery/crossref.ts:246-249`, tests `tests/discovery/crossref.test.ts:21,29`); the `select` list excludes `abstract` and the zod object schema strips it even if returned (`crossref.ts:14-25,40-59`, asserted at `tests/discovery/crossref.test.ts:20,71`); every candidate carries `external-unverified` (`src/lib/discovery/cso.ts:212`, `crossref.ts:191`); both routes fail closed with typed errors (`app/api/discovery/terms/route.ts:19-24`, `app/api/discovery/papers/route.ts:19-24`).

**Q2 — Adapter flaws?** Four evidence-backed, all low/advisory severity (findings below). None is unsafe or materially incorrect, and each degrades visibly per source rather than corrupting local content.

**Q3 — Registry / SEO / PWA protection?** Intact. The dictionary search index is built solely from `getPublishedRegistry()` (`app/dictionary/page.tsx:24-27`); external results live only in transient client state (`components/ExternalDiscovery.tsx:22-24`) and no fetch fires before explicit submit (verified at `tests/components/external-discovery.test.tsx:57`), so SSR HTML — the only thing the service worker's pages cache stores — never contains external data. Discovery APIs send `X-Robots-Tag: noindex, nofollow` on success and error paths (`src/lib/discovery/http.ts:46,53`), and the service worker explicitly skips `/api/` (`src/lib/pwa/worker.ts:144`) and precaches no API path (`worker.ts:10-19`).

## Findings (4)

**1. Whole-response strict parse lets one anomalous Crossref item disable the source for a query — low, operational.** `crossrefResponseSchema.safeParse` validates all items at once (`src/lib/discovery/crossref.ts:123-130`); a single item with an off-type known field (e.g. non-URL `URL` at `crossref.ts:57`, given Crossref's heterogeneous legacy metadata) turns the entire response into a 502 `invalid-upstream-response`, and the upstream body stays in the 1-hour fetch cache (`crossref.ts:95`), so that query's paper panel is dark for the hour. Fail-closed and per-source-visible, consistent with ADR consequences (`docs/decisions/0002-free-open-network-discovery.md:23`), but per-item `safeParse` with drop-on-failure would be more robust. Not a blocker.

**2. DOI is not percent-encoded when building the doi.org link — low, correctness.** `url: `https://doi.org/${doi}`` (`src/lib/discovery/crossref.ts:190`) with a DOI gate that permits `#`, `?`, `%`, `<`, `>` (`crossref.ts:173`). Real DOIs contain these (the DOI Handbook's own example is `10.1000/456#789`; legacy SICI DOIs contain `<`/`>`), producing a truncated or broken outbound link at `components/ExternalDiscovery.tsx:162`. No safety impact: the scheme is fixed to `https` and React escapes the attribute. Encoding the suffix would fix it. Not a blocker.

**3. Server-side data-cache behavior with an AbortSignal is unverified — advisory, operational.** Both fetches pass `next: { revalidate }` together with `signal: AbortSignal.timeout(...)` (`src/lib/discovery/cso.ts:89-90`, `crossref.ts:95-96`). Several Next.js versions opt a fetch out of the data cache when a custom `signal` is supplied, which would silently defeat the 7-day/1-hour upstream caching promise (`ExternalDiscovery.tsx:93`, ADR lines 14-16) and re-fetch CSO's multi-MB HTML on every CDN miss. The supplied tests only assert the option is *passed* (`tests/discovery/cso.test.ts:58`, `tests/discovery/crossref.test.ts:57`), and the smoke evidence ("cache headers present") verifies CDN response headers, not the server data cache. Suggest Codex confirm on the deployed Next version that a second server-side request does not hit upstream. Functional either way (CDN `s-maxage` at `src/lib/discovery/http.ts:45` is a second layer), so not a blocker.

**4. Crossref serialization queue is unbounded — low, operational.** `crossrefRequestQueue` chains every call with no cap or shedding (`src/lib/discovery/crossref.ts:70-79`); a burst of N distinct-query requests on one warm instance serializes to up to N×7s, so late requests exceed the platform function timeout and surface as host-level errors instead of the typed `rate-limited`/`upstream-*` contract. Correctly implements the ADR's per-instance concurrency-one intent (`docs/decisions/0002:16`) and is mitigated by CDN caching at expected traffic. Not a blocker.

Positives worth recording: the CSO extractor never evaluates portal script — it does balanced-bracket extraction plus strict `JSON.parse` and a bounded zod schema (`src/lib/discovery/cso.ts:134-156,25`, size caps at `cso.ts:100-114`), with correct string/escape handling in `readJsonArray` (`cso.ts:234-263`); query input reaches upstreams only as URL-encoded params on fixed origins (`cso.ts:228-232`, `crossref.ts:156-168`), so no SSRF/header-injection surface; e2e keeps external requests blocked and mocks both APIs (`e2e/core.spec.ts:4-6,33-77`).

No clarification questions.

Two environment notes unrelated to the review: the `claudelint` CLI is not installed, so claudelint plugin skills won't run until you install `claude-code-lint`; and the claude.ai Gmail/Calendar/Notion connectors need authorization via your claude.ai connector settings before those tools can be used.

**APPROVE** — the source-separation, no-key, no-abstract, and provenance boundaries are all enforced in the supplied code with fail-closed error handling; the four findings are low-severity robustness/operational items (strict whole-response parsing, DOI link encoding, unverified data-cache interaction, unbounded queue) that degrade visibly without corrupting local content, and none makes the release unsafe or materially incorrect.

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
