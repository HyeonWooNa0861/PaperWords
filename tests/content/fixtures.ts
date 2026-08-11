import type { RawContentRegistry } from "@/src/lib/content";

export function makeValidContentRegistry() {
  return {
    topics: [
      {
        slug: "information-retrieval",
        labelEn: "Information Retrieval",
        labelKo: "정보 검색",
        descriptionKo: "문서나 지식 저장소에서 필요한 정보를 찾는 연구 주제입니다.",
        publicationState: "published",
        sourceRefs: ["source-rag-paper"],
        verification: {
          reviewer: "editorial-test",
          verifiedAt: "2026-08-11",
          sourceChecks: [
            {
              sourceId: "source-rag-paper",
              fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
              checkedAt: "2026-08-11"
            }
          ]
        }
      }
    ],
    terms: [
      {
        slug: "rag",
        headword: "Retrieval-Augmented Generation",
        acronym: "RAG",
        aliases: ["retrieval augmented generation"],
        koreanEquivalents: ["검색 증강 생성"],
        shortDefinitionKo: "외부 검색 결과를 생성 모델 입력에 결합하는 방법입니다.",
        explanationKo: "모델이 문서를 검색한 뒤 그 근거를 함께 사용해 답변을 생성하는 접근입니다.",
        topicSlugs: ["information-retrieval"],
        relatedTermSlugs: ["dense-retrieval"],
        paperRelations: [
          {
            paperId: "paper-rag-2020",
            relationType: "seminal",
            relevanceRationaleKo: "검색 증강 생성과 대표 논문을 연결하는 검토 근거입니다.",
            sourceRefs: ["source-rag-paper"]
          }
        ],
        sourceRefs: ["source-rag-paper"],
        publicationState: "published",
        verification: {
          reviewer: "editorial-test",
          verifiedAt: "2026-08-11",
          sourceChecks: [
            {
              sourceId: "source-rag-paper",
              fields: [
                "headword",
                "acronym",
                "aliases",
                "koreanEquivalents",
                "shortDefinitionKo",
                "explanationKo",
                "topicSlugs",
                "relatedTermSlugs",
                "paperRelations",
                "sourceRefs"
              ],
              checkedAt: "2026-08-11"
            }
          ]
        }
      },
      {
        slug: "dense-retrieval",
        headword: "Dense Retrieval",
        aliases: ["dense passage retrieval"],
        koreanEquivalents: ["밀집 검색"],
        shortDefinitionKo: "문서와 질의를 벡터 표현으로 바꾸어 가까운 항목을 찾는 검색 방식입니다.",
        explanationKo: "희소 키워드 매칭 대신 학습된 임베딩 공간에서 의미적으로 가까운 문서를 찾는 접근입니다.",
        topicSlugs: ["information-retrieval"],
        relatedTermSlugs: ["rag"],
        paperRelations: [
          {
            paperId: "paper-rag-2020",
            relationType: "application",
            relevanceRationaleKo: "검색 증강 생성에서 밀집 검색기가 문서 후보를 찾는 구성요소로 쓰인다는 검토 근거입니다.",
            sourceRefs: ["source-rag-paper"]
          }
        ],
        sourceRefs: ["source-rag-paper"],
        publicationState: "published",
        verification: {
          reviewer: "editorial-test",
          verifiedAt: "2026-08-11",
          sourceChecks: [
            {
              sourceId: "source-rag-paper",
              fields: [
                "headword",
                "aliases",
                "koreanEquivalents",
                "shortDefinitionKo",
                "explanationKo",
                "topicSlugs",
                "relatedTermSlugs",
                "paperRelations",
                "sourceRefs"
              ],
              checkedAt: "2026-08-11"
            }
          ]
        }
      }
    ],
    papers: [
      {
        id: "paper-rag-2020",
        title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        authors: [
          { name: "Patrick Lewis" },
          { name: "Ethan Perez" },
          { name: "Aleksandra Piktus", displayTruncated: true }
        ],
        venue: "NeurIPS",
        year: 2020,
        doi: "10.48550/arxiv.2005.11401",
        url: "https://arxiv.org/abs/2005.11401",
        metadataSources: ["source-rag-paper"],
        abstractStatus: "not_copied",
        relations: [
          {
            termSlug: "rag",
            relationType: "seminal",
            relevanceRationaleKo: "검색 증강 생성과 대표 논문을 연결하는 검토 근거입니다.",
            sourceRefs: ["source-rag-paper"]
          },
          {
            termSlug: "dense-retrieval",
            relationType: "application",
            relevanceRationaleKo: "검색 증강 생성에서 밀집 검색기가 문서 후보를 찾는 구성요소로 쓰인다는 검토 근거입니다.",
            sourceRefs: ["source-rag-paper"]
          }
        ],
        publicationState: "published",
        verification: {
          reviewer: "editorial-test",
          verifiedAt: "2026-08-11",
          sourceChecks: [
            {
              sourceId: "source-rag-paper",
              fields: ["title", "authors", "venue", "year", "doi", "relations"],
              checkedAt: "2026-08-11"
            }
          ]
        }
      }
    ],
    sources: [
      {
        id: "source-rag-paper",
        kind: "preprint-repository",
        url: "https://arxiv.org/abs/2005.11401",
        doi: "10.48550/arxiv.2005.11401",
        title: "arXiv record for Retrieval-Augmented Generation",
        publisherOrVenue: "arXiv",
        retrievedAt: "2026-08-11",
        verifiedAt: "2026-08-11",
        reviewer: "editorial-test",
        usagePolicy: "Bibliographic metadata only; no abstract body copied into PaperWords.",
        publicationState: "published",
        verifies: [
          {
            recordId: "information-retrieval",
            fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"]
          },
          {
            recordId: "rag",
            fields: [
              "headword",
              "acronym",
              "aliases",
              "koreanEquivalents",
              "shortDefinitionKo",
              "explanationKo",
              "topicSlugs",
              "relatedTermSlugs",
              "paperRelations",
              "sourceRefs"
            ]
          },
          {
            recordId: "dense-retrieval",
            fields: [
              "headword",
              "aliases",
              "koreanEquivalents",
              "shortDefinitionKo",
              "explanationKo",
              "topicSlugs",
              "relatedTermSlugs",
              "paperRelations",
              "sourceRefs"
            ]
          },
          {
            recordId: "paper-rag-2020",
            fields: ["title", "authors", "venue", "year", "doi", "relations"]
          }
        ]
      }
    ],
    scheduledTermSlugs: ["rag"]
  } satisfies RawContentRegistry;
}
