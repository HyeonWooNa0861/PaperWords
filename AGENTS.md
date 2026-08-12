# PaperWords Agent Rules

## Source Of Truth

- Start with `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_SCHEMA.md`, `docs/TEST_PLAN.md`, `DESIGN.md`, and the ADRs in `docs/decisions/`.
- Implementation agents do not manually edit `.omx` state or plan files. The Codex leader may update or checkpoint OMX-managed state through the authorized workflow/CLI and must preserve approved planning inputs.
- Preserve `/Users/nahw/Documents/.LLM-Wiki/projects/PaperWords/**` session records unless the user explicitly asks for handoff updates.

## Boundaries

- Codex owns implementation, verification, and final decisions.
- Claude may only be used as a bounded read-only advisor under `CLAUDE.md`.
- Do not use credentials, paid services, external scholarly APIs, commit, push, deploy, or publish without new explicit user authority.
- Runtime, build, and default tests must not require network access or API keys.

## Implementation Rules

- Keep the app static-first with local validated content.
- Preserve the 90-day Asia/Seoul schedule requirement with the versioned 20-day no-repeat window.
- Keep scholarly display data source-backed; do not store copied abstracts.
- Prefer small, reviewable changes and existing project patterns.

## Verification

- For bootstrap changes, run `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm verify:bootstrap`.
- For first install or lockfile refresh only, use the online form `npm exec --yes --package=pnpm@10.34.5 -- pnpm install`; Corepack 0.29.4 has a stale signing-key failure in this environment.
- For later release stories, add and run the narrow story tests plus lint, typecheck, unit tests, and production build.
