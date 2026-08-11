import type { Metadata } from "next";
import Link from "next/link";
import { CompactDictionaryEntry } from "@/components/CompactDictionaryEntry";
import { TopicChip } from "@/components/TopicChip";
import {
  getPublishedRegistry,
  getTermTopics,
  getTopicTerms,
  getTopicTone,
  makeContentLookups
} from "@/src/lib/ui/content";
import { topicHref } from "@/src/lib/ui/routes";
import { createRouteMetadata } from "../seo";

export const metadata: Metadata = createRouteMetadata({
  title: "PaperWords Topics",
  description: "공개 검증된 주제별 논문 용어 묶음을 탐색합니다.",
  path: "/topics"
});

export default function TopicsPage() {
  const registry = getPublishedRegistry();
  const lookups = makeContentLookups(registry);

  return (
    <main className="page" id="main-content">
      <header className="page-header">
        <p className="eyebrow">Topics</p>
        <h1>논문 용어 주제</h1>
        <p>공개 상태로 검증된 주제만 표시합니다. 엣지 계열과 양자화 계열은 관계 rail 색으로 구분됩니다.</p>
      </header>

      <section className="topic-index" aria-label="주제 목록">
        {registry.topics.map((topic) => {
          const terms = getTopicTerms(topic.slug, registry);
          const representativeTerms = terms.slice(0, 3);

          return (
            <article className="topic-summary" data-tone={getTopicTone(topic.slug)} key={topic.slug}>
              <div className="section-heading-row">
                <TopicChip topic={topic} count={terms.length} />
                <Link className="text-link" href={topicHref(topic.slug)}>
                  주제 열기
                </Link>
              </div>
              <p>{topic.descriptionKo}</p>
              <div className="entry-stack entry-stack--compact">
                {representativeTerms.map((term) => (
                  <CompactDictionaryEntry
                    key={term.slug}
                    meta="대표 용어"
                    term={term}
                    topics={getTermTopics(term, lookups)}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
