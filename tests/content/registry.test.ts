import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  assertValidContentRegistry,
  loadPublishedContent,
  validateContentRegistry,
  type ContentRegistry,
  type RawContentRegistry,
  type VerifiableField
} from "@/src/lib/content";
import { makeValidContentRegistry } from "./fixtures";

describe("content registry validation", () => {
  it("accepts a valid network-free registry fixture and schedule", () => {
    const result = validateContentRegistry(makeValidContentRegistry());

    expect(result.issues).toEqual([]);
    expect(result.registry.scheduledTermSlugs).toEqual(["rag"]);
  });

  it("loads published records from a valid registry fixture", () => {
    const registry = makeValidContentRegistry();

    expect(validateContentRegistry(registry).issues).toEqual([]);
    expect(loadPublishedContent(registry).terms.map((term) => term.slug)).toEqual(["rag", "dense-retrieval"]);
  });

  it("derives scheduled term slugs from a valid versioned schedule", () => {
    const registry: RawContentRegistry = {
      ...makeValidContentRegistry(),
      schedule: makeFixtureSchedule("rag"),
      scheduledTermSlugs: undefined
    };

    const result = validateContentRegistry(registry);

    expect(result.issues).toEqual([]);
    expect(result.registry.schedule?.scheduleId).toBe("fixture-schedule.v1");
    expect(result.registry.scheduledTermSlugs).toEqual(["rag"]);
    expect(loadPublishedContent(registry).schedule?.entries[0]?.termSlug).toBe("rag");
  });

  it("reports record ID, field path, and reason for malformed records", () => {
    const registry = makeValidContentRegistry();
    const malformed: RawContentRegistry = {
      ...registry,
      papers: [{ ...registry.papers[0], doi: "BAD/DOI" }]
    };

    expect(validateContentRegistry(malformed).issues).toContainEqual(
      expect.objectContaining({
        recordId: "paper-rag-2020",
        fieldPath: "papers[0].doi",
        reason: expect.stringContaining("normalized lowercase DOI")
      })
    );
  });

  it("detects duplicate IDs, slugs, and source locators", () => {
    const registry = makeValidContentRegistry();
    const duplicate: RawContentRegistry = {
      ...registry,
      terms: [...registry.terms, registry.terms[0]],
      sources: [...registry.sources, { ...registry.sources[0], id: "source-rag-paper-copy" }]
    };

    const issues = validateContentRegistry(duplicate).issues;

    expect(issues).toEqual(expect.arrayContaining([expect.objectContaining({ reason: "duplicate term slug: rag" })]));
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "source-rag-paper-copy",
          fieldPath: "sources.doi",
          reason: "duplicate source DOI: 10.48550/arxiv.2005.11401"
        })
      ])
    );
  });

  it("detects duplicate term-paper and paper-term relation edges by target", () => {
    const registry = cloneValidFixtureRegistry();
    registry.terms[0].paperRelations.push({
      ...registry.terms[0].paperRelations[0],
      relationType: "survey"
    });
    registry.papers[0].relations.push({
      ...registry.papers[0].relations[0],
      relationType: "survey"
    });

    const issues = validateContentRegistry(registry).issues;

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.paperRelations[1].paperId",
          reason: "duplicate term paper relation: paper-rag-2020"
        }),
        expect.objectContaining({
          recordId: "paper-rag-2020",
          fieldPath: "papers.relations[2].termSlug",
          reason: "duplicate paper term relation: rag"
        })
      ])
    );
  });

  it("detects orphan topics, terms, papers, and sources", () => {
    const registry = makeValidContentRegistry();
    const broken: RawContentRegistry = {
      ...registry,
      terms: [
        {
          ...registry.terms[0],
          topicSlugs: ["missing-topic"],
          relatedTermSlugs: ["missing-term"],
          sourceRefs: ["missing-source"],
          paperRelations: [
            {
              ...registry.terms[0].paperRelations[0],
              paperId: "missing-paper",
              sourceRefs: ["missing-relation-source"]
            }
          ]
        }
      ]
    };

    const issues = validateContentRegistry(broken).issues;

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldPath: "terms.topicSlugs[0]", reason: "orphan topic: missing-topic" }),
        expect.objectContaining({ fieldPath: "terms.relatedTermSlugs[0]", reason: "orphan related term: missing-term" }),
        expect.objectContaining({ fieldPath: "terms.sourceRefs[0]", reason: "orphan source: missing-source" }),
        expect.objectContaining({ fieldPath: "terms.paperRelations[0].paperId", reason: "orphan paper: missing-paper" })
      ])
    );
  });

  it("detects missing source references on published terms", () => {
    const registry = makeValidContentRegistry();
    const broken: RawContentRegistry = {
      ...registry,
      terms: [{ ...registry.terms[0], sourceRefs: [] }]
    };

    expect(validateContentRegistry(broken).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.sourceRefs",
          reason: "published term needs source refs"
        })
      ])
    );
  });

  it("detects missing required relations on published terms and papers", () => {
    const registry = cloneValidFixtureRegistry();
    registry.terms[0].relatedTermSlugs = [];
    registry.terms[0].paperRelations = [];
    registry.papers[0].relations = [];

    const issues = validateContentRegistry(registry).issues;

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.relatedTermSlugs",
          reason: "published term needs related terms"
        }),
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.paperRelations",
          reason: "published term needs paper relations"
        }),
        expect.objectContaining({
          recordId: "paper-rag-2020",
          fieldPath: "papers.relations",
          reason: "published paper needs term relations"
        })
      ])
    );
  });

  it("detects invalid publication exposure for scheduled drafts", () => {
    const registry = makeValidContentRegistry();
    const draftTerm = {
      ...registry.terms[0],
      slug: "draft-term",
      publicationState: "draft",
      paperRelations: [],
      relatedTermSlugs: [],
      verification: undefined
    };
    const mixed: RawContentRegistry = {
      ...registry,
      terms: [...registry.terms, draftTerm],
      scheduledTermSlugs: ["rag", "draft-term"]
    };

    expect(validateContentRegistry(mixed).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "draft-term",
          fieldPath: "scheduledTermSlugs[1]",
          reason: "invalid publication exposure: scheduled terms must be published"
        })
      ])
    );
  });

  it("detects drift between legacy scheduled slugs and schedule entries", () => {
    const registry: RawContentRegistry = {
      ...makeValidContentRegistry(),
      schedule: makeFixtureSchedule("rag"),
      scheduledTermSlugs: ["dense-retrieval"]
    };

    expect(validateContentRegistry(registry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "scheduledTermSlugs",
          reason: "scheduledTermSlugs must match schedule.entries term order"
        })
      ])
    );
  });

  it("filters public loaders to published records only", () => {
    const registry = makeValidContentRegistry();
    const draftRegistry: RawContentRegistry = {
      ...registry,
      topics: [
        ...registry.topics,
        {
          ...registry.topics[0],
          slug: "draft-topic",
          publicationState: "draft",
          verification: undefined
        }
      ],
      terms: [
        ...registry.terms,
        {
          ...registry.terms[0],
          slug: "draft-term",
          publicationState: "draft",
          paperRelations: [],
          verification: undefined
        }
      ],
      papers: [
        ...registry.papers,
        {
          ...registry.papers[0],
          id: "draft-paper",
          doi: "10.48550/arxiv.2005.11402",
          url: "https://arxiv.org/abs/2005.11402",
          publicationState: "draft",
          relations: [],
          verification: undefined
        }
      ],
      sources: [
        ...registry.sources,
        {
          ...registry.sources[0],
          id: "draft-source",
          doi: "10.48550/arxiv.2005.11402",
          url: "https://arxiv.org/abs/2005.11402",
          publicationState: "draft",
          verifies: [{ recordId: "rag", fields: ["headword"] }]
        }
      ]
    };

    const published = loadPublishedContent(draftRegistry);

    expect(published.topics.map((topic) => topic.slug)).toEqual(["information-retrieval"]);
    expect(published.terms.map((term) => term.slug)).toEqual(["rag", "dense-retrieval"]);
    expect(published.papers.map((paper) => paper.id)).toEqual(["paper-rag-2020"]);
    expect(published.sources.map((source) => source.id)).toEqual(["source-rag-paper"]);
  });

  it("detects missing Korean relevance rationale", () => {
    const registry = makeValidContentRegistry();
    const broken: RawContentRegistry = {
      ...registry,
      terms: [
        {
          ...registry.terms[0],
          paperRelations: [{ ...registry.terms[0].paperRelations[0], relevanceRationaleKo: "" }]
        }
      ]
    };

    expect(validateContentRegistry(broken).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms[0].paperRelations[0].relevanceRationaleKo",
          reason: "must not be empty"
        })
      ])
    );
  });

  it("proves provenance workflow coverage, not factual truth", () => {
    const registry = makeValidContentRegistry();
    const provenanceGap: RawContentRegistry = {
      ...registry,
      sources: [
        {
          ...registry.sources[0],
          verifies: registry.sources[0].verifies.map((mapping) =>
            mapping.recordId === "rag"
              ? {
                  ...mapping,
                  fields: mapping.fields.filter((field) => field !== "explanationKo")
                }
              : mapping
          )
        }
      ]
    };

    expect(validateContentRegistry(provenanceGap).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.explanationKo",
          reason: "missing source provenance for published field"
        })
      ])
    );
  });

  it.each([
    ["acronym", "terms.acronym"],
    ["aliases", "terms.aliases"]
  ] satisfies [VerifiableField, string][])(
    "requires source provenance for published term %s fields when present",
    (field, fieldPath) => {
      const registry = cloneValidFixtureRegistry();
      const source = registry.sources.find((candidate) => candidate.id === "source-rag-paper")!;
      const mapping = source.verifies.find((candidate) => candidate.recordId === "rag")!;
      mapping.fields = mapping.fields.filter((candidate) => candidate !== field);

      expect(validateContentRegistry(registry).issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recordId: "rag",
            fieldPath,
            reason: "missing source provenance for published field"
          })
        ])
      );
    }
  );

  it.each([
    ["acronym", "terms.acronym"],
    ["aliases", "terms.aliases"]
  ] satisfies [VerifiableField, string][])(
    "requires editorial attestation for published term %s fields when present",
    (field, fieldPath) => {
      const registry = cloneValidFixtureRegistry();
      const sourceCheck = registry.terms[0].verification!.sourceChecks[0]!;
      sourceCheck.fields = sourceCheck.fields.filter((candidate) => candidate !== field);

      expect(validateContentRegistry(registry).issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recordId: "rag",
            fieldPath,
            reason: "missing editorial verification attestation for published field"
          })
        ])
      );
    }
  );

  it.each([
    ["acronym", "terms.acronym"],
    ["aliases", "terms.aliases"]
  ] satisfies [VerifiableField, string][])(
    "requires the same declared source to support and attest published term %s fields",
    (field, fieldPath) => {
      const registry = cloneValidFixtureRegistry();
      registry.sources.push({
        ...registry.sources[0],
        id: "source-secondary",
        url: "https://example.com/source-secondary",
        doi: undefined,
        title: "Secondary test source",
        verifies: [{ recordId: "rag", fields: ["headword"] }]
      });
      registry.terms[0].sourceRefs.push("source-secondary");
      const sourceCheck = registry.terms[0].verification!.sourceChecks[0]!;
      sourceCheck.fields = sourceCheck.fields.filter((candidate) => candidate !== field);
      registry.terms[0].verification!.sourceChecks.push({
        sourceId: "source-secondary",
        fields: [field],
        checkedAt: "2026-08-11"
      });

      expect(validateContentRegistry(registry).issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recordId: "rag",
            fieldPath,
            reason: "published field needs the same declared source for provenance and editorial verification"
          })
        ])
      );
    }
  );

  it("requires provenance for published related term links", () => {
    const registry = makeValidContentRegistry();
    const relatedLinkGap: RawContentRegistry = {
      ...registry,
      sources: [
        {
          ...registry.sources[0],
          verifies: registry.sources[0].verifies.map((mapping) =>
            mapping.recordId === "rag"
              ? {
                  ...mapping,
                  fields: mapping.fields.filter((field) => field !== "relatedTermSlugs")
                }
              : mapping
          )
        }
      ]
    };

    expect(validateContentRegistry(relatedLinkGap).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.relatedTermSlugs",
          reason: "missing source provenance for published field"
        })
      ])
    );
  });

  it("requires the same declared source to support and attest each published field", () => {
    const registry = cloneValidFixtureRegistry();
    registry.sources.push({
      ...registry.sources[0],
      id: "source-secondary",
      url: "https://example.com/source-secondary",
      doi: undefined,
      title: "Secondary test source",
      verifies: [{ recordId: "rag", fields: ["headword"] }]
    });
    registry.terms[0].sourceRefs.push("source-secondary");
    registry.terms[0].verification!.sourceChecks = [
      {
        ...registry.terms[0].verification!.sourceChecks[0],
        fields: registry.terms[0].verification!.sourceChecks[0].fields.filter((field) => field !== "explanationKo")
      },
      {
        sourceId: "source-secondary",
        fields: ["explanationKo"],
        checkedAt: "2026-08-11"
      }
    ];

    expect(validateContentRegistry(registry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.explanationKo",
          reason: "published field needs the same declared source for provenance and editorial verification"
        })
      ])
    );
  });

  it("detects verification source checks that are unresolved or not declared on the record", () => {
    const undeclared = cloneValidFixtureRegistry();
    undeclared.sources.push({
      ...undeclared.sources[0],
      id: "source-secondary",
      url: "https://example.com/source-secondary",
      doi: undefined,
      title: "Secondary test source",
      verifies: [{ recordId: "rag", fields: ["headword"] }]
    });
    undeclared.terms[0].verification!.sourceChecks[0].sourceId = "source-secondary";

    expect(validateContentRegistry(undeclared).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.verification.sourceChecks[0].sourceId",
          reason: "verification source is not declared on record: source-secondary"
        })
      ])
    );

    const unresolved = cloneValidFixtureRegistry();
    unresolved.topics[0].verification!.sourceChecks[0].sourceId = "missing-source";

    expect(validateContentRegistry(unresolved).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "information-retrieval",
          fieldPath: "topics.verification.sourceChecks[0].sourceId",
          reason: "orphan verification source: missing-source"
        })
      ])
    );
  });

  it("detects published topics that expose unpublished sources", () => {
    const registry = cloneValidFixtureRegistry();
    registry.topics[0].publicationState = "published";
    registry.sources[0].publicationState = "draft";

    expect(validateContentRegistry(registry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "information-retrieval",
          fieldPath: "topics.sourceRefs[0]",
          reason: "invalid publication exposure: source-rag-paper is draft"
        })
      ])
    );
  });

  it("detects published topic provenance gaps", () => {
    const registry = cloneValidFixtureRegistry();
    registry.topics[0].publicationState = "published";
    const source = registry.sources.find((candidate) => candidate.id === "source-rag-paper")!;
    const topicMapping = source.verifies.find((mapping) => mapping.recordId === "information-retrieval")!;
    topicMapping.fields = topicMapping.fields.filter((field) => field !== "descriptionKo");

    expect(validateContentRegistry(registry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "information-retrieval",
          fieldPath: "topics.descriptionKo",
          reason: "missing source provenance for published field"
        })
      ])
    );
  });

  it("detects missing inverse paper relations", () => {
    const registry = cloneValidFixtureRegistry();
    registry.papers[0].relations = [];

    expect(validateContentRegistry(registry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.paperRelations[0]",
          reason: "missing inverse paper relation: paper-rag-2020 -> rag"
        })
      ])
    );
  });

  it("detects mismatched inverse paper relations", () => {
    const registry = cloneValidFixtureRegistry();
    registry.papers[0].relations[0].relationType = "survey";

    expect(validateContentRegistry(registry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "rag",
          fieldPath: "terms.paperRelations[0]",
          reason: "mismatched inverse paper relation type: expected seminal, found survey"
        })
      ])
    );
  });

  it("throws a structured validation error from strict loaders", () => {
    const registry = makeValidContentRegistry();
    const broken: RawContentRegistry = {
      ...registry,
      scheduledTermSlugs: ["missing-term"]
    };

    expect(() => assertValidContentRegistry(broken)).toThrow(ContentValidationError);
  });
});

function cloneValidFixtureRegistry(): ContentRegistry {
  return structuredClone(assertValidContentRegistry(makeValidContentRegistry()));
}

function makeFixtureSchedule(termSlug: string) {
  return {
    scheduleId: "fixture-schedule.v1",
    version: "v1",
    timezone: "Asia/Seoul",
    startDateKst: "2026-08-11",
    endDateKst: "2026-08-11",
    durationDays: 1,
    noRepeatWindowDays: 20,
    immutableSinceKst: "2026-08-11",
    entries: [{ dateKst: "2026-08-11", termSlug }]
  };
}
