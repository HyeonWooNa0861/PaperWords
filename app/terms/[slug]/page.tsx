import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompactDictionaryEntry } from "@/components/CompactDictionaryEntry";
import { JsonLd } from "@/components/JsonLd";
import { PaperRelationList } from "@/components/PaperRelationList";
import { SourceStampList } from "@/components/SourceStampList";
import { TermTitleBlock } from "@/components/TermTitleBlock";
import {
  getPublishedRegistry,
  getRelatedTerms,
  getSources,
  getTermPaperRelations,
  getTermTopics,
  makeContentLookups
} from "@/src/lib/ui/content";
import { createRouteMetadata, createTermJsonLd } from "../../seo";

interface TermPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getPublishedRegistry().terms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: TermPageProps): Promise<Metadata> {
  const { slug } = await params;
  const registry = getPublishedRegistry();
  const term = registry.terms.find((candidate) => candidate.slug === slug);

  if (!term) {
    return createRouteMetadata({
      title: "PaperWords 용어 없음",
      description: "요청한 PaperWords 공개 용어를 찾을 수 없습니다.",
      path: `/terms/${slug}`,
      noIndex: true
    });
  }

  return createRouteMetadata({
    title: `${term.headword} | PaperWords`,
    description: term.shortDefinitionKo,
    path: `/terms/${term.slug}`
  });
}

export default async function TermPage({ params }: TermPageProps) {
  const { slug } = await params;
  const registry = getPublishedRegistry();
  const lookups = makeContentLookups(registry);
  const term = lookups.termsBySlug.get(slug);

  if (!term) {
    notFound();
  }

  const topics = getTermTopics(term, lookups);
  const relatedTerms = getRelatedTerms(term, lookups);
  const relations = getTermPaperRelations(term, lookups);
  const sources = getSources(
    [...term.sourceRefs, ...term.paperRelations.flatMap((relation) => relation.sourceRefs)],
    lookups
  );

  return (
    <main className="page detail-grid" id="main-content">
      <JsonLd data={createTermJsonLd(term)} />
      <article className="reading-column" aria-labelledby="term-title">
        <TermTitleBlock eyebrow="용어 해설" headingId="term-title" term={term} topics={topics} />
        <p className="lead-copy">{term.shortDefinitionKo}</p>
        <p className="reading-copy">{term.explanationKo}</p>

        <section className="definition-block" aria-labelledby="term-definition-title">
          <h2 className="section-title" id="term-definition-title">
            표제어와 대응어
          </h2>
          <dl className="definition-list">
            <div>
              <dt>영어 표제어</dt>
              <dd lang="en">{term.headword}</dd>
            </div>
            {term.acronym ? (
              <div>
                <dt>약어</dt>
                <dd lang="en">{term.acronym}</dd>
              </div>
            ) : null}
            <div>
              <dt>한국어 대응어</dt>
              <dd>{term.koreanEquivalents.join(" · ")}</dd>
            </div>
            {term.aliases.length > 0 ? (
              <div>
                <dt>영어 별칭</dt>
                <dd lang="en">{term.aliases.join(" · ")}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section aria-labelledby="related-terms-title">
          <h2 className="section-title" id="related-terms-title">
            함께 읽을 용어
          </h2>
          <div className="entry-stack">
            {relatedTerms.map((relatedTerm) => (
              <CompactDictionaryEntry
                key={relatedTerm.slug}
                term={relatedTerm}
                topics={getTermTopics(relatedTerm, lookups)}
              />
            ))}
          </div>
        </section>
      </article>

      <aside className="evidence-rail detail-rail" aria-label="용어 근거">
        <PaperRelationList relations={relations} />
        <SourceStampList sources={sources} />
      </aside>
    </main>
  );
}
