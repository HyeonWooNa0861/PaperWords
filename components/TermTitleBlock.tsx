import type { TermRecord, TopicRecord } from "@/src/lib/content";
import { getTermTone } from "@/src/lib/ui/content";
import { TopicChip } from "./TopicChip";

interface TermTitleBlockProps {
  term: TermRecord;
  topics: TopicRecord[];
  eyebrow: string;
  headingId?: string;
}

export function TermTitleBlock({
  term,
  topics,
  eyebrow,
  headingId
}: TermTitleBlockProps) {
  const title = (
    <>
      <span lang="en">{term.headword}</span>
      {term.acronym ? <span className="term-title__acronym" lang="en">{term.acronym}</span> : null}
    </>
  );

  return (
    <header className="term-title relation-rail" data-tone={getTermTone(term)}>
      <div className="term-title__meta">
        <p className="eyebrow">{eyebrow}</p>
        <span className="trust-label">검증됨</span>
      </div>
      <h1 className="term-title__heading" id={headingId}>
        {title}
      </h1>
      <p className="term-title__korean">{term.koreanEquivalents.join(" · ")}</p>
      {term.aliases.length > 0 ? (
        <p className="term-title__aliases">
          <span>별칭</span>
          <span lang="en">{term.aliases.join(" · ")}</span>
        </p>
      ) : null}
      <div className="topic-list" aria-label="연결 주제">
        {topics.map((topic) => (
          <TopicChip key={topic.slug} topic={topic} compact />
        ))}
      </div>
    </header>
  );
}
