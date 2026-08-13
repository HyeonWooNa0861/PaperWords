import Link from "next/link";
import type { PublishedContentRegistry, TermRecord } from "@/src/lib/content";
import {
  getFeaturedPapersForTopic,
  getRelatedTerms,
  getTermTopics,
  getTopicTerms,
  makeContentLookups
} from "@/src/lib/ui/content";
import { termHref, topicHref } from "@/src/lib/ui/routes";
import { CompactDictionaryEntry } from "./CompactDictionaryEntry";
import { TopicChip } from "./TopicChip";

interface HomeDiscoveryProps {
  registry: PublishedContentRegistry;
  todayTerm?: TermRecord;
}

const focusTopicSlugs = ["edge-computing", "model-quantization"] as const;

export function HomeDiscovery({ registry, todayTerm }: HomeDiscoveryProps) {
  const lookups = makeContentLookups(registry);
  const relatedTerms = todayTerm ? getRelatedTerms(todayTerm, lookups).slice(0, 3) : [];
  const focusTopics = focusTopicSlugs
    .map((slug) => {
      const topic = lookups.topicsBySlug.get(slug);
      if (!topic) {
        return undefined;
      }

      const terms = getTopicTerms(topic.slug, registry);
      const featuredPapers = getFeaturedPapersForTopic(topic.slug, registry, lookups);

      return {
        topic,
        terms,
        featuredPapers
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <section className="home-discovery" aria-labelledby="home-discovery-title">
      <div className="section-kicker">
        <p className="eyebrow">Research Desk</p>
        <h2 className="section-title" id="home-discovery-title">
          오늘 읽은 개념에서 바로 이어가기
        </h2>
      </div>

      {relatedTerms.length > 0 ? (
        <section
          className="home-discovery__section home-discovery__section--related"
          aria-labelledby="home-related-title"
        >
          <div className="home-discovery__section-head">
            <h3 className="section-title section-title--small" id="home-related-title">
              이어 읽기
            </h3>
            <p>오늘의 용어와 검증된 관계가 있는 항목입니다.</p>
          </div>
          <div className="entry-stack home-discovery__related-list">
            {relatedTerms.map((term) => (
              <CompactDictionaryEntry
                key={term.slug}
                term={term}
                topics={getTermTopics(term, lookups)}
                meta="오늘의 용어와 연결"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="home-discovery__section home-discovery__section--focus" aria-labelledby="home-focus-title">
        <div className="home-discovery__section-head">
          <h3 className="section-title section-title--small" id="home-focus-title">
            집중 탐색 분야
          </h3>
          <p>엣지 컴퓨팅과 모델 양자화를 깊이 탐색하는 두 분야입니다.</p>
        </div>
        <div className="home-discovery__topic-grid">
          {focusTopics.map(({ topic, terms, featuredPapers }) => (
            <article className="topic-summary home-discovery__topic-card" key={topic.slug}>
              <div className="home-discovery__topic-topline">
                <TopicChip topic={topic} count={terms.length} />
                <span>{featuredPapers.length}개 논문 관계</span>
              </div>
              <h4>
                <Link className="text-link" href={topicHref(topic.slug)}>
                  <span lang="en">{topic.labelEn}</span>
                </Link>
              </h4>
              <p>{topic.descriptionKo}</p>
              <ul className="home-discovery__term-links" aria-label={`${topic.labelKo} 대표 용어`}>
                {terms.slice(0, 3).map((term) => (
                  <li key={term.slug}>
                    <Link href={termHref(term.slug)}>
                      <span lang="en">{term.headword}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
