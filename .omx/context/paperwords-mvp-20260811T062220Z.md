# PaperWords MVP context snapshot

- Captured: 2026-08-11T06:22:20Z
- Context type: greenfield
- Source status: activation-prompt
- Prompt-safe summary: recorded

## Task statement

Build and verify a production-shaped local MVP of PaperWords, a Korean-language PWA dictionary for English AI and computer-science terminology, with Codex as the implementation owner and Claude as a bounded read-only advisor.

## Desired outcome

Users can discover a deterministic daily term, search English terms, acronyms, aliases, and Korean equivalents, read sourced Korean explanations, and inspect verified related papers. The local app must pass lint, typecheck, unit/integration tests, production build, browser E2E, PWA checks, accessibility checks, and release-readiness review.

## Known facts and constraints

- Project root: /Users/nahw/Documents/PaperWords
- Shared handoff root: /Users/nahw/Documents/.LLM-Wiki/projects/PaperWords/sessions/mvp-build
- Initial content target: at least 20 verified terms.
- Daily schedule: Asia/Seoul, deterministic, versioned, at least 90 days, balanced and non-repeating.
- MVP is static-first with structured local content validated by Zod.
- No login, personalization, payments, social features, web push, runtime generative answers, vector database, CMS, commit, push, or deployment.
- Claude is advisory only and is invoked through $ask claude at bounded milestones.
- No secrets or unverified scholarly identifiers may be stored.

## Unknowns resolved by default policy

- Visual style: scholarly, calm, readable, mobile-first; avoid generic neon AI styling.
- Hosting remains a candidate only; no deployment is authorized.
- Paper APIs are metadata/discovery inputs only; published entries remain editorially verified.
- Database adoption is deferred until documented scale or collaboration triggers occur.

## Decision boundaries

Codex may choose reversible implementation details, package structure, component boundaries, visual tokens, tests, and content-seed ordering. Codex must stop before credentials, paid services, external publication, destructive cleanup, commit, push, or deployment.

## Likely touchpoints

- Next.js App Router application
- Structured term and paper content
- Search indexing and normalization
- Daily schedule generator
- PWA manifest and service worker
- Unit, integration, browser, accessibility, SEO, and offline verification
- Project AGENTS.md and CLAUDE.md

## Context sources inspected

- User-provided PaperWords Codex Lead Agent specification
- /Users/nahw/Documents/AGENTS.md instructions supplied in the active session
- /Users/nahw/Documents/.LLM-Wiki/start-here.md
- /Users/nahw/Documents/.LLM-Wiki/directory-map.md
- /Users/nahw/Documents/.LLM-Wiki/workflows/workspace-management/folder-rules.md
- /Users/nahw/Documents/.LLM-Wiki/workflows/workspace-management/session-rules.md
- /Users/nahw/Documents/.LLM-Wiki/workflows/workspace-management/agent-handoff.md

## Terminology conflicts

None found. “Recommendation” is fixed to a deterministic editorial daily schedule for MVP, not behavioral personalization.
