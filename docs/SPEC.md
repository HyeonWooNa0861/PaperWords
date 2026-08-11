# PaperWords MVP Spec

PaperWords is a Korean-first AI and computer-science paper terminology PWA. It helps learners search English terms, acronyms, aliases, Korean equivalents, topics, and verified paper relationships using local curated data.

## MVP Outcome

- Daily term selected from a versioned Asia/Seoul schedule.
- Bilingual dictionary search with deterministic ranking.
- Term detail pages with Korean explanations, related terms, sources, and paper relationships.
- Topic browsing for discovery.
- Installable PWA behavior with offline fallback and controlled updates.
- Runtime, production build, and default tests work without network, API keys, accounts, commits, pushes, or deployment.

## Non-Goals

- Authentication, personalization, payments, social features, push notifications, CMS, vector search, runtime generation, automatic publication, commit, push, or deployment.
- Runtime or build-time dependency on OpenAlex, Crossref, Semantic Scholar, or other external APIs.
- Copying paper abstracts into the app.

## Release Invariants

- Only `published` content can appear in public routes, search, topics, sitemap, JSON-LD, or schedule.
- Published scholarly fields require source references plus editorial verification.
- Schedule versions are immutable and use Asia/Seoul calendar dates.
- The MVP v1 schedule spans 90 days and uses a versioned 20-day no-repeat window.
- Default verification must be network-independent.
