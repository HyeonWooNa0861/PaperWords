# ADR 0001: Static-First Next PWA

Status: Accepted for MVP bootstrap

## Context

PaperWords must run, build, and test from local curated content without credentials or live scholarly APIs. The MVP still needs installable PWA behavior, offline fallback, and controlled update handling.

## Decision

Use Next.js App Router with local Zod-validated content, MiniSearch candidate retrieval plus explicit post-ranking, a versioned Asia/Seoul schedule, and a minimal owned service worker in a later PWA story. Do not adopt Serwist during bootstrap.

## Consequences

- Bootstrap stays small and compatible with the current Node 22.11.0 environment.
- TypeScript is pinned to 6.0.3 instead of the 7.0.2 registry snapshot because `eslint-config-next` imports `typescript-eslint`, whose current peer/runtime gate rejects TypeScript 7.
- jsdom is pinned to 26.1.0 because 27.0.1 failed Vitest startup through a CommonJS-to-ESM transitive import in the CSS parser stack under the active runtime.
- Content validation and search evaluation become release-critical gates.
- Service-worker cache behavior remains explicitly owned and must be covered by later Playwright stale-cache tests.
- External terminology and scholarly-data adapters are excluded from runtime, build, and test paths; ADR 0003 later makes the local-only boundary explicit.
