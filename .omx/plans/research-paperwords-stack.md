# PaperWords stack and source evidence

## Research boundary

- Date: 2026-08-11 KST
- Purpose: provide current official and registry evidence for the Ralplan consensus stage
- Scope: Next.js PWA approach, scholarly metadata sources, and package compatibility
- Implementation authority: none; decisions are made in the consensus plan

## Official evidence

### Next.js and PWA

- The App Router supports a first-class `app/manifest.ts` metadata file.
- The current official PWA guide identifies Serwist as an offline-support option and notes its webpack configuration requirement.
- HTTPS and appropriate security headers remain release requirements.
- Source: https://nextjs.org/docs/app/guides/progressive-web-apps

### OpenAlex

- Current OpenAlex API access requires a free API key; anonymous runtime access must not be assumed.
- The free allowance is suitable for bounded offline enrichment, while batching, selected fields, caching, rate headers, and exponential backoff are expected.
- The MVP therefore uses curated local paper metadata at runtime. An optional offline sync adapter may run only when `OPENALEX_API_KEY` is present.
- Sources:
  - https://developers.openalex.org/
  - https://developers.openalex.org/api-reference/authentication
  - https://developers.openalex.org/guides/deprecations

### Crossref

- Crossref REST metadata can be queried without signup; the polite pool uses identifying contact information and has higher documented limits.
- Clients must identify themselves, cache results, respect 429 responses, and back off.
- Most metadata is reusable, but abstracts can retain separate copyright; PaperWords will not persist abstract text by default.
- Sources:
  - https://www.crossref.org/documentation/retrieve-metadata/rest-api/
  - https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/

### Semantic Scholar

- Treat Semantic Scholar as an optional discovery adapter, not a runtime MVP dependency.
- Do not publish or cache discovered records until their identifiers and metadata are independently validated.

## Registry snapshot

The following values were read from the npm registry on 2026-08-11 and must be resolved into the lockfile during bootstrap:

| Package | Registry version | Compatibility note |
| --- | --- | --- |
| `next` | 16.3.0 | Node >=20.9.0; React 18.2 or 19 |
| `react`, `react-dom` | 19.2.8 | satisfies Next peer range |
| `typescript` | 7.0.2 | use strict mode |
| `tailwindcss` | 4.3.3 | verify generated Next integration |
| `zod` | 4.4.3 | validate content at build/test time |
| `minisearch` | 7.2.0 | local deterministic search |
| `vitest` | 4.1.10 | Node 22 environment is available |
| `@testing-library/react` | 16.3.2 | component tests |
| `@playwright/test` | 1.62.1 | browser and PWA checks |
| `@axe-core/playwright` | 4.12.1 | Playwright accessibility checks |
| `@serwist/next` | 9.5.12 | Next >=14; webpack integration required |
| `pnpm` | 10.34.5 | latest Node-compatible major; invoke through Corepack |

Local runtime evidence:

- The active Codex shell resolves Node 22.11.0 and Corepack 0.29.4; `pnpm` is not currently on PATH.
- Node 22.11.0 satisfies current Next.js and Serwist engine requirements.
- The latest `pnpm` 11.21.0 requires Node >=22.13 and is incompatible with the active shell, so bootstrap must pin the current compatible `pnpm` 10.34.5, which requires Node >=18.12.

## Planning recommendations

1. Keep all term and paper display data local and schema-validated at runtime/build time.
2. Add a network-free validation path for CI and ordinary development.
3. Put Crossref/OpenAlex enrichment in explicit scripts; skip safely when credentials or contact configuration are absent.
4. Choose either a minimal owned service worker or Serwist in the architecture ADR after weighing Next 16 webpack constraints against update safety and testability.
5. Never make external API availability a prerequisite for app startup, tests, or production build.

## Research lane note

Two bounded external specialist lanes did not return within the planning window and were interrupted. The evidence above was refreshed directly from official documentation and the npm registry; the timeout is not a product blocker.
