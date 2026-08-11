import Link from "next/link";
import type { TermRecord, TopicRecord } from "@/src/lib/content";
import { getTermTone } from "@/src/lib/ui/content";
import { termHref } from "@/src/lib/ui/routes";
import { TopicChip } from "./TopicChip";

interface CompactDictionaryEntryProps {
  term: TermRecord;
  topics: TopicRecord[];
  meta?: string;
}

export function CompactDictionaryEntry({ term, topics, meta }: CompactDictionaryEntryProps) {
  return (
    <article className="dictionary-entry relation-rail" data-tone={getTermTone(term)}>
      <div className="dictionary-entry__body">
        {meta ? <p className="dictionary-entry__meta">{meta}</p> : null}
        <h2 className="dictionary-entry__title">
          <Link href={termHref(term.slug)} className="text-link">
            <span lang="en">{term.headword}</span>
            {term.acronym ? <span className="dictionary-entry__acronym" lang="en">{term.acronym}</span> : null}
          </Link>
        </h2>
        <p className="dictionary-entry__korean">{term.koreanEquivalents.join(" · ")}</p>
        <p className="dictionary-entry__definition">{term.shortDefinitionKo}</p>
      </div>
      <div className="topic-list" aria-label={`${term.headword} 주제`}>
        {topics.map((topic) => (
          <TopicChip key={topic.slug} topic={topic} compact />
        ))}
      </div>
    </article>
  );
}
