# PaperWords MVP Spec

PaperWords is a Korean-first AI and computer-science paper terminology PWA. It helps learners search English terms, acronyms, aliases, Korean equivalents, topics, and verified paper relationships using local curated data.

## MVP Outcome

- Daily term selected from a versioned Asia/Seoul schedule.
- Bilingual dictionary search with deterministic ranking.
- Term detail pages with Korean explanations, related terms, sources, and paper relationships.
- Topic browsing for discovery.
- User-triggered, source-separated discovery over free CSO topic data and keyless Crossref bibliographic metadata.
- Installable PWA behavior with offline fallback and controlled updates.
- Core runtime, production build, and default tests work without network, API keys, accounts, commits, pushes, or deployment. External discovery degrades independently when a source is unavailable.

## Non-Goals

- Authentication, personalization, payments, social features, push notifications, CMS, vector search, runtime generation, automatic publication, commit, push, or deployment.
- Automatic ingestion or publication of CSO/Crossref candidates into the curated dictionary.
- Paid metadata services, required API keys, or client-side calls to scholarly APIs.
- Copying paper abstracts into the app.

## Release Invariants

- Only `published` content can appear in public routes, search, topics, sitemap, JSON-LD, or schedule.
- Published scholarly fields require source references plus editorial verification.
- Schedule versions are immutable and use Asia/Seoul calendar dates.
- The MVP v1 schedule spans 90 days and uses a versioned 20-day no-repeat window.
- Default verification must be network-independent.
- External candidates remain transient, carry an `external-unverified` status, stay out of the local content registry, schedule, sitemap, and JSON-LD, and never become published records automatically.
- External discovery is enabled by default but must have a no-code operational rollback that prevents upstream requests. Free-tier usage and upstream availability are release risks, not guarantees.
