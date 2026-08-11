import { describe, expect, it } from "vitest";
import { activeSchedule } from "@/content/schedule";
import {
  abstractBodyFields,
  assertValidContentRegistry,
  loadPublishedContent,
  validateContentRegistry,
  type PaperRecord,
  type SourceRecord
} from "@/src/lib/content";
import { contentRegistry } from "@/content/registry";

const topicSlugs = [
  "neural-architectures",
  "information-retrieval",
  "generative-modeling",
  "edge-computing",
  "edge-ai",
  "model-quantization"
] as const;

const seedTermSlugs = [
  "transformer",
  "retrieval-augmented-generation",
  "diffusion-model",
  "edge-computing",
  "edge-ai",
  "multi-access-edge-computing",
  "fog-computing",
  "cloudlet",
  "computation-offloading",
  "federated-learning",
  "on-device-inference",
  "neural-network-quantization",
  "post-training-quantization",
  "quantization-aware-training",
  "mixed-precision-quantization",
  "weight-only-quantization",
  "activation-quantization",
  "integer-only-inference",
  "binary-neural-network",
  "quantization-calibration"
] as const;

const edgeTermSlugs = [
  "edge-computing",
  "edge-ai",
  "multi-access-edge-computing",
  "fog-computing",
  "cloudlet",
  "computation-offloading",
  "federated-learning",
  "on-device-inference"
] as const;

const quantTermSlugs = [
  "neural-network-quantization",
  "post-training-quantization",
  "quantization-aware-training",
  "mixed-precision-quantization",
  "weight-only-quantization",
  "activation-quantization",
  "integer-only-inference",
  "binary-neural-network",
  "quantization-calibration"
] as const;

describe("curated production content registry", () => {
  it("validates with no content integrity issues", () => {
    expect(validateContentRegistry(contentRegistry).issues).toEqual([]);
  });

  it("publishes exactly the G003 seed corpus and attaches the G004 schedule", () => {
    const registry = assertValidContentRegistry(contentRegistry);

    expect(registry.topics.map((topic) => topic.slug)).toEqual([...topicSlugs]);
    expect(registry.terms.map((term) => term.slug)).toEqual([...seedTermSlugs]);
    expect(registry.terms).toHaveLength(20);
    expect(registry.topics).toHaveLength(6);
    expect(allRecords(registry).every((record) => record.publicationState === "published")).toBe(true);
    expect(registry.schedule).toEqual(activeSchedule);
    expect(registry.scheduledTermSlugs).toEqual(activeSchedule.entries.map((entry) => entry.termSlug));
  });

  it("exposes every current record through public loaders because G003 has no drafts", () => {
    const registry = assertValidContentRegistry(contentRegistry);
    const published = loadPublishedContent(contentRegistry);

    expect(published.topics.map((topic) => topic.slug)).toEqual(registry.topics.map((topic) => topic.slug));
    expect(published.terms.map((term) => term.slug)).toEqual([...seedTermSlugs]);
    expect(published.papers.map((paper) => paper.id)).toEqual(registry.papers.map((paper) => paper.id));
    expect(published.sources.map((source) => source.id)).toEqual(registry.sources.map((source) => source.id));
    expect(published.schedule).toEqual(activeSchedule);
    expect(published.scheduledTermSlugs).toEqual(activeSchedule.entries.map((entry) => entry.termSlug));
  });

  it("keeps the focused seed balance at 3 foundational, 8 edge, and 9 quantization terms", () => {
    const registry = assertValidContentRegistry(contentRegistry);
    const terms = new Set(registry.terms.map((term) => term.slug));
    const edgeTerms = new Set<string>(edgeTermSlugs);
    const quantTerms = new Set<string>(quantTermSlugs);

    expect(edgeTermSlugs.filter((slug) => terms.has(slug))).toHaveLength(8);
    expect(quantTermSlugs.filter((slug) => terms.has(slug))).toHaveLength(9);
    expect(seedTermSlugs.filter((slug) => !edgeTerms.has(slug) && !quantTerms.has(slug))).toHaveLength(3);
  });

  it("uses evidence-backed related links for the three foundational terms", () => {
    const registry = assertValidContentRegistry(contentRegistry);
    const terms = termBySlug(registry.terms);

    expect(terms["transformer"].relatedTermSlugs).toEqual(["retrieval-augmented-generation"]);
    expect(terms["retrieval-augmented-generation"].relatedTermSlugs).toEqual(["transformer"]);
    expect(terms["diffusion-model"].relatedTermSlugs).toEqual(["post-training-quantization"]);
  });

  it("stores complete paper authors with exactly one canonical author source per paper", () => {
    const registry = assertValidContentRegistry(contentRegistry);
    const authorOwners = authorOwnerByPaperId(registry.papers, registry.sources);

    for (const paper of registry.papers) {
      expect(paper.authors.length, paper.id).toBeGreaterThan(0);
      expect(paper.authors.some((author) => author.displayTruncated), paper.id).toBe(false);
      expect(paper.authors.some((author) => /et al\.|others/i.test(author.name)), paper.id).toBe(false);
      expect(authorOwners[paper.id], paper.id).toHaveLength(1);
      expect(paper.metadataSources, paper.id).toContain(authorOwners[paper.id][0]);
    }

    expect(authorOwners).toMatchObject({
      "attention-is-all-you-need-2017": ["transformer-arxiv-2017"],
      "rag-knowledge-intensive-nlp-2020": ["rag-arxiv-2020"],
      "denoising-diffusion-probabilistic-models-2020": ["diffusion-arxiv-2020"],
      "vm-based-cloudlets-mobile-computing-2009": ["cloudlet-microsoft-research-2009"]
    });
  });

  it("keeps editorial author checks aligned with canonical author sources", () => {
    const registry = assertValidContentRegistry(contentRegistry);
    const authorOwners = authorOwnerByPaperId(registry.papers, registry.sources);

    for (const paper of registry.papers) {
      const authorCheckSourceIds =
        paper.verification?.sourceChecks.filter((check) => check.fields.includes("authors")).map((check) => check.sourceId) ??
        [];

      expect(authorCheckSourceIds, paper.id).toEqual(authorOwners[paper.id]);
    }
  });

  it("stores no abstract body fields", () => {
    const registry = assertValidContentRegistry(contentRegistry);

    for (const paper of registry.papers) {
      const rawPaper = paper as unknown as Record<string, unknown>;
      expect(paper.abstractStatus).toBe("not_copied");
      for (const field of abstractBodyFields) {
        expect(Object.hasOwn(rawPaper, field), `${paper.id}.${field}`).toBe(false);
      }
    }
  });

  it("guards exact official paper locators for foundational and added focus papers", () => {
    const registry = assertValidContentRegistry(contentRegistry);

    expect(paperLocatorsById(registry.papers)).toMatchObject({
      "attention-is-all-you-need-2017": {
        doi: "10.48550/arxiv.1706.03762",
        url: "https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html"
      },
      "rag-knowledge-intensive-nlp-2020": {
        doi: "10.48550/arxiv.2005.11401",
        url: "https://proceedings.neurips.cc/paper_files/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html"
      },
      "denoising-diffusion-probabilistic-models-2020": {
        doi: "10.48550/arxiv.2006.11239",
        url: "https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html"
      },
      "edge-computing-vision-and-challenges-2016": {
        doi: "10.1109/jiot.2016.2579198",
        url: "https://ieeexplore.ieee.org/document/7488250"
      },
      "post-training-quantization-diffusion-models-2023": {
        doi: undefined,
        url: "https://openaccess.thecvf.com/content/CVPR2023/html/Shang_Post-Training_Quantization_on_Diffusion_Models_CVPR_2023_paper.html"
      },
      "integer-arithmetic-only-inference-2018": {
        doi: "10.48550/arxiv.1712.05877",
        url: "https://openaccess.thecvf.com/content_cvpr_2018/html/Jacob_Quantization_and_Training_CVPR_2018_paper.html"
      }
    });
  });

  it("guards exact official source locators for key edge and quantization evidence", () => {
    const registry = assertValidContentRegistry(contentRegistry);

    expect(sourceLocatorsById(registry.sources)).toMatchObject({
      "edge-intelligence-arxiv-2019": {
        kind: "preprint-repository",
        doi: "10.48550/arxiv.1905.10083",
        url: "https://arxiv.org/abs/1905.10083"
      },
      "mec-etsi-official": {
        kind: "official-documentation",
        doi: null,
        url: "https://www.etsi.org/technologies/ict-infrastructure-operations/"
      },
      "cloudlet-microsoft-research-2009": {
        kind: "official-documentation",
        doi: null,
        url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/cloudlets09.pdf"
      },
      "ptq-diffusion-cvf-2023": {
        kind: "publisher",
        doi: null,
        url: "https://openaccess.thecvf.com/content/CVPR2023/html/Shang_Post-Training_Quantization_on_Diffusion_Models_CVPR_2023_paper.html"
      },
      "integer-only-quantization-cvf-2018": {
        kind: "publisher",
        doi: null,
        url: "https://openaccess.thecvf.com/content_cvpr_2018/html/Jacob_Quantization_and_Training_CVPR_2018_paper.html"
      },
      "calibration-pmlr-2021": {
        kind: "publisher",
        doi: null,
        url: "https://proceedings.mlr.press/v139/hubara21a.html"
      }
    });
  });

  it("keeps semantic hygiene fixes from review", () => {
    const registry = assertValidContentRegistry(contentRegistry);
    const terms = termBySlug(registry.terms);

    expect(terms["edge-ai"].headword).toBe("Edge AI");
    expect(terms["edge-ai"].aliases).toEqual(["Edge Intelligence"]);
    expect(terms["federated-learning"].aliases).toEqual([]);
    expect(terms["post-training-quantization"].koreanEquivalents).toEqual(["훈련 후 양자화", "사후 양자화"]);
    expect(terms["quantization-aware-training"].paperRelations).toContainEqual(
      expect.objectContaining({
        paperId: "integer-arithmetic-only-inference-2018",
        relationType: "application"
      })
    );
  });
});

function allRecords(registry: ReturnType<typeof assertValidContentRegistry>) {
  return [...registry.topics, ...registry.terms, ...registry.papers, ...registry.sources];
}

function termBySlug(terms: ReturnType<typeof assertValidContentRegistry>["terms"]) {
  return Object.fromEntries(terms.map((term) => [term.slug, term]));
}

function paperLocatorsById(papers: PaperRecord[]) {
  return Object.fromEntries(papers.map((paper) => [paper.id, { doi: paper.doi, url: paper.url }]));
}

function sourceLocatorsById(sources: SourceRecord[]) {
  return Object.fromEntries(
    sources.map((source) => [source.id, { kind: source.kind, doi: source.doi ?? null, url: source.url }])
  );
}

function authorOwnerByPaperId(papers: PaperRecord[], sources: SourceRecord[]) {
  return Object.fromEntries(
    papers.map((paper) => [
      paper.id,
      sources
        .filter((source) =>
          source.verifies.some((mapping) => mapping.recordId === paper.id && mapping.fields.includes("authors"))
        )
        .map((source) => source.id)
    ])
  );
}
