import type { SourceRecord } from "@/src/lib/content";

import { editorialDate, reviewer, usagePolicy } from "./editorial";

export const sources = [
  {
    id: "transformer-neurips-2017",
    kind: "publisher",
    url: "https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html",
    title: "Attention Is All You Need",
    publisherOrVenue: "Neural Information Processing Systems",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "neural-architectures",
        fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"]
      },
      {
        recordId: "transformer",
        fields: [
          "headword",
          "aliases",
          "koreanEquivalents",
          "shortDefinitionKo",
          "explanationKo",
          "topicSlugs",
          "paperRelations",
          "sourceRefs"
        ]
      },
      {
        recordId: "attention-is-all-you-need-2017",
        fields: ["title", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "transformer-arxiv-2017",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/1706.03762",
    doi: "10.48550/arxiv.1706.03762",
    title: "[1706.03762] Attention Is All You Need",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "transformer",
        fields: ["headword", "aliases", "paperRelations"]
      },
      {
        recordId: "attention-is-all-you-need-2017",
        fields: ["title", "authors", "doi", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "rag-neurips-2020",
    kind: "publisher",
    url: "https://proceedings.neurips.cc/paper_files/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    publisherOrVenue: "Neural Information Processing Systems",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "information-retrieval",
        fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"]
      },
      {
        recordId: "transformer",
        fields: ["relatedTermSlugs"]
      },
      {
        recordId: "retrieval-augmented-generation",
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
        recordId: "rag-knowledge-intensive-nlp-2020",
        fields: ["title", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "rag-arxiv-2020",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/2005.11401",
    doi: "10.48550/arxiv.2005.11401",
    title: "[2005.11401] Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "retrieval-augmented-generation",
        fields: ["headword", "acronym", "aliases", "paperRelations"]
      },
      {
        recordId: "rag-knowledge-intensive-nlp-2020",
        fields: ["title", "authors", "venue", "doi", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "diffusion-neurips-2020",
    kind: "publisher",
    url: "https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html",
    title: "Denoising Diffusion Probabilistic Models",
    publisherOrVenue: "Neural Information Processing Systems",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "generative-modeling",
        fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"]
      },
      {
        recordId: "diffusion-model",
        fields: [
          "headword",
          "aliases",
          "koreanEquivalents",
          "shortDefinitionKo",
          "explanationKo",
          "topicSlugs",
          "paperRelations",
          "sourceRefs"
        ]
      },
      {
        recordId: "denoising-diffusion-probabilistic-models-2020",
        fields: ["title", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "diffusion-arxiv-2020",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/2006.11239",
    doi: "10.48550/arxiv.2006.11239",
    title: "[2006.11239] Denoising Diffusion Probabilistic Models",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "diffusion-model",
        fields: ["headword", "aliases", "paperRelations"]
      },
      {
        recordId: "denoising-diffusion-probabilistic-models-2020",
        fields: ["title", "authors", "doi", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "ptq-diffusion-cvf-2023",
    kind: "publisher",
    url: "https://openaccess.thecvf.com/content/CVPR2023/html/Shang_Post-Training_Quantization_on_Diffusion_Models_CVPR_2023_paper.html",
    title: "Post-Training Quantization on Diffusion Models",
    publisherOrVenue: "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "diffusion-model",
        fields: ["relatedTermSlugs", "paperRelations"]
      },
      {
        recordId: "post-training-quantization",
        fields: ["relatedTermSlugs", "paperRelations"]
      },
      {
        recordId: "post-training-quantization-diffusion-models-2023",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "edge-computing-ieee-2016",
    kind: "publisher",
    url: "https://ieeexplore.ieee.org/document/7488250",
    doi: "10.1109/jiot.2016.2579198",
    title: "Edge Computing: Vision and Challenges",
    publisherOrVenue: "IEEE Internet of Things Journal",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "edge-computing",
        fields: [
          "labelEn",
          "labelKo",
          "descriptionKo",
          "sourceRefs",
          "headword",
          "aliases",
          "koreanEquivalents",
          "shortDefinitionKo",
          "explanationKo",
          "topicSlugs",
          "relatedTermSlugs",
          "paperRelations"
        ]
      },
      {
        recordId: "edge-computing-vision-and-challenges-2016",
        fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "edge-intelligence-ieee-2019",
    kind: "publisher",
    url: "https://ieeexplore.ieee.org/document/8736011/",
    doi: "10.1109/jproc.2019.2918951",
    title: "Edge Intelligence: Paving the Last Mile of Artificial Intelligence With Edge Computing",
    publisherOrVenue: "Proceedings of the IEEE",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "edge-ai",
        fields: [
          "labelEn",
          "labelKo",
          "descriptionKo",
          "sourceRefs",
          "aliases",
          "koreanEquivalents",
          "shortDefinitionKo",
          "explanationKo",
          "topicSlugs",
          "relatedTermSlugs",
          "paperRelations"
        ]
      },
      {
        recordId: "edge-intelligence-last-mile-ai-edge-computing-2019",
        fields: ["title", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "edge-intelligence-arxiv-2019",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/1905.10083",
    doi: "10.48550/arxiv.1905.10083",
    title: "[1905.10083] Edge Intelligence: Paving the Last Mile of Artificial Intelligence With Edge Computing",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "edge-ai",
        fields: ["headword", "aliases", "paperRelations"]
      },
      {
        recordId: "edge-intelligence-last-mile-ai-edge-computing-2019",
        fields: ["title", "authors", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "mec-etsi-official",
    kind: "official-documentation",
    url: "https://www.etsi.org/technologies/ict-infrastructure-operations/",
    title: "Multi-access Edge Computing",
    publisherOrVenue: "ETSI",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "multi-access-edge-computing",
        fields: ["headword", "acronym", "koreanEquivalents", "shortDefinitionKo", "topicSlugs", "sourceRefs"]
      }
    ]
  },
  {
    id: "mec-ieee-2017",
    kind: "publisher",
    url: "https://ieeexplore.ieee.org/document/8016573/",
    doi: "10.1109/comst.2017.2745201",
    title: "A Survey on Mobile Edge Computing: The Communication Perspective",
    publisherOrVenue: "IEEE Communications Surveys & Tutorials",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "multi-access-edge-computing",
        fields: ["aliases", "explanationKo", "relatedTermSlugs", "paperRelations"]
      },
      {
        recordId: "mobile-edge-computing-communication-perspective-2017",
        fields: ["title", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "mec-arxiv-2017",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/1701.01090",
    doi: "10.48550/arxiv.1701.01090",
    title: "[1701.01090] A Survey on Mobile Edge Computing: The Communication Perspective",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "mobile-edge-computing-communication-perspective-2017",
        fields: ["title", "authors", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "fog-computing-acm-2012",
    kind: "publisher",
    url: "https://dl.acm.org/doi/10.1145/2342509.2342513",
    doi: "10.1145/2342509.2342513",
    title: "Fog Computing and Its Role in the Internet of Things",
    publisherOrVenue: "Proceedings of the First Edition of the MCC Workshop on Mobile Cloud Computing",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "fog-computing",
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
        recordId: "fog-computing-role-internet-of-things-2012",
        fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "cloudlet-doi-2009",
    kind: "doi-registry",
    url: "https://doi.org/10.1109/MPRV.2009.82",
    doi: "10.1109/mprv.2009.82",
    title: "The Case for VM-Based Cloudlets in Mobile Computing",
    publisherOrVenue: "IEEE Pervasive Computing",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "cloudlet",
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
        recordId: "vm-based-cloudlets-mobile-computing-2009",
        fields: ["title", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "cloudlet-microsoft-research-2009",
    kind: "official-documentation",
    url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/cloudlets09.pdf",
    title: "The Case for VM-Based Cloudlets in Mobile Computing",
    publisherOrVenue: "Microsoft Research",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "vm-based-cloudlets-mobile-computing-2009",
        fields: ["authors", "metadataSources"]
      }
    ]
  },
  {
    id: "maui-acm-2010",
    kind: "publisher",
    url: "https://dl.acm.org/doi/10.1145/1814433.1814441",
    doi: "10.1145/1814433.1814441",
    title: "MAUI: Making Smartphones Last Longer with Code Offload",
    publisherOrVenue: "MobiSys 2010",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "computation-offloading",
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
        recordId: "maui-code-offload-2010",
        fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "federated-learning-pmlr-2017",
    kind: "publisher",
    url: "https://proceedings.mlr.press/v54/mcmahan17a.html",
    title: "Communication-Efficient Learning of Deep Networks from Decentralized Data",
    publisherOrVenue: "Proceedings of Machine Learning Research",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "federated-learning",
        fields: [
          "headword",
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
        recordId: "communication-efficient-learning-decentralized-data-2017",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "mcunet-neurips-2020",
    kind: "publisher",
    url: "https://proceedings.neurips.cc/paper_files/paper/2020/hash/86c51678350f656dcc7f490a43946ee5-Abstract.html",
    title: "MCUNet: Tiny Deep Learning on IoT Devices",
    publisherOrVenue: "Neural Information Processing Systems",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "on-device-inference",
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
        recordId: "mcunet-tiny-deep-learning-iot-devices-2020",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "integer-only-quantization-cvf-2018",
    kind: "publisher",
    url: "https://openaccess.thecvf.com/content_cvpr_2018/html/Jacob_Quantization_and_Training_CVPR_2018_paper.html",
    title: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference",
    publisherOrVenue: "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "model-quantization",
        fields: ["labelEn", "labelKo", "descriptionKo", "sourceRefs"]
      },
      {
        recordId: "neural-network-quantization",
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
        recordId: "quantization-aware-training",
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
        recordId: "integer-only-inference",
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
        recordId: "integer-arithmetic-only-inference-2018",
        fields: ["title", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "integer-only-quantization-arxiv-2017",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/1712.05877",
    doi: "10.48550/arxiv.1712.05877",
    title: "[1712.05877] Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "integer-arithmetic-only-inference-2018",
        fields: ["title", "authors", "doi", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "adaround-pmlr-2020",
    kind: "publisher",
    url: "https://proceedings.mlr.press/v119/nagel20a.html",
    title: "Up or Down? Adaptive Rounding for Post-Training Quantization",
    publisherOrVenue: "Proceedings of Machine Learning Research",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "post-training-quantization",
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
        recordId: "adaptive-rounding-post-training-quantization-2020",
        fields: ["title", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "adaround-arxiv-2020",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/2004.10568",
    doi: "10.48550/arxiv.2004.10568",
    title: "[2004.10568] Up or Down? Adaptive Rounding for Post-Training Quantization",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "adaptive-rounding-post-training-quantization-2020",
        fields: ["title", "authors", "doi", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "calibration-pmlr-2021",
    kind: "publisher",
    url: "https://proceedings.mlr.press/v139/hubara21a.html",
    title: "Accurate Post Training Quantization With Small Calibration Sets",
    publisherOrVenue: "Proceedings of Machine Learning Research",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "post-training-quantization",
        fields: ["explanationKo", "sourceRefs"]
      },
      {
        recordId: "quantization-calibration",
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
        recordId: "accurate-ptq-small-calibration-sets-2021",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "hawq-cvf-2019",
    kind: "publisher",
    url: "https://openaccess.thecvf.com/content_ICCV_2019/html/Dong_HAWQ_Hessian_AWare_Quantization_of_Neural_Networks_With_Mixed-Precision_ICCV_2019_paper.html",
    title: "HAWQ: Hessian AWare Quantization of Neural Networks With Mixed-Precision",
    publisherOrVenue: "IEEE/CVF International Conference on Computer Vision",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "mixed-precision-quantization",
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
        recordId: "hawq-mixed-precision-quantization-2019",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "gptq-arxiv-2022",
    kind: "preprint-repository",
    url: "https://arxiv.org/abs/2210.17323",
    doi: "10.48550/arxiv.2210.17323",
    title: "[2210.17323] GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",
    publisherOrVenue: "arXiv",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "weight-only-quantization",
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
        recordId: "gptq-post-training-quantization-transformers-2022",
        fields: ["title", "authors", "venue", "year", "doi", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "smoothquant-pmlr-2023",
    kind: "publisher",
    url: "https://proceedings.mlr.press/v202/xiao23c.html",
    title: "SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models",
    publisherOrVenue: "Proceedings of Machine Learning Research",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "activation-quantization",
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
        recordId: "smoothquant-llm-post-training-quantization-2023",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  },
  {
    id: "bnn-neurips-2016",
    kind: "publisher",
    url: "https://proceedings.neurips.cc/paper_files/paper/2016/hash/d8330f857a17c53d217014ee776bfd50-Abstract.html",
    title: "Binarized Neural Networks",
    publisherOrVenue: "Neural Information Processing Systems",
    retrievedAt: editorialDate,
    verifiedAt: editorialDate,
    reviewer,
    usagePolicy,
    publicationState: "published",
    verifies: [
      {
        recordId: "binary-neural-network",
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
        recordId: "binarized-neural-networks-2016",
        fields: ["title", "authors", "venue", "year", "url", "metadataSources", "relations"]
      }
    ]
  }
] satisfies SourceRecord[];
