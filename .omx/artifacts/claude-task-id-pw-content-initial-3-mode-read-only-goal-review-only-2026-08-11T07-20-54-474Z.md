# claude advisor artifact

- Provider: claude
- Exit code: 0
- Created at: 2026-08-11T07:20:54.476Z

## Original task

TASK_ID: PW-CONTENT-INITIAL-3
MODE: READ_ONLY
GOAL: Review only the first three PaperWords term, topic, paper, and source records plus the schema contract for factual, conceptual, terminological, relational, or publication-state errors before Codex promotes them.
FILES_TO_READ:
- CLAUDE.md
- content/registry.ts
- src/lib/content/schemas.ts
- src/lib/content/registry.ts
- docs/CONTENT_SCHEMA.md
- tests/content/production-registry.test.ts
QUESTIONS:
1. Are there factual or terminological errors or materially misleading Korean explanations/equivalents in Transformer, Retrieval-Augmented Generation, or Diffusion Model?
2. Is any paper metadata, DOI/URL, author list, relation type, rationale, or inverse relation inconsistent with the cited official NeurIPS/arXiv evidence?
3. Is there any provenance or publication-state flaw that should BLOCK promotion to published?
EVIDENCE_REQUIRED: For every finding cite a file path and record ID, plus the exact existing source URL when the issue is scholarly. Label each finding BLOCK or SUGGESTION and explain the minimal repair. Do not treat preference as a blocker.
OUTPUT_LIMIT: Maximum 5 findings. Maximum 3 questions. Be concise.
STOP_CONDITION: Read-only. Do not edit files, produce patches, change goals/checklists/session state, commit, push, deploy, use credentials, or call external APIs.

## Final prompt

TASK_ID: PW-CONTENT-INITIAL-3
MODE: READ_ONLY
GOAL: Review only the first three PaperWords term, topic, paper, and source records plus the schema contract for factual, conceptual, terminological, relational, or publication-state errors before Codex promotes them.
FILES_TO_READ:
- CLAUDE.md
- content/registry.ts
- src/lib/content/schemas.ts
- src/lib/content/registry.ts
- docs/CONTENT_SCHEMA.md
- tests/content/production-registry.test.ts
QUESTIONS:
1. Are there factual or terminological errors or materially misleading Korean explanations/equivalents in Transformer, Retrieval-Augmented Generation, or Diffusion Model?
2. Is any paper metadata, DOI/URL, author list, relation type, rationale, or inverse relation inconsistent with the cited official NeurIPS/arXiv evidence?
3. Is there any provenance or publication-state flaw that should BLOCK promotion to published?
EVIDENCE_REQUIRED: For every finding cite a file path and record ID, plus the exact existing source URL when the issue is scholarly. Label each finding BLOCK or SUGGESTION and explain the minimal repair. Do not treat preference as a blocker.
OUTPUT_LIMIT: Maximum 5 findings. Maximum 3 questions. Be concise.
STOP_CONDITION: Read-only. Do not edit files, produce patches, change goals/checklists/session state, commit, push, deploy, use credentials, or call external APIs.

## Raw output

```text
Review complete for PW-CONTENT-INITIAL-3. I read all six listed files and checked the three term/topic/paper/source triples against the cited NeurIPS and arXiv records (from my knowledge only; no external API calls per the stop condition). One BLOCK, three suggestions.

## Findings

**1. BLOCK — DDPM author name is wrong: "Ajay N. Jain" should be "Ajay Jain".**
`content/registry.ts:313`, record `denoising-diffusion-probabilistic-models-2020` (also asserted in `tests/content/production-registry.test.ts:62`). Both cited sources — https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html and https://arxiv.org/abs/2006.11239 — list the second author as "Ajay Jain" (UC Berkeley). "Ajay N. Jain" is a different, real researcher (UCSF, computational chemistry), so this is a factual author-attribution error, not a formatting choice. Minimal repair: change the name to "Ajay Jain" in both the registry and the test expectation. This contradicts the `sourceChecks` claiming `authors` was verified against both sources, so it should block promotion until fixed.

**2. SUGGESTION — Inconsistent diacritic policy: "Lukasz Kaiser" vs the publisher's "Łukasz Kaiser".**
`content/registry.ts:224`, record `attention-is-all-you-need-2017`. The NeurIPS proceedings page (https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html) uses "Łukasz Kaiser", while the arXiv record (https://arxiv.org/abs/1706.03762) uses the ASCII "Lukasz Kaiser". The RAG record keeps diacritics ("Heinrich Küttler", "Tim Rocktäschel"), so the registry currently mixes normalization policies. Not a blocker since a cited source supports the ASCII form; minimal repair is to pick one policy (publisher spelling with diacritics is the more consistent choice) and apply it in registry and test.

**3. SUGGESTION — RAG alias "retrieval-augmented language generation" is not attested by the cited sources.**
`content/registry.ts:120`, record `retrieval-augmented-generation`. Neither https://proceedings.neurips.cc/paper_files/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html nor https://arxiv.org/abs/2005.11401 uses that phrase (the paper uses "retrieval-augmented generation"), yet the `sourceChecks` claim `aliases` was verified against both. Minimal repair: drop the alias, or reconfirm it appears in the source; if it is an editorial coinage, back it with an `editorial-review` source instead.

**4. SUGGESTION — Papers carry Korean rationale text but sit at `metadata_verified`, skipping the language-review state.**
`content/registry.ts:242` (and the two sibling papers), records `attention-is-all-you-need-2017`, `rag-knowledge-intensive-nlp-2020`, `denoising-diffusion-probabilistic-models-2020`. `relations[].relevanceRationaleKo` is Korean learner-facing copy, but only the mirrored term-side copies are marked `language_reviewed`. If Codex promotes papers straight from `metadata_verified` to `published`, Korean copy reaches the public without a recorded language review. Minimal repair: move papers through `language_reviewed` before publishing, or document that the term-side review covers the identical mirrored text. Not a blocker — the strings are byte-identical to the reviewed term-side rationales and the bidirectional-match validator enforces that.

No other factual, terminological, or relational problems found: venues (NIPS 2017 / NeurIPS 2020, volumes 30/33), years, DOIs (lowercase-normalized per `src/lib/content/schemas.ts:64`), NeurIPS hashes, arXiv IDs, the RAG author list, and the Korean definitions/explanations for all three terms are accurate and internally consistent, and the inverse relations match exactly. Structurally, promotion would pass the provenance gates in `src/lib/content/registry.ts` once terms, topics, papers, and sources are all set to `published` together.

## Questions

1. Is there a declared normalization policy for author names when the publisher and arXiv spellings conflict (finding 2), and should the tests encode the policy rather than a specific spelling?
2. Was "retrieval-augmented language generation" actually observed in either cited RAG source during the editorial check, or was it added editorially?
3. Is `metadata_verified` intended as a terminal pre-publish state for papers, or must every record type pass `language_reviewed` when it contains Korean copy?

Side note, unrelated to this review: the session hook reports the `claudelint` CLI is not installed, so the claudelint plugin skills won't work until you run `npm install -g claude-code-lint` (or `npm install --save-dev claude-code-lint` for this project only). The claude.ai Gmail/Google Calendar/Notion connectors also need authorization via your claude.ai connector settings before their tools are usable.

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
