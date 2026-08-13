import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompactDictionaryEntry } from "@/components/CompactDictionaryEntry";
import { EvidenceDisclosure } from "@/components/EvidenceDisclosure";
import { PaperRelationList } from "@/components/PaperRelationList";
import { TopicChip } from "@/components/TopicChip";
import {
  getFeaturedPapersForTopic,
  getPublishedRegistry,
  getTermTopics,
  getTopicTerms,
  makeContentLookups
} from "@/src/lib/ui/content";
import { createRouteMetadata } from "../../seo";

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getPublishedRegistry().topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getPublishedRegistry().topics.find((candidate) => candidate.slug === slug);

  if (!topic) {
    return createRouteMetadata({
      title: "PaperWords 주제 없음",
      description: "요청한 PaperWords 공개 주제를 찾을 수 없습니다.",
      path: `/topics/${slug}`,
      noIndex: true
    });
  }

  return createRouteMetadata({
    title: `${topic.labelEn} | PaperWords`,
    description: topic.descriptionKo,
    path: `/topics/${topic.slug}`
  });
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const registry = getPublishedRegistry();
  const lookups = makeContentLookups(registry);
  const topic = lookups.topicsBySlug.get(slug);

  if (!topic) {
    notFound();
  }

  const terms = getTopicTerms(topic.slug, registry);
  const featuredPapers = getFeaturedPapersForTopic(topic.slug, registry, lookups);

  return (
    <main className="page detail-grid" id="main-content">
      <article className="reading-column" aria-labelledby="topic-title">
        <header className="page-header">
          <p className="eyebrow">Topic</p>
          <h1 id="topic-title" lang="en">{topic.labelEn}</h1>
          <p className="topic-korean">{topic.labelKo}</p>
          <p>{topic.descriptionKo}</p>
          <TopicChip topic={topic} count={terms.length} href={null} />
        </header>

        <section aria-labelledby="topic-terms-title">
          <h2 className="section-title" id="topic-terms-title">
            공개 용어
          </h2>
          <div className="entry-stack">
            {terms.map((term) => (
              <CompactDictionaryEntry key={term.slug} term={term} topics={getTermTopics(term, lookups)} />
            ))}
          </div>
        </section>
      </article>

      <aside className="evidence-rail detail-rail" aria-label="주제 관련 논문">
        <EvidenceDisclosure meta={`${featuredPapers.length}편의 논문 관계`} title="주제 관련 논문">
          <PaperRelationList relations={featuredPapers} title="관계로 연결된 대표 논문" />
        </EvidenceDisclosure>
      </aside>
    </main>
  );
}
