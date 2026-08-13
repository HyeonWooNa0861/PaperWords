# PaperWords Product Spec

PaperWords is a Korean-first AI and computer-science paper terminology PWA. It helps learners search English terms, acronyms, aliases, Korean equivalents, topics, and verified paper relationships using versioned local curated data.

## Product Outcome

- Daily term selected from a versioned Asia/Seoul schedule.
- Bilingual dictionary search with deterministic ranking.
- Term detail pages with Korean explanations, related terms, sources, and paper relationships.
- Topic browsing over the local published corpus.
- Reach-friendly mobile navigation for Today, Search, and Topics.
- A settled desktop workspace with active navigation, continuation reading, and topic discovery.
- Installable PWA behavior with offline fallback and controlled updates.
- A tactile paper-material interface with warm local surfaces, deterministic CSS grain, and no network visual dependency.
- Core runtime, production build, and default tests work without network, API keys, accounts, commits, pushes, or deployment.

## Non-Goals

- Authentication, server-side personalization, payments, social features, push notifications, CMS, vector search, runtime generation, automatic publication, commit, push, or deployment.
- Runtime external terminology search, scholarly API lookup, remote candidate discovery, or automatic corpus ingestion.
- Paid metadata services, required API keys, or browser/server calls to scholarly APIs.
- Copying paper abstracts into the app.
- User-imported personal dictionaries or per-device overlays in this release; these require a separate validated local-data contract.

## Local-Only Data Contract

- Search, Today recommendations, topics, term pages, and paper relationships read only from checked-in content that passes the local Zod and editorial gates.
- The app exposes no discovery API routes and contains no runtime adapter for remote terminology or scholarly-data services.
- DOI, publisher, repository, and documentation URLs remain passive citations that a user may open explicitly. PaperWords does not query those URLs to change search results or content.
- Corpus expansion is an editorial release action: source review, Korean authoring, schema validation, and explicit publication happen before data ships with the app.
- A future personal layer may store user-supplied data on the device, but it must remain separate from the shared published corpus and must never become trusted or synchronized automatically.

## Release Invariants

- Only `published` content can appear in public routes, search, topics, sitemap, JSON-LD, or schedule.
- Published scholarly fields require source references plus editorial verification.
- Schedule versions are immutable and use Asia/Seoul calendar dates.
- The current published schedule spans 90 days and uses a versioned 20-day no-repeat window.
- Immutable raw schedule and content identifiers are internal metadata. User-facing UI must use readable date, schedule, and verification copy instead of raw IDs or prototype-stage labels.
- Default verification must be network-independent.
- Public routes, search, recommendations, sitemap, and JSON-LD must not depend on or expose remotely discovered candidates.
- Removing a previously shipped network surface requires a new PWA cache version so cached pages cannot preserve the retired interface.
- Paper texture, icons, typography, and color must remain local, deterministic, readable at 390px, and WCAG 2.1 AA compatible.

## Experience Requirements

- Compact mobile screens must provide bottom navigation for Today, Search, and Topics with safe-area padding, visible focus states, and at least 44px touch targets.
- Mobile search must stay practical during paper reading: English terms, acronyms, and Korean equivalents remain directly searchable without depending on remote lookup.
- Dense evidence, provenance, and schedule metadata must be grouped or compacted before it competes with the Korean definition on mobile.
- Desktop screens must show a stable active location and provide continuation paths after Today's term, including related reading and focused topic entry points.
- Desktop margins and rails should support reading orientation and corpus discovery; they must not read as empty or unfinished product space.
