import type { PaperRecord } from "@/src/lib/content";

import { editorialDate, reviewer } from "./editorial";

export const papers = [
  {
    id: "attention-is-all-you-need-2017",
    title: "Attention Is All You Need",
    authors: [
      { name: "Ashish Vaswani" },
      { name: "Noam Shazeer" },
      { name: "Niki Parmar" },
      { name: "Jakob Uszkoreit" },
      { name: "Llion Jones" },
      { name: "Aidan N. Gomez" },
      { name: "Lukasz Kaiser" },
      { name: "Illia Polosukhin" }
    ],
    venue: "Advances in Neural Information Processing Systems 30 (NIPS 2017)",
    year: 2017,
    doi: "10.48550/arxiv.1706.03762",
    url: "https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html",
    metadataSources: ["transformer-neurips-2017", "transformer-arxiv-2017"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "transformer",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 순환 또는 합성곱 시퀀스 층 없이 어텐션을 중심으로 구성된 Transformer 구조를 소개했습니다.",
        sourceRefs: ["transformer-neurips-2017", "transformer-arxiv-2017"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "transformer-neurips-2017",
          fields: ["title", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "transformer-arxiv-2017",
          fields: ["title", "authors", "doi", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "rag-knowledge-intensive-nlp-2020",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    authors: [
      { name: "Patrick Lewis" },
      { name: "Ethan Perez" },
      { name: "Aleksandra Piktus" },
      { name: "Fabio Petroni" },
      { name: "Vladimir Karpukhin" },
      { name: "Naman Goyal" },
      { name: "Heinrich Küttler" },
      { name: "Mike Lewis" },
      { name: "Wen-tau Yih" },
      { name: "Tim Rocktäschel" },
      { name: "Sebastian Riedel" },
      { name: "Douwe Kiela" }
    ],
    venue: "Advances in Neural Information Processing Systems 33 (NeurIPS 2020)",
    year: 2020,
    doi: "10.48550/arxiv.2005.11401",
    url: "https://proceedings.neurips.cc/paper_files/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html",
    metadataSources: ["rag-neurips-2020", "rag-arxiv-2020"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "retrieval-augmented-generation",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 RAG라는 이름을 공식화하고 지식 집약 NLP 과제를 위해 사전학습된 시퀀스 생성기와 검색된 비파라미터 메모리를 결합했습니다.",
        sourceRefs: ["rag-neurips-2020", "rag-arxiv-2020"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "rag-neurips-2020",
          fields: ["title", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "rag-arxiv-2020",
          fields: ["title", "authors", "venue", "doi", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "denoising-diffusion-probabilistic-models-2020",
    title: "Denoising Diffusion Probabilistic Models",
    authors: [{ name: "Jonathan Ho" }, { name: "Ajay Jain" }, { name: "Pieter Abbeel" }],
    venue: "Advances in Neural Information Processing Systems 33 (NeurIPS 2020)",
    year: 2020,
    doi: "10.48550/arxiv.2006.11239",
    url: "https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html",
    metadataSources: ["diffusion-neurips-2020", "diffusion-arxiv-2020"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "diffusion-model",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 denoising diffusion probabilistic model로 고품질 생성을 보였고 그 공식을 denoising score matching과 연결했습니다.",
        sourceRefs: ["diffusion-neurips-2020", "diffusion-arxiv-2020"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "diffusion-neurips-2020",
          fields: ["title", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "diffusion-arxiv-2020",
          fields: ["title", "authors", "doi", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "post-training-quantization-diffusion-models-2023",
    title: "Post-Training Quantization on Diffusion Models",
    authors: [
      { name: "Yuzhang Shang" },
      { name: "Zhihang Yuan" },
      { name: "Bin Xie" },
      { name: "Bingzhe Wu" },
      { name: "Yan Yan" }
    ],
    venue: "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2023), pages 1972-1981",
    year: 2023,
    url: "https://openaccess.thecvf.com/content/CVPR2023/html/Shang_Post-Training_Quantization_on_Diffusion_Models_CVPR_2023_paper.html",
    metadataSources: ["ptq-diffusion-cvf-2023"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "diffusion-model",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 학습이 끝난 diffusion model에 post-training quantization을 적용해 생성 모델에서도 배포 전 양자화가 다뤄지는 실제 맥락을 보여줍니다.",
        sourceRefs: ["ptq-diffusion-cvf-2023"]
      },
      {
        termSlug: "post-training-quantization",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 diffusion model을 학습 후 다시 크게 훈련하지 않고 양자화하는 사례를 통해 post-training quantization의 배포 맥락을 보여줍니다.",
        sourceRefs: ["ptq-diffusion-cvf-2023"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "ptq-diffusion-cvf-2023",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "edge-computing-vision-and-challenges-2016",
    title: "Edge Computing: Vision and Challenges",
    authors: [
      { name: "Weisong Shi" },
      { name: "Jie Cao" },
      { name: "Quan Zhang" },
      { name: "Youhuizi Li" },
      { name: "Lanyu Xu" }
    ],
    venue: "IEEE Internet of Things Journal 3(5):637-646",
    year: 2016,
    doi: "10.1109/jiot.2016.2579198",
    url: "https://ieeexplore.ieee.org/document/7488250",
    metadataSources: ["edge-computing-ieee-2016"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "edge-computing",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 클라우드 중심 구조의 한계를 짚고 네트워크 가장자리에서 데이터 처리와 서비스를 수행하는 edge computing의 비전과 과제를 정리했습니다.",
        sourceRefs: ["edge-computing-ieee-2016"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "edge-computing-ieee-2016",
          fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "edge-intelligence-last-mile-ai-edge-computing-2019",
    title: "Edge Intelligence: Paving the Last Mile of Artificial Intelligence With Edge Computing",
    authors: [
      { name: "Zhi Zhou" },
      { name: "Xu Chen" },
      { name: "En Li" },
      { name: "Liekang Zeng" },
      { name: "Ke Luo" },
      { name: "Junshan Zhang" }
    ],
    venue: "Proceedings of the IEEE 107(8):1738-1762",
    year: 2019,
    doi: "10.1109/jproc.2019.2918951",
    url: "https://ieeexplore.ieee.org/document/8736011/",
    metadataSources: ["edge-intelligence-ieee-2019", "edge-intelligence-arxiv-2019"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "edge-ai",
        relationType: "survey",
        relevanceRationaleKo:
          "이 논문은 AI 서비스를 엣지 컴퓨팅과 결합해 지연, 대역폭, 개인정보 요구를 다루는 Edge Intelligence 연구 지형을 체계화했습니다.",
        sourceRefs: ["edge-intelligence-ieee-2019", "edge-intelligence-arxiv-2019"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "edge-intelligence-ieee-2019",
          fields: ["title", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "edge-intelligence-arxiv-2019",
          fields: ["title", "authors", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "mobile-edge-computing-communication-perspective-2017",
    title: "A Survey on Mobile Edge Computing: The Communication Perspective",
    authors: [
      { name: "Yuyi Mao" },
      { name: "Changsheng You" },
      { name: "Jun Zhang" },
      { name: "Kaibin Huang" },
      { name: "Khaled B. Letaief" }
    ],
    venue: "IEEE Communications Surveys & Tutorials 19(4):2322-2358",
    year: 2017,
    doi: "10.1109/comst.2017.2745201",
    url: "https://ieeexplore.ieee.org/document/8016573/",
    metadataSources: ["mec-ieee-2017", "mec-arxiv-2017"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "multi-access-edge-computing",
        relationType: "survey",
        relevanceRationaleKo:
          "이 설문은 모바일/멀티액세스 엣지 컴퓨팅을 통신 관점에서 정리해 무선 접속망 가까이 배치되는 연산 자원의 역할을 설명했습니다.",
        sourceRefs: ["mec-ieee-2017", "mec-arxiv-2017"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "mec-ieee-2017",
          fields: ["title", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "mec-arxiv-2017",
          fields: ["title", "authors", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "fog-computing-role-internet-of-things-2012",
    title: "Fog Computing and Its Role in the Internet of Things",
    authors: [
      { name: "Flavio Bonomi" },
      { name: "Rodolfo Milito" },
      { name: "Jiang Zhu" },
      { name: "Sateesh Addepalli" }
    ],
    venue: "Proceedings of the First Edition of the MCC Workshop on Mobile Cloud Computing, pages 13-16",
    year: 2012,
    doi: "10.1145/2342509.2342513",
    url: "https://dl.acm.org/doi/10.1145/2342509.2342513",
    metadataSources: ["fog-computing-acm-2012"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "fog-computing",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 클라우드와 사물 사이의 중간 계층으로 fog computing을 제안해 IoT 지연과 위치 인식 요구를 다루는 구조를 제시했습니다.",
        sourceRefs: ["fog-computing-acm-2012"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "fog-computing-acm-2012",
          fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "vm-based-cloudlets-mobile-computing-2009",
    title: "The Case for VM-Based Cloudlets in Mobile Computing",
    authors: [
      { name: "Mahadev Satyanarayanan" },
      { name: "Paramvir Bahl" },
      { name: "Ramon Caceres" },
      { name: "Nigel Davies" }
    ],
    venue: "IEEE Pervasive Computing 8(4)",
    year: 2009,
    doi: "10.1109/mprv.2009.82",
    url: "https://doi.org/10.1109/MPRV.2009.82",
    metadataSources: ["cloudlet-doi-2009", "cloudlet-microsoft-research-2009"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "cloudlet",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 모바일 단말 가까이에 VM 기반 cloudlet을 두어 지연을 줄이고 계산 집약 작업을 보조하는 구조를 제안했습니다.",
        sourceRefs: ["cloudlet-doi-2009"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "cloudlet-doi-2009",
          fields: ["title", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "cloudlet-microsoft-research-2009",
          fields: ["authors", "metadataSources"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "maui-code-offload-2010",
    title: "MAUI: Making Smartphones Last Longer with Code Offload",
    authors: [
      { name: "Eduardo Cuervo" },
      { name: "Aruna Balasubramanian" },
      { name: "Dae-ki Cho" },
      { name: "Alec Wolman" },
      { name: "Stefan Saroiu" },
      { name: "Ranveer Chandra" },
      { name: "Paramvir Bahl" }
    ],
    venue: "MobiSys 2010",
    year: 2010,
    doi: "10.1145/1814433.1814441",
    url: "https://dl.acm.org/doi/10.1145/1814433.1814441",
    metadataSources: ["maui-acm-2010"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "computation-offloading",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 스마트폰 코드 일부를 주변 인프라로 옮겨 실행하는 MAUI 시스템을 통해 computation offloading의 에너지 이득과 제약을 보여줬습니다.",
        sourceRefs: ["maui-acm-2010"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "maui-acm-2010",
          fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "communication-efficient-learning-decentralized-data-2017",
    title: "Communication-Efficient Learning of Deep Networks from Decentralized Data",
    authors: [
      { name: "Brendan McMahan" },
      { name: "Eider Moore" },
      { name: "Daniel Ramage" },
      { name: "Seth Hampson" },
      { name: "Blaise Aguera y Arcas" }
    ],
    venue: "Proceedings of Machine Learning Research 54:1273-1282 (AISTATS 2017)",
    year: 2017,
    url: "https://proceedings.mlr.press/v54/mcmahan17a.html",
    metadataSources: ["federated-learning-pmlr-2017"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "federated-learning",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 분산 단말의 데이터를 중앙으로 모으지 않고 모델 갱신을 집계하는 Federated Averaging 접근을 제시했습니다.",
        sourceRefs: ["federated-learning-pmlr-2017"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "federated-learning-pmlr-2017",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "mcunet-tiny-deep-learning-iot-devices-2020",
    title: "MCUNet: Tiny Deep Learning on IoT Devices",
    authors: [
      { name: "Ji Lin" },
      { name: "Wei-Ming Chen" },
      { name: "Yujun Lin" },
      { name: "john cohn" },
      { name: "Chuang Gan" },
      { name: "Song Han" }
    ],
    venue: "Advances in Neural Information Processing Systems 33 (NeurIPS 2020)",
    year: 2020,
    url: "https://proceedings.neurips.cc/paper_files/paper/2020/hash/86c51678350f656dcc7f490a43946ee5-Abstract.html",
    metadataSources: ["mcunet-neurips-2020"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "on-device-inference",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 마이크로컨트롤러급 IoT 장치에서 신경망 추론을 가능하게 하는 모델-시스템 공동 설계를 보여줬습니다.",
        sourceRefs: ["mcunet-neurips-2020"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "mcunet-neurips-2020",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "integer-arithmetic-only-inference-2018",
    title: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference",
    authors: [
      { name: "Benoit Jacob" },
      { name: "Skirmantas Kligys" },
      { name: "Bo Chen" },
      { name: "Menglong Zhu" },
      { name: "Matthew Tang" },
      { name: "Andrew Howard" },
      { name: "Hartwig Adam" },
      { name: "Dmitry Kalenichenko" }
    ],
    venue: "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2018)",
    year: 2018,
    doi: "10.48550/arxiv.1712.05877",
    url: "https://openaccess.thecvf.com/content_cvpr_2018/html/Jacob_Quantization_and_Training_CVPR_2018_paper.html",
    metadataSources: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "neural-network-quantization",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 신경망 학습과 추론을 정수 연산 친화적으로 양자화하는 실용적 방법을 제시해 모델 양자화의 핵심 절차를 보여줬습니다.",
        sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"]
      },
      {
        termSlug: "quantization-aware-training",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 학습 중 양자화 효과를 모사해 정수 추론에 맞춘 모델을 만드는 대표적인 실용 절차를 제시했습니다.",
        sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"]
      },
      {
        termSlug: "integer-only-inference",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 활성값과 가중치를 정수 산술로 처리하는 추론 경로를 구현해 integer-only inference의 대표적 실용 공식을 제공합니다.",
        sourceRefs: ["integer-only-quantization-cvf-2018", "integer-only-quantization-arxiv-2017"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "integer-only-quantization-cvf-2018",
          fields: ["title", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "integer-only-quantization-arxiv-2017",
          fields: ["title", "authors", "doi", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "adaptive-rounding-post-training-quantization-2020",
    title: "Up or Down? Adaptive Rounding for Post-Training Quantization",
    authors: [
      { name: "Markus Nagel" },
      { name: "Rana Ali Amjad" },
      { name: "Mart van Baalen" },
      { name: "Christos Louizos" },
      { name: "Tijmen Blankevoort" }
    ],
    venue: "Proceedings of Machine Learning Research 119 (ICML 2020)",
    year: 2020,
    doi: "10.48550/arxiv.2004.10568",
    url: "https://proceedings.mlr.press/v119/nagel20a.html",
    metadataSources: ["adaround-pmlr-2020", "adaround-arxiv-2020"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "post-training-quantization",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 학습이 끝난 모델의 가중치 반올림 결정을 최적화해 post-training quantization 정확도 손실을 줄이는 방법을 제시했습니다.",
        sourceRefs: ["adaround-pmlr-2020", "adaround-arxiv-2020"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "adaround-pmlr-2020",
          fields: ["title", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        },
        {
          sourceId: "adaround-arxiv-2020",
          fields: ["title", "authors", "doi", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "accurate-ptq-small-calibration-sets-2021",
    title: "Accurate Post Training Quantization With Small Calibration Sets",
    authors: [
      { name: "Itay Hubara" },
      { name: "Yury Nahshan" },
      { name: "Yair Hanani" },
      { name: "Ron Banner" },
      { name: "Daniel Soudry" }
    ],
    venue: "Proceedings of Machine Learning Research 139:4466-4475 (ICML 2021)",
    year: 2021,
    url: "https://proceedings.mlr.press/v139/hubara21a.html",
    metadataSources: ["calibration-pmlr-2021"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "quantization-calibration",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 작은 보정 데이터셋으로 양자화 파라미터를 맞추는 문제를 다뤄 quantization calibration의 역할을 분명히 보여줍니다.",
        sourceRefs: ["calibration-pmlr-2021"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "calibration-pmlr-2021",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "hawq-mixed-precision-quantization-2019",
    title: "HAWQ: Hessian AWare Quantization of Neural Networks With Mixed-Precision",
    authors: [
      { name: "Zhen Dong" },
      { name: "Zhewei Yao" },
      { name: "Amir Gholami" },
      { name: "Michael W. Mahoney" },
      { name: "Kurt Keutzer" }
    ],
    venue: "IEEE/CVF International Conference on Computer Vision (ICCV 2019)",
    year: 2019,
    url: "https://openaccess.thecvf.com/content_ICCV_2019/html/Dong_HAWQ_Hessian_AWare_Quantization_of_Neural_Networks_With_Mixed-Precision_ICCV_2019_paper.html",
    metadataSources: ["hawq-cvf-2019"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "mixed-precision-quantization",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 Hessian 정보를 이용해 계층별 민감도를 반영하는 mixed-precision quantization 배치를 제안했습니다.",
        sourceRefs: ["hawq-cvf-2019"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "hawq-cvf-2019",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "gptq-post-training-quantization-transformers-2022",
    title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",
    authors: [
      { name: "Elias Frantar" },
      { name: "Saleh Ashkboos" },
      { name: "Torsten Hoefler" },
      { name: "Dan Alistarh" }
    ],
    venue: "International Conference on Learning Representations (ICLR 2023)",
    year: 2023,
    doi: "10.48550/arxiv.2210.17323",
    url: "https://arxiv.org/abs/2210.17323",
    metadataSources: ["gptq-arxiv-2022"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "weight-only-quantization",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 대규모 Transformer 계열 모델을 대상으로 가중치만 양자화하는 post-training 방법을 제시해 weight-only quantization의 대표 사례가 됐습니다.",
        sourceRefs: ["gptq-arxiv-2022"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "gptq-arxiv-2022",
          fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "smoothquant-llm-post-training-quantization-2023",
    title: "SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models",
    authors: [
      { name: "Guangxuan Xiao" },
      { name: "Ji Lin" },
      { name: "Mickael Seznec" },
      { name: "Hao Wu" },
      { name: "Julien Demouth" },
      { name: "Song Han" }
    ],
    venue: "Proceedings of Machine Learning Research 202:38087-38099 (ICML 2023)",
    year: 2023,
    url: "https://proceedings.mlr.press/v202/xiao23c.html",
    metadataSources: ["smoothquant-pmlr-2023"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "activation-quantization",
        relationType: "application",
        relevanceRationaleKo:
          "이 논문은 LLM의 활성값 outlier 부담을 가중치 쪽으로 이동시켜 activation quantization을 포함한 INT8 post-training quantization을 가능하게 했습니다.",
        sourceRefs: ["smoothquant-pmlr-2023"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "smoothquant-pmlr-2023",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  },
  {
    id: "binarized-neural-networks-2016",
    title: "Binarized Neural Networks",
    authors: [
      { name: "Itay Hubara" },
      { name: "Matthieu Courbariaux" },
      { name: "Daniel Soudry" },
      { name: "Ran El-Yaniv" },
      { name: "Yoshua Bengio" }
    ],
    venue: "Advances in Neural Information Processing Systems 29 (NIPS 2016)",
    year: 2016,
    url: "https://proceedings.neurips.cc/paper_files/paper/2016/hash/d8330f857a17c53d217014ee776bfd50-Abstract.html",
    metadataSources: ["bnn-neurips-2016"],
    abstractStatus: "not_copied",
    relations: [
      {
        termSlug: "binary-neural-network",
        relationType: "seminal",
        relevanceRationaleKo:
          "이 논문은 가중치와 활성값을 이진화하는 신경망을 다뤄 binary neural network가 일반 양자화보다 훨씬 극단적인 저정밀도 표현임을 보여줍니다.",
        sourceRefs: ["bnn-neurips-2016"]
      }
    ],
    publicationState: "published",
    verification: {
      reviewer,
      verifiedAt: editorialDate,
      sourceChecks: [
        {
          sourceId: "bnn-neurips-2016",
          fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"],
          checkedAt: editorialDate
        }
      ]
    }
  }
] satisfies PaperRecord[];
