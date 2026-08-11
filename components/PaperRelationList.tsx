import Link from "next/link";
import type { JoinedPaperRelation } from "@/src/lib/ui/content";
import { formatAuthors, relationTypeLabelKo } from "@/src/lib/ui/format";
import { paperHref } from "@/src/lib/ui/routes";
import { SourceStampList } from "./SourceStampList";

interface PaperRelationListProps {
  relations: JoinedPaperRelation[];
  title?: string;
  limit?: number;
  showSources?: boolean;
}

export function PaperRelationList({
  relations,
  title = "논문 관계선",
  limit,
  showSources = true
}: PaperRelationListProps) {
  const visibleRelations = typeof limit === "number" ? relations.slice(0, limit) : relations;

  if (visibleRelations.length === 0) {
    return null;
  }

  return (
    <section className="paper-relations" aria-labelledby={titleToId(title)}>
      <h2 id={titleToId(title)} className="section-title">
        {title}
      </h2>
      <ul className="relation-list">
        {visibleRelations.map(({ relation, paper, sources }) => (
          <li key={`${paper.id}-${relation.relationType}`} className="relation-item">
            <p className="relation-item__type">{relationTypeLabelKo(relation.relationType)}</p>
            <h3 className="relation-item__title">
              <Link href={paperHref(paper.id)} className="text-link" lang="en">
                {paper.title}
              </Link>
            </h3>
            <p className="relation-item__meta">
              <span lang="en">{formatAuthors(paper.authors, 3)}</span>
              <span>{paper.year}</span>
              <span lang="en">{paper.venue}</span>
            </p>
            <p className="relation-item__rationale">{relation.relevanceRationaleKo}</p>
            {showSources ? <SourceStampList sources={sources} title={`${paper.id} 출처`} compact /> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function titleToId(title: string): string {
  return `relations-${title.replace(/[^a-zA-Z0-9가-힣]+/g, "-")}`;
}
