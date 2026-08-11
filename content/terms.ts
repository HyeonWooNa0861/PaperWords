import type { TermRecord } from "@/src/lib/content";

import { editorialDate, reviewer } from "./editorial";

export const terms = [
  {
    slug: "transformer",
    headword: "Transformer",
    aliases: ["Transformer architecture", "attention-based Transformer"],
    koreanEquivalents: ["트랜스포머", "트랜스포머 신경망"],
    shortDefinitionKo: "순환이나 합성곱 대신 자기어텐션을 중심으로 토큰 사이의 관계를 병렬적으로 학습하는 신경망 구조입니다.",
    explanationKo:
      "트랜스포머는 토큰을 벡터로 표현하고 위치 정보를 더한 뒤, 여러 층에서 자기어텐션과 피드포워드 변환을 반복해 문맥 관계를 학습합니다. 구현에 따라 인코더와 디코더 블록을 함께 쓰거나 한쪽만 사용할 수 있습니다. 이 구조는 LLM을 만들 때 쓰일 수 있지만 LLM 자체와 같은 말은 아니며, 어텐션 가중치가 항상 충실한 설명 근거라는 뜻도 아닙니다.",
    topicSlugs: ["neural-architectures"],
    relatedTermSlugs: ["retrieval-augmented-generation"],
    paperRelations: [
      {
        paperId: "attention-is-all-you-need-2017",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 순환 또는 합성곱 시퀀스 층 없이 어텐션을 중심으로 구성된 Transformer 구조를 소개했습니다.",
        sourceRefs: ["transformer-neurips-2017", "transformer-arxiv-2017"]
      }
    ],
    sourceRefs: ["transformer-neurips-2017", "transformer-arxiv-2017", "rag-neurips-2020"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "transformer-neurips-2017",
          fields: [
            "headword",
            "aliases",
            "koreanEquivalents",
            "shortDefinitionKo",
            "explanationKo",
            "topicSlugs",
            "paperRelations",
            "sourceRefs"
          ],
          checkedAt: editorialDate
        },
        {
          sourceId: "transformer-arxiv-2017",
          fields: ["headword", "aliases", "paperRelations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "rag-neurips-2020",
          fields: ["relatedTermSlugs"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "retrieval-augmented-generation",
    headword: "Retrieval-Augmented Generation",
    acronym: "RAG",
    aliases: ["retrieval augmented generation"],
    koreanEquivalents: ["검색 증강 생성"],
    shortDefinitionKo: "외부 문서를 검색한 결과를 생성 모델의 입력 근거로 결합하는 방식입니다.",
    explanationKo:
      "RAG는 입력에 맞춰 검색기가 외부 문서를 찾고, 선택된 passage를 생성 모델 입력에 함께 넣어 답을 만들게 합니다. 논문에서는 모델 파라미터에 저장된 parametric memory와 검색 문서 같은 non-parametric memory를 결합하는 방식으로 설명합니다. 따라서 RAG는 단순한 검색 UI가 아니라 생성 과정에 검색 근거를 연결하는 아키텍처 패턴이며, 검색 실패나 근거 사용 실패가 있으면 사실성을 보장하지 않습니다.",
    topicSlugs: ["information-retrieval"],
    relatedTermSlugs: ["transformer"],
    paperRelations: [
      {
        paperId: "rag-knowledge-intensive-nlp-2020",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 RAG라는 이름을 공식화하고 지식 집약 NLP 과제를 위해 사전학습된 시퀀스 생성기와 검색된 비파라미터 메모리를 결합했습니다.",
        sourceRefs: ["rag-neurips-2020", "rag-arxiv-2020"]
      }
    ],
    sourceRefs: ["rag-neurips-2020", "rag-arxiv-2020"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "rag-neurips-2020",
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
          checkedAt: editorialDate
        },
        {
          sourceId: "rag-arxiv-2020",
          fields: ["headword", "acronym", "aliases", "paperRelations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "diffusion-model",
    headword: "Diffusion Model",
    aliases: ["Denoising Diffusion Model", "Diffusion Probabilistic Model"],
    koreanEquivalents: ["확산 모델", "확률적 확산 모델"],
    shortDefinitionKo: "데이터에 잡음을 더하는 과정의 역과정을 학습해 잡음에서 새로운 데이터를 생성하는 생성 모델입니다.",
    explanationKo:
      "확산 모델은 학습 데이터에 여러 단계로 잡음을 더하는 forward process를 정의하고, 모델이 그 역방향 denoising 과정을 timestep별로 학습해 순수 잡음에서 새 샘플을 만들도록 합니다. 이는 하나의 denoiser만을 가리키는 말이 아니라 반복적인 역과정을 포함하는 생성 모델 계열이며, 물리 현상의 확산을 그대로 시뮬레이션한다는 뜻도 아닙니다. DDPM은 이 계열을 널리 알린 영향력 있는 공식화입니다.",
    topicSlugs: ["generative-modeling"],
    relatedTermSlugs: ["post-training-quantization"],
    paperRelations: [
      {
        paperId: "denoising-diffusion-probabilistic-models-2020",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 denoising diffusion probabilistic model로 고품질 생성을 보였고 그 공식을 denoising score matching과 연결했습니다.",
        sourceRefs: ["diffusion-neurips-2020", "diffusion-arxiv-2020"]
      },
      {
        paperId: "post-training-quantization-diffusion-models-2023",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 학습이 끝난 diffusion model에 post-training quantization을 적용해 생성 모델에서도 배포 전 양자화가 다뤄지는 실제 맥락을 보여줍니다.",
        sourceRefs: ["ptq-diffusion-cvf-2023"]
      }
    ],
    sourceRefs: ["diffusion-neurips-2020", "diffusion-arxiv-2020", "ptq-diffusion-cvf-2023"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "diffusion-neurips-2020",
          fields: [
            "headword",
            "aliases",
            "koreanEquivalents",
            "shortDefinitionKo",
            "explanationKo",
            "topicSlugs",
            "paperRelations",
            "sourceRefs"
          ],
          checkedAt: editorialDate
        },
        {
          sourceId: "diffusion-arxiv-2020",
          fields: ["headword", "aliases", "paperRelations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "ptq-diffusion-cvf-2023",
          fields: ["relatedTermSlugs", "paperRelations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "edge-computing",
    headword: "Edge Computing",
    aliases: [],
    koreanEquivalents: ["엣지 컴퓨팅", "가장자리 컴퓨팅"],
    shortDefinitionKo: "데이터가 생기는 단말이나 네트워크 가까운 곳에서 계산과 저장을 수행하는 컴퓨팅 방식입니다.",
    explanationKo:
      "엣지 컴퓨팅은 모든 데이터를 먼 클라우드로 보낸 뒤 처리하는 대신, 기지국·게이트웨이·로컬 서버처럼 사용자와 가까운 위치에서 일부 연산과 서비스를 처리합니다. 지연 시간, 대역폭, 개인정보, 장애 격리 요구를 줄이는 데 유용하지만 클라우드를 완전히 대체한다는 뜻은 아닙니다. 연구에서는 자원 배치, 작업 분산, 보안, 이동성 관리가 함께 논의됩니다.",
    topicSlugs: ["edge-computing"],
    relatedTermSlugs: ["edge-ai", "fog-computing", "cloudlet"],
    paperRelations: [
      {
        paperId: "edge-computing-vision-and-challenges-2016",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 클라우드 중심 구조의 한계를 짚고 네트워크 가장자리에서 데이터 처리와 서비스를 수행하는 edge computing의 비전과 과제를 정리했습니다.",
        sourceRefs: ["edge-computing-ieee-2016"]
      }
    ],
    sourceRefs: ["edge-computing-ieee-2016"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "edge-computing-ieee-2016",
          fields: [
            "headword",
            "koreanEquivalents",
            "shortDefinitionKo",
            "explanationKo",
            "topicSlugs",
            "relatedTermSlugs",
            "paperRelations",
            "sourceRefs"
          ],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "edge-ai",
    headword: "Edge AI",
    aliases: ["Edge Intelligence"],
    koreanEquivalents: ["엣지 AI", "엣지 인공지능"],
    shortDefinitionKo: "AI 모델의 추론이나 학습 일부를 단말·게이트웨이·엣지 서버에서 수행하는 접근입니다.",
    explanationKo:
      "Edge AI는 AI 기능을 중앙 클라우드에만 의존하지 않고 엣지 컴퓨팅 자원과 결합합니다. 카메라, 센서, 모바일 기기처럼 데이터가 발생하는 곳 가까이에서 추론하거나, 여러 엣지 노드가 협력해 학습·캐싱·스케줄링을 수행할 수 있습니다. 단순히 작은 모델을 뜻하는 말은 아니며, 지연 시간·개인정보·네트워크 비용과 모델 정확도 사이의 균형을 함께 다룹니다.",
    topicSlugs: ["edge-ai", "edge-computing"],
    relatedTermSlugs: ["edge-computing", "on-device-inference", "federated-learning"],
    paperRelations: [
      {
        paperId: "edge-intelligence-last-mile-ai-edge-computing-2019",
        relationType: "survey",
        relevanceRationaleKo:
          "이 논문은 AI 서비스를 엣지 컴퓨팅과 결합해 지연, 대역폭, 개인정보 요구를 다루는 Edge Intelligence 연구 지형을 체계화했습니다.",
        sourceRefs: ["edge-intelligence-ieee-2019", "edge-intelligence-arxiv-2019"]
      }
    ],
    sourceRefs: ["edge-intelligence-ieee-2019", "edge-intelligence-arxiv-2019"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      notes: "Headword Edge AI follows the project taxonomy; supplied scholarly sources use Edge Intelligence as the source-backed alias.",
      sourceChecks: [
        {
          sourceId: "edge-intelligence-ieee-2019",
          fields: [
            "aliases",
            "koreanEquivalents",
            "shortDefinitionKo",
            "explanationKo",
            "topicSlugs",
            "relatedTermSlugs",
            "paperRelations",
            "sourceRefs"
          ],
          checkedAt: editorialDate
        },
        {
          sourceId: "edge-intelligence-arxiv-2019",
          fields: ["headword", "aliases", "paperRelations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "multi-access-edge-computing",
    headword: "Multi-access Edge Computing",
    acronym: "MEC",
    aliases: ["Mobile Edge Computing"],
    koreanEquivalents: ["멀티액세스 엣지 컴퓨팅", "모바일 엣지 컴퓨팅"],
    shortDefinitionKo: "접속망 가까이에 컴퓨팅 자원을 배치해 사용자와 서비스 사이의 지연을 줄이는 엣지 컴퓨팅 구조입니다.",
    explanationKo:
      "MEC는 이동통신망이나 여러 접속망 근처에 애플리케이션 실행 환경을 두어 낮은 지연과 위치 인식 서비스를 제공하려는 구조입니다. 초기 연구에서는 Mobile Edge Computing이라는 이름이 널리 쓰였고, 이후 여러 접속 기술을 포괄하는 Multi-access Edge Computing으로 확장되었습니다. MEC는 엣지 컴퓨팅의 한 구현·표준화 축이지 모든 엣지 시스템을 뜻하지는 않습니다.",
    topicSlugs: ["edge-computing"],
    relatedTermSlugs: ["edge-computing", "computation-offloading", "fog-computing"],
    paperRelations: [
      {
        paperId: "mobile-edge-computing-communication-perspective-2017",
        relationType: "survey",
        relevanceRationaleKo:
          "이 설문은 모바일/멀티액세스 엣지 컴퓨팅을 통신 관점에서 정리해 무선 접속망 가까이 배치되는 연산 자원의 역할을 설명했습니다.",
        sourceRefs: ["mec-ieee-2017", "mec-arxiv-2017"]
      }
    ],
    sourceRefs: ["mec-etsi-official", "mec-ieee-2017", "mec-arxiv-2017"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "mec-etsi-official",
          fields: ["headword", "acronym", "koreanEquivalents", "shortDefinitionKo", "topicSlugs", "sourceRefs"],
          checkedAt: editorialDate
        },
        {
          sourceId: "mec-ieee-2017",
          fields: ["aliases", "explanationKo", "relatedTermSlugs", "paperRelations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "fog-computing",
    headword: "Fog Computing",
    aliases: [],
    koreanEquivalents: ["포그 컴퓨팅"],
    shortDefinitionKo: "클라우드와 IoT 단말 사이에 중간 계층을 두어 지연과 위치 인식 요구를 처리하는 분산 컴퓨팅 방식입니다.",
    explanationKo:
      "포그 컴퓨팅은 클라우드의 기능을 네트워크 가장자리 쪽으로 확장하되, 단말과 클라우드 사이의 여러 중간 노드가 연산·저장·네트워킹을 맡는다는 점을 강조합니다. 엣지 컴퓨팅과 겹치지만, 포그는 특히 계층적 분산 구조와 IoT 환경의 위치 인식 서비스를 자주 강조합니다. 단순 캐시 서버나 CDN만을 뜻하지 않습니다.",
    topicSlugs: ["edge-computing"],
    relatedTermSlugs: ["edge-computing", "multi-access-edge-computing", "cloudlet"],
    paperRelations: [
      {
        paperId: "fog-computing-role-internet-of-things-2012",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 클라우드와 사물 사이의 중간 계층으로 fog computing을 제안해 IoT 지연과 위치 인식 요구를 다루는 구조를 제시했습니다.",
        sourceRefs: ["fog-computing-acm-2012"]
      }
    ],
    sourceRefs: ["fog-computing-acm-2012"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "fog-computing-acm-2012",
          fields: [
            "headword",
            "koreanEquivalents",
            "shortDefinitionKo",
            "explanationKo",
            "topicSlugs",
            "relatedTermSlugs",
            "paperRelations",
            "sourceRefs"
          ],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "cloudlet",
    headword: "Cloudlet",
    aliases: ["VM-based cloudlet"],
    koreanEquivalents: ["클라우드렛"],
    shortDefinitionKo: "모바일 단말 가까이에 배치된 작은 클라우드 자원으로, 지연이 민감한 작업을 보조합니다.",
    explanationKo:
      "클라우드렛은 스마트폰이나 모바일 단말이 멀리 있는 클라우드 대신 근처의 강한 계산 자원에 작업을 맡길 수 있도록 제안된 구조입니다. 특히 VM 기반 실행 환경을 단말 근처에 두어 지연을 줄이는 방식이 대표적입니다. 클라우드렛은 엣지 컴퓨팅의 역사적 선행 개념 중 하나지만, 모든 엣지 노드가 VM 기반 cloudlet인 것은 아닙니다.",
    topicSlugs: ["edge-computing"],
    relatedTermSlugs: ["edge-computing", "computation-offloading", "fog-computing"],
    paperRelations: [
      {
        paperId: "vm-based-cloudlets-mobile-computing-2009",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 모바일 단말 가까이에 VM 기반 cloudlet을 두어 지연을 줄이고 계산 집약 작업을 보조하는 구조를 제안했습니다.",
        sourceRefs: ["cloudlet-doi-2009"]
      }
    ],
    sourceRefs: ["cloudlet-doi-2009"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "cloudlet-doi-2009",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "computation-offloading",
    headword: "Computation Offloading",
    aliases: ["code offload", "task offloading"],
    koreanEquivalents: ["계산 오프로딩", "연산 오프로딩"],
    shortDefinitionKo: "단말이 수행하기 무거운 작업을 가까운 서버나 클라우드로 넘겨 실행하는 기법입니다.",
    explanationKo:
      "Computation offloading은 에너지, 지연 시간, 연산 성능을 고려해 작업 전체나 일부를 다른 장치 또는 엣지 서버에서 실행하게 합니다. 모바일·IoT 환경에서는 배터리와 성능 제약을 줄이는 데 쓰이지만, 네트워크 지연과 데이터 전송 비용이 커지면 오히려 손해가 날 수 있습니다. 엣지 컴퓨팅에서는 어떤 작업을 언제 어디로 보낼지가 핵심 문제가 됩니다.",
    topicSlugs: ["edge-computing"],
    relatedTermSlugs: ["multi-access-edge-computing", "cloudlet", "edge-computing"],
    paperRelations: [
      {
        paperId: "maui-code-offload-2010",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 스마트폰 코드 일부를 주변 인프라로 옮겨 실행하는 MAUI 시스템을 통해 computation offloading의 에너지 이득과 제약을 보여줬습니다.",
        sourceRefs: ["maui-acm-2010"]
      }
    ],
    sourceRefs: ["maui-acm-2010"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "maui-acm-2010",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "federated-learning",
    headword: "Federated Learning",
    aliases: [],
    koreanEquivalents: ["연합 학습", "페더레이티드 러닝"],
    shortDefinitionKo: "여러 단말이나 기관의 데이터를 중앙에 모으지 않고 로컬 학습 결과를 집계해 모델을 학습하는 방식입니다.",
    explanationKo:
      "연합 학습은 각 클라이언트가 자신의 데이터를 보관한 채 모델 갱신을 계산하고, 서버가 그 갱신을 모아 전역 모델을 갱신합니다. 데이터가 이동하지 않는다는 점은 개인정보와 통신 비용에 도움이 되지만, 프라이버시가 자동으로 보장된다는 뜻은 아닙니다. 엣지 AI에서는 많은 단말이 분산된 데이터를 가지고 협력 학습을 할 때 중요한 패턴입니다.",
    topicSlugs: ["edge-ai"],
    relatedTermSlugs: ["edge-ai", "on-device-inference", "edge-computing"],
    paperRelations: [
      {
        paperId: "communication-efficient-learning-decentralized-data-2017",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 분산 단말의 데이터를 중앙으로 모으지 않고 모델 갱신을 집계하는 Federated Averaging 접근을 제시했습니다.",
        sourceRefs: ["federated-learning-pmlr-2017"]
      }
    ],
    sourceRefs: ["federated-learning-pmlr-2017"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "federated-learning-pmlr-2017",
          fields: [
            "headword",
                "koreanEquivalents",
                "shortDefinitionKo",
                "explanationKo",
            "topicSlugs",
            "relatedTermSlugs",
            "paperRelations",
            "sourceRefs"
          ],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "on-device-inference",
    headword: "On-device Inference",
    aliases: ["on-device neural network inference"],
    koreanEquivalents: ["온디바이스 추론", "기기 내 추론"],
    shortDefinitionKo: "AI 모델의 추론을 클라우드가 아니라 사용자 단말이나 IoT 장치 안에서 실행하는 방식입니다.",
    explanationKo:
      "On-device inference는 입력 데이터를 서버로 보내지 않고 장치 자체에서 모델을 실행합니다. 지연 시간과 네트워크 의존성을 줄이고 민감한 데이터를 로컬에 둘 수 있지만, 메모리·전력·연산량 제약 때문에 모델 압축, 양자화, 하드웨어 친화적 설계가 중요해집니다. 엣지 AI의 한 형태지만, 엣지 서버에서 실행되는 추론과는 구분됩니다.",
    topicSlugs: ["edge-ai", "model-quantization"],
    relatedTermSlugs: ["edge-ai", "neural-network-quantization", "integer-only-inference"],
    paperRelations: [
      {
        paperId: "mcunet-tiny-deep-learning-iot-devices-2020",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 마이크로컨트롤러급 IoT 장치에서 신경망 추론을 가능하게 하는 모델-시스템 공동 설계를 보여줬습니다.",
        sourceRefs: ["mcunet-neurips-2020"]
      }
    ],
    sourceRefs: ["mcunet-neurips-2020"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "mcunet-neurips-2020",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "neural-network-quantization",
    headword: "Neural Network Quantization",
    aliases: ["model quantization", "network quantization"],
    koreanEquivalents: ["신경망 양자화", "모델 양자화"],
    shortDefinitionKo: "신경망의 가중치나 활성값을 낮은 비트 정밀도로 표현해 저장량과 계산량을 줄이는 기법입니다.",
    explanationKo:
      "신경망 양자화는 보통 FP32 같은 높은 정밀도 값을 INT8, INT4, 이진값처럼 더 작은 표현으로 바꿉니다. 목적은 메모리 사용량, 대역폭, 연산 비용을 줄여 엣지나 모바일 환경에서 추론을 가능하게 하는 것입니다. 양자화는 단순 반올림만이 아니라 스케일, zero point, calibration, 학습 중 시뮬레이션 같은 절차를 포함할 수 있으며, 압축과 정확도 사이의 균형이 핵심입니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: [
      "post-training-quantization",
      "quantization-aware-training",
      "integer-only-inference",
      "mixed-precision-quantization"
    ],
    paperRelations: [
      {
        paperId: "integer-arithmetic-only-inference-2018",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 신경망 학습과 추론을 정수 연산 친화적으로 양자화하는 실용적 방법을 제시해 모델 양자화의 핵심 절차를 보여줬습니다.",
        sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"]
      }
    ],
    sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "integer-only-quantization-cvf-2018",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "post-training-quantization",
    headword: "Post-Training Quantization",
    acronym: "PTQ",
    aliases: ["post training quantization"],
    koreanEquivalents: ["훈련 후 양자화", "사후 양자화"],
    shortDefinitionKo: "이미 학습된 모델을 다시 크게 학습하지 않고 낮은 정밀도로 변환하는 양자화 방식입니다.",
    explanationKo:
      "PTQ는 학습이 끝난 모델의 가중치와 활성값 범위를 분석해 양자화 파라미터를 정하고, 필요하면 작은 calibration 데이터셋으로 스케일을 맞춥니다. QAT보다 적용 비용이 낮아 배포 단계에 유용하지만, 모델과 비트 수에 따라 정확도 손실이 커질 수 있습니다. 단순히 파일 크기를 줄이는 압축이 아니라 실제 추론 연산 형식을 바꾸는 절차와 연결됩니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["quantization-calibration", "weight-only-quantization", "activation-quantization", "diffusion-model"],
    paperRelations: [
      {
        paperId: "adaptive-rounding-post-training-quantization-2020",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 학습이 끝난 모델의 가중치 반올림 결정을 최적화해 post-training quantization 정확도 손실을 줄이는 방법을 제시했습니다.",
        sourceRefs: ["adaround-pmlr-2020", "adaround-arxiv-2020"]
      },
      {
        paperId: "post-training-quantization-diffusion-models-2023",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 diffusion model을 학습 후 다시 크게 훈련하지 않고 양자화하는 사례를 통해 post-training quantization의 배포 맥락을 보여줍니다.",
        sourceRefs: ["ptq-diffusion-cvf-2023"]
      }
    ],
    sourceRefs: ["adaround-pmlr-2020", "adaround-arxiv-2020", "calibration-pmlr-2021", "ptq-diffusion-cvf-2023"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "adaround-pmlr-2020",
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
          checkedAt: editorialDate
        },
        {
          sourceId: "calibration-pmlr-2021",
          fields: ["explanationKo", "sourceRefs"],
          checkedAt: editorialDate
        },
        {
          sourceId: "ptq-diffusion-cvf-2023",
          fields: ["relatedTermSlugs", "paperRelations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "quantization-aware-training",
    headword: "Quantization-Aware Training",
    acronym: "QAT",
    aliases: ["quantization aware training"],
    koreanEquivalents: ["양자화 인지 학습", "양자화 인식 학습"],
    shortDefinitionKo: "학습 중에 양자화 효과를 모사해 낮은 정밀도 추론에 강한 모델을 만드는 방법입니다.",
    explanationKo:
      "QAT는 모델을 학습하거나 미세조정하는 동안 가중치와 활성값이 낮은 정밀도로 표현될 때의 오차를 반영합니다. 이렇게 하면 PTQ보다 추가 학습 비용은 들지만, 낮은 비트 정밀도에서도 정확도 손실을 줄일 가능성이 큽니다. QAT는 양자화된 연산 자체를 학습한다기보다 배포될 양자화 형식을 학습 과정에 노출시키는 절차입니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["neural-network-quantization", "integer-only-inference", "post-training-quantization"],
    paperRelations: [
      {
        paperId: "integer-arithmetic-only-inference-2018",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 학습 중 양자화 효과를 모사해 정수 추론에 맞춘 모델을 만드는 대표적인 실용 절차를 제시했습니다.",
        sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"]
      }
    ],
    sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "integer-only-quantization-cvf-2018",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "mixed-precision-quantization",
    headword: "Mixed-Precision Quantization",
    aliases: ["mixed precision quantization"],
    koreanEquivalents: ["혼합 정밀도 양자화", "믹스드 프리시전 양자화"],
    shortDefinitionKo: "모델의 층이나 연산마다 서로 다른 비트 정밀도를 배정하는 양자화 방식입니다.",
    explanationKo:
      "혼합 정밀도 양자화는 모든 층을 같은 비트 수로 줄이지 않고, 정확도에 민감한 부분에는 더 높은 정밀도를 남기고 덜 민감한 부분은 더 낮은 정밀도로 줄입니다. 따라서 메모리와 연산량을 줄이면서도 정확도 손실을 제어하려는 목적이 있습니다. 단순히 FP16과 FP32를 섞어 학습하는 mixed precision training과는 구분됩니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["neural-network-quantization", "activation-quantization", "integer-only-inference"],
    paperRelations: [
      {
        paperId: "hawq-mixed-precision-quantization-2019",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 Hessian 정보를 이용해 계층별 민감도를 반영하는 mixed-precision quantization 배치를 제안했습니다.",
        sourceRefs: ["hawq-cvf-2019"]
      }
    ],
    sourceRefs: ["hawq-cvf-2019"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "hawq-cvf-2019",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "weight-only-quantization",
    headword: "Weight-Only Quantization",
    aliases: ["weight quantization"],
    koreanEquivalents: ["가중치 전용 양자화", "가중치만 양자화"],
    shortDefinitionKo: "모델의 가중치를 낮은 비트로 저장·계산하되 활성값은 상대적으로 높은 정밀도로 유지하는 양자화 방식입니다.",
    explanationKo:
      "Weight-only quantization은 대규모 모델에서 메모리와 대역폭의 큰 부분을 차지하는 가중치를 낮은 비트로 표현합니다. 활성값까지 낮은 정밀도로 바꾸는 방식보다 구현 부담이 작을 수 있지만, 연산 커널과 dequantization 비용이 성능을 좌우합니다. 특히 Transformer 기반 LLM 배포에서 모델 크기와 메모리 병목을 줄이는 방법으로 자주 논의됩니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["post-training-quantization", "neural-network-quantization", "transformer"],
    paperRelations: [
      {
        paperId: "gptq-post-training-quantization-transformers-2022",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 대규모 Transformer 계열 모델을 대상으로 가중치만 양자화하는 post-training 방법을 제시해 weight-only quantization의 대표 사례가 됐습니다.",
        sourceRefs: ["gptq-arxiv-2022"]
      }
    ],
    sourceRefs: ["gptq-arxiv-2022"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "gptq-arxiv-2022",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "activation-quantization",
    headword: "Activation Quantization",
    aliases: ["activation-value quantization"],
    koreanEquivalents: ["활성값 양자화"],
    shortDefinitionKo: "추론 중 각 층에서 생기는 activation 값을 낮은 정밀도로 표현하는 양자화 방식입니다.",
    explanationKo:
      "Activation quantization은 가중치뿐 아니라 입력과 중간 feature 값을 낮은 비트로 표현해 메모리 이동과 정수 연산 비용을 줄입니다. 하지만 activation은 입력마다 분포가 달라 outlier와 범위 추정이 어렵기 때문에 calibration이나 smoothing 전략이 중요합니다. 가중치만 양자화하는 방식보다 하드웨어 이득이 클 수 있지만 정확도 유지가 더 까다롭습니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["post-training-quantization", "quantization-calibration", "mixed-precision-quantization"],
    paperRelations: [
      {
        paperId: "smoothquant-llm-post-training-quantization-2023",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 LLM의 활성값 outlier 부담을 가중치 쪽으로 이동시켜 activation quantization을 포함한 INT8 post-training quantization을 가능하게 했습니다.",
        sourceRefs: ["smoothquant-pmlr-2023"]
      }
    ],
    sourceRefs: ["smoothquant-pmlr-2023"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "smoothquant-pmlr-2023",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "integer-only-inference",
    headword: "Integer-Only Inference",
    aliases: ["integer-arithmetic-only inference"],
    koreanEquivalents: ["정수 전용 추론", "정수 산술 추론"],
    shortDefinitionKo: "핵심 추론 경로를 정수 산술 중심으로 실행하도록 모델과 연산을 구성하는 방식입니다.",
    explanationKo:
      "Integer-only inference는 양자화된 가중치와 activation을 사용해 덧셈·곱셈·누산 같은 핵심 연산을 정수 산술로 수행하도록 설계합니다. 모바일 CPU, DSP, NPU처럼 정수 연산이 빠르고 전력 효율적인 하드웨어에서 특히 중요합니다. 단순히 결과 타입이 정수라는 뜻이 아니라, 스케일 변환과 재양자화까지 포함한 핵심 추론 경로의 설계 문제입니다.",
    topicSlugs: ["model-quantization", "edge-ai"],
    relatedTermSlugs: ["neural-network-quantization", "quantization-aware-training", "on-device-inference"],
    paperRelations: [
      {
        paperId: "integer-arithmetic-only-inference-2018",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 활성값과 가중치를 정수 산술로 처리하는 추론 경로를 구현해 integer-only inference의 대표적 실용 공식을 제공합니다.",
        sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"]
      }
    ],
    sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "integer-only-quantization-cvf-2018",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "binary-neural-network",
    headword: "Binary Neural Network",
    acronym: "BNN",
    aliases: ["Binarized Neural Network"],
    koreanEquivalents: ["이진 신경망", "바이너리 신경망"],
    shortDefinitionKo: "가중치나 활성값을 주로 두 값으로 제한해 극단적으로 낮은 정밀도로 계산하는 신경망입니다.",
    explanationKo:
      "BNN은 가중치와 activation을 -1/+1 또는 0/1처럼 이진값으로 표현해 런타임 메모리와 연산 비용을 크게 줄이려는 모델입니다. 인용 논문은 추론뿐 아니라 학습 중 gradient 계산에서도 이진화된 가중치와 activation을 사용하는 방식을 다룹니다. 일반 INT8 양자화보다 훨씬 강한 제약을 두기 때문에 정확도 손실과 학습 안정성이 큰 쟁점이며, 모든 양자화 모델이 BNN인 것은 아닙니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["neural-network-quantization", "activation-quantization", "integer-only-inference"],
    paperRelations: [
      {
        paperId: "binarized-neural-networks-2016",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 가중치와 활성값을 이진화하는 신경망을 다뤄 binary neural network가 일반 양자화보다 훨씬 극단적인 저정밀도 표현임을 보여줍니다.",
        sourceRefs: ["bnn-neurips-2016"]
      }
    ],
    sourceRefs: ["bnn-neurips-2016"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "bnn-neurips-2016",
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
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    slug: "quantization-calibration",
    headword: "Quantization Calibration",
    aliases: ["calibration for quantization"],
    koreanEquivalents: ["양자화 보정", "양자화 캘리브레이션"],
    shortDefinitionKo: "대표 데이터로 activation 범위와 스케일 같은 양자화 파라미터를 맞추는 절차입니다.",
    explanationKo:
      "Quantization calibration은 PTQ에서 모델을 다시 학습하지 않고도 activation의 동적 범위, scale, clipping range 같은 양자화 통계를 정하기 위해 작은 보정 데이터셋을 사용합니다. calibration 데이터가 실제 입력 분포를 잘 대표하지 못하면 낮은 비트 추론의 정확도가 크게 떨어질 수 있습니다. 이는 모델 평가용 검증 세트와 목적이 다르며, 양자화 파라미터를 추정하기 위한 절차입니다.",
    topicSlugs: ["model-quantization"],
    relatedTermSlugs: ["post-training-quantization", "activation-quantization", "neural-network-quantization"],
    paperRelations: [
      {
        paperId: "accurate-ptq-small-calibration-sets-2021",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 작은 보정 데이터셋으로 양자화 파라미터를 맞추는 문제를 다뤄 quantization calibration의 역할을 분명히 보여줍니다.",
        sourceRefs: ["calibration-pmlr-2021"]
      }
    ],
    sourceRefs: ["calibration-pmlr-2021"],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "calibration-pmlr-2021",
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
          checkedAt: editorialDate
        }
      ]
    }
  }
] satisfies TermRecord[];
