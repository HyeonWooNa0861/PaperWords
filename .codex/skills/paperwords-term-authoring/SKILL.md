---
name: paperwords-term-authoring
description: Draft source-gated PaperWords term records for editorial review. Use when Codex needs to author or revise unpublished PaperWords terminology content with traceable sources, Korean learning copy, paper relationships, and content validation.
---

# PaperWords Term Authoring

Use this skill to draft PaperWords term records only. Keep every draft unpublished until a human editor completes source and language review.

## Contract

- Draft records only; set `publicationState` to `draft`, `metadata_verified`, or `language_reviewed`, never `published`.
- Do not invent paper metadata. Use only metadata present in supplied sources or existing local records.
- Do not copy paper abstracts or create abstract body fields. Use `abstractStatus: "not_copied"` for paper records.
- Require traceable sources for term copy, paper metadata, Korean equivalents, and relation rationale.
- Include a Korean relevance rationale for every paper relation.
- Preserve source IDs, DOI/URL locators, reviewer fields, and provenance mappings exactly when known.
- Stop and report provenance gaps instead of filling them from memory or guesswork.

## Workflow

1. Inspect `docs/CONTENT_SCHEMA.md`, `src/lib/content`, and the existing local content registry before drafting.
2. Create or revise draft-only topic, term, paper, and source records in the format expected by the Zod schemas.
3. Map every source `verifies` entry to explicit record fields, then mirror those fields in editorial `verification.sourceChecks` only when review evidence exists.
4. Run `npm exec --offline --yes --package=pnpm@10.34.5 -- pnpm test:content`.
5. If validation fails, fix structural issues that are supported by sources. If evidence is missing, leave the record unpublished and report the exact record ID, field path, and provenance gap.
