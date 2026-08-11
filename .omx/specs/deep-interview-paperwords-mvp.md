# PaperWords MVP execution-ready specification

## Metadata

- Source context: .omx/context/paperwords-mvp-20260811T062220Z.md
- Interview closure: .omx/interviews/paperwords-mvp-20260811T062220Z.md
- Final ambiguity: 0.12
- Required next phase: ralplan consensus

## Intent

Help Korean-speaking AI and computer-science learners and researchers understand the English terminology they encounter in papers, without hiding uncertainty or inventing scholarly references.

## Product outcome

An installable Next.js PWA with a daily curated term, bilingual dictionary search, sourced Korean explanations, related terms, and verified paper relationships.

## In scope

- Today page with a deterministic Asia/Seoul daily term
- Dictionary search over English headword, acronym, aliases, and Korean equivalents
- Term detail and topic browsing routes
- Structured local content with schema and source validation
- At least 20 verified seed terms
- At least 90 days of versioned, non-repeating daily scheduling
- Installable PWA with an offline app shell and controlled cache update behavior
- Unit, integration, browser E2E, accessibility, SEO, and production-build verification
- Bounded Claude review through $ask claude at architecture, representative UI, initial content, and release gates

## Out of scope

- Authentication, profiles, behavioral personalization, payments, social features, web push, CMS, vector search, runtime generative answers, automatic publication, commit, push, and deployment

## Decision boundaries

- Codex owns implementation, integration, tests, and completion.
- Claude is read-only advisory and cannot change goal or checklist state.
- Codex may choose reversible local implementation details.
- Credentials, paid services, external production, destructive cleanup, commits, pushes, and deployment require new user authority.

## Proposed technical direction to validate in ralplan

- Next.js App Router, TypeScript strict mode, pnpm, Tailwind CSS
- Zod-validated local TypeScript or JSON content
- MiniSearch with explicit bilingual normalization and field weighting
- Vitest, React Testing Library, and Playwright
- Native Next.js manifest plus a minimal service worker first
- OpenAlex metadata enrichment, Crossref DOI verification, optional Semantic Scholar discovery behind an adapter and terms review

## Content invariants

1. English is the canonical headword.
2. Korean equivalents and Korean explanations are first-class content.
3. Published facts and paper metadata are traceable to sources.
4. No paper, DOI, author, venue, or citation claim is invented.
5. A paper relation records relation type and Korean relevance rationale.
6. Unverified entries cannot appear as published daily terms.
7. Abstract text is not copied unless rights and source terms permit it.

## Acceptance criteria

1. At least 20 schema-valid, verified terms are available.
2. Exact English, acronym, alias, Korean exact, prefix, and bounded fuzzy search have deterministic ranking tests.
3. A versioned 90-day Asia/Seoul schedule passes no-repeat and balance tests.
4. Today, dictionary, term, and topic routes work at mobile and desktop widths.
5. The app is installable and its offline/update behavior is browser-tested.
6. Each displayed paper has verified metadata and a Korean relevance note.
7. Lint, typecheck, unit/integration tests, production build, and Playwright E2E pass.
8. Final independent code-review recommendation is APPROVE with architecture CLEAR.
9. Adversarial QA passes or records a safe, explicit blocker.

## Stop conditions

- Complete only when every acceptance criterion has evidence.
- Stop for missing credentials only if a required source cannot be replaced by curated local fixtures.
- Stop before commit, push, or deployment.
- Stop after three repeated identical review or QA failures with no new recovery path.
