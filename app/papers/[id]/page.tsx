import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SourceStampList } from "@/components/SourceStampList";
import { TopicChip } from "@/components/TopicChip";
import {
  getPublishedRegistry,
  getSources,
  getTermTopics,
  makeContentLookups
} from "@/src/lib/ui/content";
import { formatAuthors, relationTypeLabelKo } from "@/src/lib/ui/format";
import { termHref } from "@/src/lib/ui/routes";
import { createPaperJsonLd, createRouteMetadata } from "../../seo";

interface PaperPageProps {
  params: Promise<{
    id: string;
  }>;
}

export function generateStaticParams() {
  return getPublishedRegistry().papers.map((paper) => ({ id: paper.id }));
}

export async function generateMetadata({ params }: PaperPageProps): Promise<Metadata> {
  const { id } = await params;
  const paper = getPublishedRegistry().papers.find((candidate) => candidate.id === id);

  if (!paper) {
    return createRouteMetadata({
      title: "PaperWords 논문 없음",
      description: "요청한 PaperWords 공개 논문 관계를 찾을 수 없습니다.",
      path: `/papers/${id}`,
      noIndex: true
    });
  }

  return createRouteMetadata({
    title: `${paper.title} | PaperWords`,
    description: `${paper.year} ${paper.venue} 관계 논문 메타데이터`,
    path: `/papers/${paper.id}`
  });
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { id } = await params;
  const registry = getPublishedRegistry();
  const lookups = makeContentLookups(registry);
  const paper = lookups.papersById.get(id);

  if (!paper) {
    notFound();
  }

  const sources = getSources(
    [...paper.metadataSources, ...paper.relations.flatMap((relation) => relation.sourceRefs)],
    lookups
  );

  return (
    <main className="page detail-grid" id="main-content">
      <JsonLd data={createPaperJsonLd(paper)} />
      <article className="reading-column" aria-labelledby="paper-title">
        <header className="paper-header relation-rail" data-tone="foundation">
          <p className="eyebrow">관계 전용 논문 상세</p>
          <h1 id="paper-title" lang="en">{paper.title}</h1>
          <p className="paper-meta" lang="en">
            {formatAuthors(paper.authors)} · {paper.venue} · {paper.year}
          </p>
        </header>

        <section className="definition-block" aria-labelledby="paper-metadata-title">
          <h2 className="section-title" id="paper-metadata-title">
            검증된 메타데이터
          </h2>
          <dl className="definition-list">
            <div>
              <dt>저자</dt>
              <dd lang="en">{formatAuthors(paper.authors, 20)}</dd>
            </div>
            <div>
              <dt>학회/출처</dt>
              <dd lang="en">{paper.venue}</dd>
            </div>
            <div>
              <dt>연도</dt>
              <dd>{paper.year}</dd>
            </div>
            {paper.doi ? (
              <div>
                <dt>DOI</dt>
                <dd lang="en">{paper.doi}</dd>
              </div>
            ) : null}
            {paper.url ? (
              <div>
                <dt>Source URL</dt>
                <dd>
                  <a className="text-link" href={paper.url} lang="en" rel="noreferrer" target="_blank">
                    {new URL(paper.url).hostname}
                  </a>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>초록 상태</dt>
              <dd>not_copied. 원문 초록은 이 앱에 복사하지 않습니다.</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="paper-backlinks-title">
          <h2 className="section-title" id="paper-backlinks-title">
            이 논문이 연결된 용어
          </h2>
          <ul className="relation-list">
            {paper.relations.map((relation) => {
              const term = lookups.termsBySlug.get(relation.termSlug);
              if (!term) {
                return null;
              }

              return (
                <li className="relation-item" key={relation.termSlug}>
                  <p className="relation-item__type">{relationTypeLabelKo(relation.relationType)}</p>
                  <h3 className="relation-item__title">
                    <Link className="text-link" href={termHref(term.slug)}>
                      <span lang="en">{term.headword}</span>
                    </Link>
                  </h3>
                  <p className="dictionary-entry__korean">{term.koreanEquivalents.join(" · ")}</p>
                  <p className="relation-item__rationale">{relation.relevanceRationaleKo}</p>
                  <p className="topic-list" aria-label={`${term.headword} 주제`}>
                    {getTermTopics(term, lookups).map((topic) => (
                      <TopicChip compact key={topic.slug} topic={topic} />
                    ))}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </article>

      <aside className="evidence-rail detail-rail" aria-label="논문 출처">
        <SourceStampList sources={sources} />
      </aside>
    </main>
  );
}
