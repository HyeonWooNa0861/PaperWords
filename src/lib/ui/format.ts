import type { PaperAuthor, RelationType, SourceRecord } from "@/src/lib/content";

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatAuthors(authors: readonly PaperAuthor[], limit = 5): string {
  const visibleAuthors = authors.slice(0, limit).map((author) => author.name);
  const remaining = authors.length - visibleAuthors.length;

  if (remaining <= 0) {
    return visibleAuthors.join(", ");
  }

  return `${visibleAuthors.join(", ")} 외 ${remaining}명`;
}

export function relationTypeLabelKo(type: RelationType): string {
  const labels: Record<RelationType, string> = {
    seminal: "핵심 논문",
    survey: "조망 논문",
    application: "적용 사례",
    "recent-development": "최근 전개"
  };

  return labels[type];
}

export function sourceLocator(source: SourceRecord): string {
  if (source.doi) {
    return `DOI ${source.doi}`;
  }

  if (source.url) {
    return new URL(source.url).hostname;
  }

  return source.publisherOrVenue;
}
