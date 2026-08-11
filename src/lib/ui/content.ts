import {
  loadPublishedContent,
  type PaperRecord,
  type PublishedContentRegistry,
  type ScheduleRecord,
  type SourceRecord,
  type TermPaperRelation,
  type TermRecord,
  type TopicRecord
} from "@/src/lib/content";
import { getScheduledTermForDate, resolveKstDate } from "@/src/lib/schedule";

export type TopicTone = "foundation" | "edge" | "quantization";

export interface ContentLookups {
  termsBySlug: ReadonlyMap<string, TermRecord>;
  topicsBySlug: ReadonlyMap<string, TopicRecord>;
  papersById: ReadonlyMap<string, PaperRecord>;
  sourcesById: ReadonlyMap<string, SourceRecord>;
}

export interface JoinedPaperRelation {
  relation: TermPaperRelation;
  paper: PaperRecord;
  sources: SourceRecord[];
}

export interface TodayTermView {
  status: "scheduled" | "out-of-range";
  dateKst: string;
  scheduledDateKst: string;
  term: TermRecord;
  schedule: ScheduleRecord;
  messageKo?: string;
}

export function getPublishedRegistry(): PublishedContentRegistry {
  return loadPublishedContent();
}

export function makeContentLookups(registry: PublishedContentRegistry): ContentLookups {
  return {
    termsBySlug: new Map(registry.terms.map((term) => [term.slug, term])),
    topicsBySlug: new Map(registry.topics.map((topic) => [topic.slug, topic])),
    papersById: new Map(registry.papers.map((paper) => [paper.id, paper])),
    sourcesById: new Map(registry.sources.map((source) => [source.id, source]))
  };
}

export function getTermTopics(term: TermRecord, lookups: ContentLookups): TopicRecord[] {
  return term.topicSlugs.map((slug) => lookups.topicsBySlug.get(slug)).filter(isDefined);
}

export function getRelatedTerms(term: TermRecord, lookups: ContentLookups): TermRecord[] {
  return term.relatedTermSlugs.map((slug) => lookups.termsBySlug.get(slug)).filter(isDefined);
}

export function getSources(sourceIds: readonly string[], lookups: ContentLookups): SourceRecord[] {
  return unique(sourceIds).map((sourceId) => lookups.sourcesById.get(sourceId)).filter(isDefined);
}

export function getCoreTermSources(term: TermRecord, lookups: ContentLookups): SourceRecord[] {
  const coreFields = new Set(["headword", "koreanEquivalents", "shortDefinitionKo", "explanationKo", "topicSlugs"]);

  return getSources(term.sourceRefs, lookups).filter((source) =>
    source.verifies.some(
      (mapping) => mapping.recordId === term.slug && mapping.fields.some((field) => coreFields.has(field))
    )
  );
}

export function getTermPaperRelations(term: TermRecord, lookups: ContentLookups): JoinedPaperRelation[] {
  return term.paperRelations
    .map((relation) => {
      const paper = lookups.papersById.get(relation.paperId);
      if (!paper) {
        return undefined;
      }

      return {
        relation,
        paper,
        sources: getSources(relation.sourceRefs, lookups)
      };
    })
    .filter(isDefined);
}

export function getTopicTerms(topicSlug: string, registry: PublishedContentRegistry): TermRecord[] {
  return registry.terms.filter((term) => term.topicSlugs.includes(topicSlug));
}

export function getFeaturedPapersForTopic(
  topicSlug: string,
  registry: PublishedContentRegistry,
  lookups: ContentLookups
): JoinedPaperRelation[] {
  const seenPaperIds = new Set<string>();
  const relations: JoinedPaperRelation[] = [];

  for (const term of getTopicTerms(topicSlug, registry)) {
    for (const joined of getTermPaperRelations(term, lookups)) {
      if (seenPaperIds.has(joined.paper.id)) {
        continue;
      }

      seenPaperIds.add(joined.paper.id);
      relations.push(joined);
    }
  }

  return relations;
}

export function resolveTodayTermView(
  registry: PublishedContentRegistry = getPublishedRegistry(),
  input: Date | string | number = new Date()
): TodayTermView | undefined {
  const scheduled = getScheduledTermForDate(registry, input);
  if (scheduled) {
    return {
      status: "scheduled",
      dateKst: scheduled.dateKst,
      scheduledDateKst: scheduled.entry.dateKst,
      term: scheduled.term,
      schedule: scheduled.schedule
    };
  }

  const schedule = registry.schedule;
  if (!schedule || schedule.entries.length === 0) {
    return undefined;
  }

  const dateKst = resolveKstDate(input);
  const fallbackEntry =
    dateKst > schedule.endDateKst ? schedule.entries[schedule.entries.length - 1] : schedule.entries[0];
  const fallbackTerm = fallbackEntry
    ? registry.terms.find((term) => term.slug === fallbackEntry.termSlug)
    : undefined;

  if (!fallbackEntry || !fallbackTerm) {
    return undefined;
  }

  return {
    status: "out-of-range",
    dateKst,
    scheduledDateKst: fallbackEntry.dateKst,
    term: fallbackTerm,
    schedule,
    messageKo: `${dateKst} KST는 ${schedule.scheduleId} 범위(${schedule.startDateKst} - ${schedule.endDateKst}) 밖입니다. 아래 항목은 버전된 스케줄의 고정 미리보기입니다.`
  };
}

export function getTermTone(term: TermRecord): TopicTone {
  if (term.topicSlugs.includes("model-quantization")) {
    return "quantization";
  }

  if (term.topicSlugs.includes("edge-ai") || term.topicSlugs.includes("edge-computing")) {
    return "edge";
  }

  return "foundation";
}

export function getTopicTone(topicSlug: string): TopicTone {
  if (topicSlug === "model-quantization") {
    return "quantization";
  }

  if (topicSlug === "edge-ai" || topicSlug === "edge-computing") {
    return "edge";
  }

  return "foundation";
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
