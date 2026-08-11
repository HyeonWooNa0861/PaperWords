import type { SourceRecord } from "@/src/lib/content";
import { sourceLocator } from "@/src/lib/ui/format";

interface SourceStampListProps {
  sources: SourceRecord[];
  title?: string;
  compact?: boolean;
}

export function SourceStampList({ sources, title = "출처 스탬프", compact = false }: SourceStampListProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="source-stamps" aria-labelledby={titleToId(title)}>
      <h2 id={titleToId(title)} className={compact ? "section-title section-title--small" : "section-title"}>
        {title}
      </h2>
      <ul className="stamp-list">
        {sources.map((source) => (
          <li key={source.id} className="source-stamp">
            <span className="source-stamp__id">{source.id}</span>
            <span>{source.publisherOrVenue}</span>
            <span>{sourceLocator(source)}</span>
            <span>검증 {source.verifiedAt}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function titleToId(title: string): string {
  return `source-${title.replace(/[^a-zA-Z0-9가-힣]+/g, "-")}`;
}
