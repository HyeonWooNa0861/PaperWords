# ADR 0003: Local-only dataset boundary

- Status: accepted
- Date: 2026-08-13
- Supersedes: ADR 0002

## Context

PaperWords prioritizes editorial quality and future per-user adaptation over runtime corpus breadth. Remote terminology and paper discovery added quota, availability, privacy, and trust surfaces even when candidates were kept separate from published content. The shared dictionary therefore needs one deterministic data authority: the versioned local registry.

## Decision

- Search, Today recommendations, topics, term pages, and paper relationships use only checked-in content that passes local schema and editorial validation.
- Remove the external-discovery UI, `/api/discovery/*` routes, remote adapters, cache/configuration switches, and their source-specific tests.
- Keep DOI, publisher, repository, and documentation URLs only as passive citations. PaperWords does not fetch them to expand or alter the runtime dataset.
- Expand the shared corpus only through the local authoring, provenance, review, validation, and versioned release workflow.
- Do not implement personal imports in this change. A future per-device layer needs a separate schema, provenance state, local persistence design, conflict policy, and explicit boundary from the shared `published` corpus.
- Bump the app and PWA cache versions so installed clients retire cached dictionary pages containing the removed network surface.

## Consequences

- Runtime search and recommendations remain deterministic, private, offline-capable, and free from API quota or upstream availability risk.
- The removed discovery endpoints return `404`; there is no environment variable that can re-enable them.
- Corpus growth becomes deliberate release work instead of a runtime lookup.
- Citation links can still leave the app after an explicit user click, but they do not participate in search or data ingestion.
- Per-user local personalization remains possible as a future layer without weakening the shared corpus quality gate.

## Verification

- `tests/architecture/local-only-boundary.test.ts` guards the removed runtime surface and dictionary fetch boundary.
- Route and browser tests verify a single local search surface and `404` responses for the retired discovery endpoints.
- The full release gate runs with non-local browser requests blocked.
