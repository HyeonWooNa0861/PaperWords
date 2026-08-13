# ADR 0002: Free, source-separated open-network discovery

- Status: superseded by ADR 0003
- Date: 2026-08-12
- Superseded: 2026-08-13

This document is retained as historical context. Its network-discovery decision is no longer active and must not be used as implementation guidance.

## Context

PaperWords needs to expand beyond its 20 verified local terms without turning unreviewed network data into dictionary truth. The expansion must not require a paid API, API key, browser-exposed credential, or copied paper abstract. Edge computing and neural-network quantization remain the editorial focus.

## Decision

Add an explicit external-discovery action to `/dictionary` while preserving the local registry as the only published dictionary source.

- Fetch the public CSO 3.5 portal topic payload on the server, validate it as a bounded string array, cache it for seven days, and rank term candidates locally. Focus boosts cover CSO labels adjacent to edge computing and quantization, but do not assert that those labels are verified PaperWords definitions.
- Query the anonymous Crossref REST public pool from the server with `query.bibliographic`, six rows, and an explicit `select` list that excludes abstracts. Require a DOI before returning a candidate.
- Cache Crossref fetches and API responses for one hour. Serialize Crossref calls within each server instance to respect the public pool's concurrency-one guidance; CDN/data caches reduce repeated queries across requests.
- Mark every result `external-unverified`, keep it transient, and display it in a separate region with source and license links. Never merge it into local search ranking, schedule, sitemap, JSON-LD, or PWA caches.
- Keep `PAPERWORDS_CROSSREF_MAILTO` optional for the free polite pool. Do not add OpenAlex to the default runtime because the zero-credential design does not need another quota surface.
- Default the feature to enabled, but allow an immediate no-code rollback with `PAPERWORDS_EXTERNAL_DISCOVERY_ENABLED=0`. Disabled routes return a no-store `503` and do not contact upstreams.

## Consequences

- Default builds and tests remain offline and deterministic; tests mock all upstream responses.
- Live source outages, rate limits, and format changes are visible per source and do not corrupt local content.
- The feature has no paid external-data dependency, but availability remains subject to CSO, Crossref, and the deployment host's free-tier limits.
- Public API routes can still consume serverless and upstream quota on unique queries. Treat the network surface as best-effort beta, monitor free-tier usage, and use the rollback switch if traffic or source behavior becomes unsafe.
- Crossref concurrency-one serialization is per server instance, not global across serverless instances. CSO discovery also depends on the current public portal payload shape and fails closed if it changes.
- A candidate still needs the complete PaperWords authoring and verification workflow before publication.

## Evidence

- CSO downloads and license: https://cso.kmi.open.ac.uk/downloads and https://cso.kmi.open.ac.uk/faq
- CSO resource formats: https://cso.kmi.open.ac.uk/about
- Crossref public access, limits, and cache guidance: https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/
- Crossref metadata licensing and abstract restriction: https://www.crossref.org/documentation/retrieve-metadata/
