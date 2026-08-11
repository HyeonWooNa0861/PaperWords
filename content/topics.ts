import type { TopicRecord } from "@/src/lib/content";

import { editorialDate, reviewer } from "./editorial";

export const topics = [
  {
    slug: "neural-architectures",
    labelEn: "Neural Architectures",
    labelKo: "신경망 구조",
    descriptionKo: "모델이 정보를 표현하고 층과 연결을 구성하는 방식을 다루는 주제입니다.",
    publicationState: "published",
    sourceRefs: ["transformer-neurips-2017"],
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "transformer-neurips-2017",
          fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "information-retrieval",
    labelEn: "Information Retrieval",
    labelKo: "정보 검색",
    descriptionKo: "질문이나 요구에 맞는 문서와 지식 조각을 찾고 활용하는 방법을 다루는 주제입니다.",
    publicationState: "published",
    sourceRefs: ["rag-neurips-2020"],
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "rag-neurips-2020",
          fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "generative-modeling",
    labelEn: "Generative Modeling",
    labelKo: "생성 모델링",
    descriptionKo: "학습한 데이터 분포를 바탕으로 새로운 텍스트, 이미지, 신호 등을 만드는 모델 계열을 다루는 주제입니다.",
    publicationState: "published",
    sourceRefs: ["diffusion-neurips-2020"],
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "diffusion-neurips-2020",
          fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "edge-computing",
    labelEn: "Edge Computing",
    labelKo: "엣지 컴퓨팅",
    descriptionKo: "사용자·센서·단말 가까운 네트워크 가장자리에서 연산과 데이터를 처리하는 시스템 구조를 다루는 주제입니다.",
    publicationState: "published",
    sourceRefs: ["edge-computing-ieee-2016"],
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "edge-computing-ieee-2016",
          fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "edge-ai",
    labelEn: "Edge AI",
    labelKo: "엣지 인공지능",
    descriptionKo: "엣지 컴퓨팅 환경에서 AI 학습·추론·협업을 수행하는 방법을 다루는 주제입니다.",
    publicationState: "published",
    sourceRefs: ["edge-intelligence-ieee-2019", "edge-intelligence-arxiv-2019"],
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "edge-intelligence-ieee-2019",
          fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "model-quantization",
    labelEn: "Model Quantization",
    labelKo: "모델 양자화",
    descriptionKo: "신경망의 가중치와 활성값을 더 낮은 정밀도로 표현해 저장량과 추론 비용을 줄이는 방법을 다루는 주제입니다.",
    publicationState: "published",
    sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"],
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "integer-only-quantization-cvf-2018",
          fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"],
          checkedAt: editorialDate
        }
      ]
    }
  }
] satisfies TopicRecord[];
