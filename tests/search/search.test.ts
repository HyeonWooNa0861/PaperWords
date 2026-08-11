import { describe, expect, it } from "vitest";
import searchEvalCases from "@/tests/fixtures/search-eval.json";
import { contentRegistry } from "@/content/registry";
import { buildSearchIndex, normalizeSearchText, searchTerms, type NormalizedQueryStatus } from "@/src/lib/search";
import { loadPublishedContent, type PublishedContentRegistry, type RawContentRegistry } from "@/src/lib/content";

interface SearchEvalCase {
  id: string;
  query: string;
  class: string;
  expectedTop1?: string;
  expectedTop3?: string[];
  expectedStatus?: NormalizedQueryStatus;
  rationale: string;
}

const releaseQueryClasses = new Set([
  "english-exact",
  "acronym-exact",
  "alias-exact",
  "korean-exact",
  "korean-prefix",
  "english-prefix",
  "punctuation-normalized-acronym",
  "hyphen-space-variation",
  "unicode-compatibility",
  "bounded-typo-fuzzy",
  "empty",
  "no-result",
  "malformed-query",
  "unsupported-script",
  "oversized-query"
]);

const cases = searchEvalCases as SearchEvalCase[];

describe("search normalization", () => {
  it("normalizes Unicode compatibility, punctuation, dotted acronyms, whitespace, and Hangul safely", () => {
    expect(normalizeSearchText(" Ｒ．Ａ．Ｇ． ").compact).toBe("rag");
    expect(normalizeSearchText("retrieval-augmented   generation").value).toBe("retrieval augmented generation");
    expect(normalizeSearchText("엣지   컴퓨팅").value).toBe("엣지 컴퓨팅");
    expect(normalizeSearchText("東京").status).toBe("unsupported");
    expect(normalizeSearchText("").status).toBe("empty");
    expect(normalizeSearchText("x".repeat(161)).status).toBe("oversized");
  });
});

describe("search evaluation dataset", () => {
  const published = loadPublishedContent(contentRegistry);
  const index = buildSearchIndex(published);

  it("contains the required release coverage", () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);

    const classes = new Set(cases.map((testCase) => testCase.class));
    for (const requiredClass of releaseQueryClasses) {
      expect(classes.has(requiredClass), requiredClass).toBe(true);
    }

    for (const term of published.terms) {
      expect(
        cases.some((testCase) => testCase.expectedTop1 === term.slug && isEnglishQuery(testCase.query)),
        `${term.slug} English coverage`
      ).toBe(true);
      expect(
        cases.some((testCase) => testCase.expectedTop1 === term.slug && /\p{Script=Hangul}/u.test(testCase.query)),
        `${term.slug} Korean coverage`
      ).toBe(true);
    }
  });

  it("passes every declared top-1 and top-3 case", () => {
    for (const testCase of cases) {
      const response = searchTerms(testCase.query, { index });
      const slugs = response.results.map((result) => result.slug);

      if (testCase.expectedTop1) {
        expect(slugs[0], `${testCase.id}: ${testCase.rationale}`).toBe(testCase.expectedTop1);
      }

      if (testCase.expectedTop3) {
        if (testCase.expectedTop3.length === 0) {
          expect(slugs, `${testCase.id}: ${testCase.rationale}`).toEqual([]);
        } else {
          expect(slugs.slice(0, 3), `${testCase.id}: ${testCase.rationale}`).toEqual(
            expect.arrayContaining(testCase.expectedTop3)
          );
        }
      }

      if (testCase.expectedStatus) {
        expect(response.query.status, `${testCase.id}: ${testCase.rationale}`).toBe(testCase.expectedStatus);
      }
    }
  });

  it("is deterministic across repeated runs", () => {
    const firstRun = runAllQueries(published);
    const secondRun = runAllQueries(published);

    expect(secondRun).toEqual(firstRun);
  });

  it("uses published records only when building the index", () => {
    const rawWithDraft: RawContentRegistry = {
      ...contentRegistry,
      terms: [
        ...contentRegistry.terms,
        {
          ...contentRegistry.terms[0],
          slug: "draft-transformer",
          headword: "Draft Transformer",
          publicationState: "draft",
          topicSlugs: [],
          relatedTermSlugs: [],
          paperRelations: [],
          sourceRefs: [],
          verification: undefined
        }
      ]
    };
    const publicRegistry = loadPublishedContent(rawWithDraft);

    const response = searchTerms("Draft Transformer", { registry: publicRegistry });

    expect(publicRegistry.terms.some((term) => term.slug === "draft-transformer")).toBe(false);
    expect(response.results).toEqual([]);
  });

  it("keeps exact headword matches above body matches", () => {
    const response = searchTerms("Transformer", { index });

    expect(response.results[0]).toMatchObject({
      slug: "transformer",
      matchClass: "exact-headword"
    });
    expect(response.results.find((result) => result.matchClass === "body")?.slug).not.toBe("transformer");
  });
});

function runAllQueries(registry: PublishedContentRegistry) {
  const index = buildSearchIndex(registry);
  return cases.map((testCase) => {
    const response = searchTerms(testCase.query, { index });

    return {
      id: testCase.id,
      slugs: response.results.map((result) => result.slug),
      status: response.query.status
    };
  });
}

function isEnglishQuery(query: string): boolean {
  return /[A-Za-z]/.test(query) && !/\p{Script=Hangul}/u.test(query);
}
