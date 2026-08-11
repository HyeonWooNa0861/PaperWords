# Content Schema

The schema is local-first and source-gated. Runtime, build, and default tests must use only local content.

The implementation lives in `src/lib/content`. All record schemas are strict Zod objects: unknown keys fail validation, and paper records reject copied abstract body fields such as `abstract`, `abstractText`, and `abstractKo`. The only abstract-related field allowed for MVP papers is `abstractStatus: "not_copied"`.

## G003 Seed Scope

The MVP seed registry publishes exactly 20 terms: 3 foundational AI/CS terms, 8 edge-computing terms, and 9 neural-network-quantization terms. The focused edge terms are Edge Computing, Edge AI, Multi-access Edge Computing, Fog Computing, Cloudlet, Computation Offloading, Federated Learning, and On-device Inference. The focused quantization terms are Neural Network Quantization, Post-Training Quantization, Quantization-Aware Training, Mixed-Precision Quantization, Weight-Only Quantization, Activation Quantization, Integer-Only Inference, Binary Neural Network, and Quantization Calibration.

Published seed records must all be source-gated and editorially verified. `relatedTermSlugs` are treated as published learning claims, so each related-link field needs both source provenance and editorial attestation from the same declared source. No draft, metadata-only, or language-reviewed record is exposed in the G003 production registry.

## Term

- `slug`: stable ASCII ID.
- `headword`: canonical English term.
- `acronym`: optional canonical acronym.
- `aliases`: English aliases or spelling variants.
- `koreanEquivalents`: Korean equivalents.
- `shortDefinitionKo` and `explanationKo`: Korean learning copy.
- `topicSlugs`, `relatedTermSlugs`, `paperRelations`, `sourceRefs`: validated joins. Published `relatedTermSlugs` require source-backed provenance.
- `publicationState`: `draft`, `metadata_verified`, `language_reviewed`, `published`, or `retired`.
- `verification`: reviewer, date, source checks, and notes.

## Paper

- `id`, `title`, `authors`, `venue`, `year`, optional `doi`, optional `openAlexId`, and `url`.
- `metadataSources`: source IDs proving metadata fields.
- `abstractStatus`: must be `not_copied` for MVP.
- `relations`: term relation type plus Korean relevance rationale.

## Source

- `id`, `kind`, `url` or `doi`, `title`, `publisherOrVenue`, `retrievedAt`, `verifiedAt`, `reviewer`, and `usagePolicy`.
- `verifies`: explicit record ID and fields supported by the source.
- Controlled `kind` values include `publisher`, `doi-registry`, `preprint-repository`, `openalex-record`, `semantic-scholar-record`, `official-documentation`, and `editorial-review`.

## Topic

- `slug`: stable ASCII topic ID.
- `labelEn`, `labelKo`, and `descriptionKo`: display labels and Korean browsing copy.
- `sourceRefs` and `verification`: provenance for published topic labels and descriptions.

## Schedule

- `scheduleId`: immutable local schedule ID. MVP v1 is `paperwords-mvp-2026-08-11.v1`.
- `version`: released schedule version, currently `v1`.
- `timezone`: fixed to `Asia/Seoul`.
- `startDateKst`, `endDateKst`, `durationDays`, and `noRepeatWindowDays`: versioned calendar metadata. MVP v1 spans `2026-08-11` through `2026-11-08`, contains 90 populated KST dates, and uses a 20-day no-repeat window.
- `immutableSinceKst`: KST release date for the local schedule version.
- `entries`: one `{ dateKst, termSlug }` pair per scheduled KST date. Entries must point to published terms only.

## Provenance

Offline validation proves workflow integrity, not factual truth. A published field is considered covered only when both conditions are true:

- A referenced source maps `recordId` to the exact field in `verifies`.
- The record's editorial `verification.sourceChecks` names the same source and field.
- Verification source checks must resolve to existing sources declared on the record's direct source refs, metadata sources, or relation source refs as appropriate.

Human/source review establishes factual correctness. Tests only prove that the registry cannot publish content with missing source mappings or missing editorial attestations.

## External Discovery Candidates

CSO term candidates and Crossref paper candidates are transient API response records, not content-registry records. They always carry `verificationStatus: "external-unverified"`, are displayed in a separate UI region, and cannot satisfy any `published` schema requirement. Crossref candidates require a DOI and intentionally have no abstract field. Promoting a candidate requires the normal local authoring, source mapping, Korean explanation, editorial verification, and publication workflow.

When official sources differ on display spelling for the same bibliographic field, the record chooses one canonical field owner rather than letting conflicting sources verify the same field. Each paper has exactly one chosen official metadata source that owns the `authors` field, and that same source must appear in the paper's `metadataSources` and editorial source checks. The initial three papers use arXiv for author display names; older or publisher-only papers may instead use a publisher, proceedings, DOI-registry source, or official institutional document as the canonical author source.

## Validation Rules

- No duplicate or orphaned slugs.
- Published terms require Korean equivalents, Korean explanation, topic, at least one evidence-based related term, at least one paper relation, source references, and verification.
- Published papers require at least one term relation.
- Duplicate term-to-paper or paper-to-term relation edges are rejected even when the duplicate relation payload differs.
- Published papers cannot contain copied abstract fields.
- Term paper relations and paper inverse relations must match on term slug, paper ID, relation type, Korean rationale, and source refs.
- Scheduled terms must be published. Orphan, draft, retired, metadata-only, and language-reviewed scheduled slugs are rejected by validation before public loaders return data.
- Versioned schedules must have a complete date sequence, one term per date, the declared no-repeat window, and no three consecutive entries with the same primary topic when enough topics exist.
- Draft, metadata-only, language-reviewed, and retired records stay out of public indexes.
- Failures report the record ID, field path, and reason.
