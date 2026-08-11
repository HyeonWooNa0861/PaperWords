import MiniSearch, { type SearchResult } from "minisearch";
import { loadPublishedContent, type PublishedContentRegistry } from "@/src/lib/content";
import {
  MAX_SEARCH_QUERY_LENGTH,
  isSingleLetterAsciiAcronym,
  normalizeSearchText,
  tokenizeSearchText,
  type NormalizedSearchText
} from "./normalization";
import type { TermRecord, TopicRecord } from "@/src/lib/content";

export {
  MAX_SEARCH_QUERY_LENGTH,
  normalizeSearchText,
  tokenizeSearchText,
  type NormalizedQueryStatus,
  type NormalizedSearchText
} from "./normalization";

export type SearchMatchClass =
  | "exact-headword"
  | "exact-acronym-alias-korean"
  | "prefix"
  | "fuzzy"
  | "body";

export interface SearchResultItem {
  term: TermRecord;
  slug: string;
  matchClass: SearchMatchClass;
  matchedField: string;
  configuredWeight: number;
}

export interface SearchResponse {
  query: NormalizedSearchText;
  results: SearchResultItem[];
}

interface SearchDocument {
  slug: string;
  headword: string;
  acronym: string;
  aliases: string;
  koreanEquivalents: string;
  topics: string;
  body: string;
}

interface NormalizedField {
  name: string;
  value: string;
  compact: string;
  tokens: string[];
  weight: number;
}

interface IndexedTerm {
  term: TermRecord;
  document: SearchDocument;
  headword: NormalizedField;
  acronym?: NormalizedField;
  aliases: NormalizedField[];
  koreanEquivalents: NormalizedField[];
  topics: NormalizedField[];
  body: NormalizedField;
}

export interface PaperWordsSearchIndex {
  miniSearch: MiniSearch<SearchDocument>;
  termsBySlug: ReadonlyMap<string, IndexedTerm>;
}

const matchClassOrder: Record<SearchMatchClass, number> = {
  "exact-headword": 0,
  "exact-acronym-alias-korean": 1,
  prefix: 2,
  fuzzy: 3,
  body: 4
};

const fieldWeights = {
  headword: 100,
  acronym: 95,
  koreanEquivalent: 90,
  alias: 85,
  topic: 55,
  body: 10
} as const;

export function buildSearchIndex(registry: PublishedContentRegistry = loadPublishedContent()): PaperWordsSearchIndex {
  const topicsBySlug = new Map(registry.topics.map((topic) => [topic.slug, topic]));
  const indexedTerms = registry.terms.map((term) => indexTerm(term, topicsBySlug));
  const miniSearch = new MiniSearch<SearchDocument>({
    idField: "slug",
    fields: ["headword", "acronym", "aliases", "koreanEquivalents", "topics", "body"],
    storeFields: ["slug"],
    extractField: (document, fieldName) => {
      const value = document[fieldName as keyof SearchDocument];
      return typeof value === "string" ? value : "";
    },
    tokenize: tokenizeSearchText,
    processTerm: (term) => term || null,
    searchOptions: {
      combineWith: "OR",
      prefix: true,
      fuzzy: boundedMiniSearchFuzziness,
      maxFuzzy: 2
    }
  });

  miniSearch.addAll(indexedTerms.map((term) => term.document));

  return {
    miniSearch,
    termsBySlug: new Map(indexedTerms.map((term) => [term.term.slug, term]))
  };
}

export function searchTerms(
  rawQuery: string,
  options: {
    index?: PaperWordsSearchIndex;
    registry?: PublishedContentRegistry;
    limit?: number;
    maxQueryLength?: number;
  } = {}
): SearchResponse {
  const query = normalizeSearchText(rawQuery, { maxLength: options.maxQueryLength ?? MAX_SEARCH_QUERY_LENGTH });
  if (query.status !== "ready") {
    return { query, results: [] };
  }

  const index = options.index ?? buildSearchIndex(options.registry);
  const candidateSlugs = getCandidateSlugs(index, query);
  const results = candidateSlugs
    .map((slug) => {
      const indexedTerm = index.termsBySlug.get(slug);
      return indexedTerm ? classifyTerm(query, indexedTerm) : undefined;
    })
    .filter((result): result is SearchResultItem => Boolean(result))
    .sort(compareSearchResults);

  return { query, results: results.slice(0, options.limit ?? 20) };
}

function indexTerm(term: TermRecord, topicsBySlug: ReadonlyMap<string, TopicRecord>): IndexedTerm {
  const topicLabels = term.topicSlugs.flatMap((topicSlug) => {
    const topic = topicsBySlug.get(topicSlug);
    return topic ? [topic.labelEn, topic.labelKo] : [];
  });
  const bodyParts = [
    term.shortDefinitionKo,
    term.explanationKo,
    ...term.paperRelations.map((relation) => relation.relevanceRationaleKo)
  ];

  return {
    term,
    document: {
      slug: term.slug,
      headword: term.headword,
      acronym: term.acronym ?? "",
      aliases: term.aliases.join(" "),
      koreanEquivalents: term.koreanEquivalents.join(" "),
      topics: topicLabels.join(" "),
      body: bodyParts.join(" ")
    },
    headword: normalizeField("headword", term.headword, fieldWeights.headword),
    acronym: term.acronym ? normalizeField("acronym", term.acronym, fieldWeights.acronym) : undefined,
    aliases: term.aliases.map((alias) => normalizeField("alias", alias, fieldWeights.alias)),
    koreanEquivalents: term.koreanEquivalents.map((equivalent) =>
      normalizeField("koreanEquivalent", equivalent, fieldWeights.koreanEquivalent)
    ),
    topics: topicLabels.map((label) => normalizeField("topic", label, fieldWeights.topic)),
    body: normalizeField("body", bodyParts.join(" "), fieldWeights.body)
  };
}

function normalizeField(name: string, value: string, weight: number): NormalizedField {
  const normalized = normalizeSearchText(value, { treatOversizedAsReady: true });
  return {
    name,
    value: normalized.value,
    compact: normalized.compact,
    tokens: normalized.tokens,
    weight
  };
}

function getCandidateSlugs(index: PaperWordsSearchIndex, query: NormalizedSearchText): string[] {
  const queries = new Set([query.value]);
  if (isSingleLetterAsciiAcronym(query.tokens)) {
    queries.add(query.compact);
  }

  const slugs = new Set<string>();
  for (const candidateQuery of queries) {
    const candidates = index.miniSearch.search(candidateQuery, {
      combineWith: "OR",
      prefix: true,
      fuzzy: boundedMiniSearchFuzziness,
      maxFuzzy: 2
    });

    for (const result of candidates) {
      slugs.add(searchResultSlug(result));
    }
  }

  return [...slugs];
}

function classifyTerm(query: NormalizedSearchText, indexedTerm: IndexedTerm): SearchResultItem | undefined {
  if (isExactMatch(indexedTerm.headword, query)) {
    return makeResult(indexedTerm, "exact-headword", indexedTerm.headword);
  }

  const exactSecondary = [
    indexedTerm.acronym,
    ...indexedTerm.koreanEquivalents,
    ...indexedTerm.aliases
  ]
    .filter(isDefinedField)
    .find((field) => isExactMatch(field, query));
  if (exactSecondary) {
    return makeResult(indexedTerm, "exact-acronym-alias-korean", exactSecondary);
  }

  const prefix = [
    indexedTerm.headword,
    indexedTerm.acronym,
    ...indexedTerm.koreanEquivalents,
    ...indexedTerm.aliases,
    ...indexedTerm.topics
  ]
    .filter(isDefinedField)
    .find((field) => isPrefixMatch(field, query));
  if (prefix) {
    return makeResult(indexedTerm, "prefix", prefix);
  }

  const fuzzy = [
    indexedTerm.headword,
    indexedTerm.acronym,
    ...indexedTerm.aliases,
    ...indexedTerm.koreanEquivalents
  ]
    .filter(isDefinedField)
    .find((field) => isFuzzyMatch(field, query));
  if (fuzzy) {
    return makeResult(indexedTerm, "fuzzy", fuzzy);
  }

  if (isBodyMatch(indexedTerm.body, query)) {
    return makeResult(indexedTerm, "body", indexedTerm.body);
  }

  return undefined;
}

function makeResult(indexedTerm: IndexedTerm, matchClass: SearchMatchClass, field: NormalizedField): SearchResultItem {
  return {
    term: indexedTerm.term,
    slug: indexedTerm.term.slug,
    matchClass,
    matchedField: field.name,
    configuredWeight: field.weight
  };
}

function isDefinedField(field: NormalizedField | undefined): field is NormalizedField {
  return field !== undefined;
}

function isExactMatch(field: NormalizedField, query: NormalizedSearchText): boolean {
  return field.value === query.value || field.compact === query.compact;
}

function isPrefixMatch(field: NormalizedField, query: NormalizedSearchText): boolean {
  if (query.value.length < 2) {
    return false;
  }

  return field.value.startsWith(query.value) || field.compact.startsWith(query.compact);
}

function isFuzzyMatch(field: NormalizedField, query: NormalizedSearchText): boolean {
  const maxDistance = boundedEditDistance(query.compact);
  if (maxDistance === 0 || query.compact.length === 0) {
    return false;
  }

  return levenshteinDistance(field.compact, query.compact, maxDistance) <= maxDistance;
}

function isBodyMatch(field: NormalizedField, query: NormalizedSearchText): boolean {
  if (query.value.length < 2) {
    return false;
  }

  return query.tokens.every((token) => field.tokens.includes(token));
}

function compareSearchResults(left: SearchResultItem, right: SearchResultItem): number {
  return (
    matchClassOrder[left.matchClass] - matchClassOrder[right.matchClass] ||
    right.configuredWeight - left.configuredWeight ||
    left.term.headword.localeCompare(right.term.headword, "en-US") ||
    left.slug.localeCompare(right.slug, "en-US")
  );
}

function boundedMiniSearchFuzziness(term: string): false | number {
  const distance = boundedEditDistance(term);
  return distance === 0 ? false : distance;
}

function boundedEditDistance(value: string): number {
  if (!/^[a-z0-9]+$/.test(value)) {
    return 0;
  }

  if (value.length >= 12) {
    return 2;
  }

  if (value.length >= 5) {
    return 1;
  }

  return 0;
}

function levenshteinDistance(left: string, right: string, maxDistance: number): number {
  if (Math.abs(left.length - right.length) > maxDistance) {
    return maxDistance + 1;
  }

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const current = [leftIndex + 1];
    let rowMinimum = current[0] ?? 0;

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex] === right[rightIndex] ? 0 : 1;
      const nextValue = Math.min(
        (previous[rightIndex + 1] ?? 0) + 1,
        (current[rightIndex] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + substitutionCost
      );
      current.push(nextValue);
      rowMinimum = Math.min(rowMinimum, nextValue);
    }

    if (rowMinimum > maxDistance) {
      return maxDistance + 1;
    }

    previous = current;
  }

  return previous[right.length] ?? maxDistance + 1;
}

function searchResultSlug(result: SearchResult): string {
  return String(result.id);
}
