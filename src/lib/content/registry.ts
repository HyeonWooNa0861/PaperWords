import { contentRegistry as productionContentRegistry } from "@/content/registry";
import {
  abstractBodyFields,
  paperSchema,
  scheduleSchema,
  sourceSchema,
  termSchema,
  topicSchema,
  type ContentRegistry,
  type PaperRecord,
  type RawContentRegistry,
  type SourceRecord,
  type TermRecord,
  type TopicRecord,
  type VerifiableField,
  type Verification
} from "./schemas";
import { validateScheduleIntegrity } from "@/src/lib/schedule/validation";
import type { z } from "zod";

export interface ContentValidationIssue {
  recordId: string;
  fieldPath: string;
  reason: string;
}

export interface ContentValidationResult {
  registry: ContentRegistry;
  issues: ContentValidationIssue[];
}

export interface PublishedContentRegistry {
  topics: TopicRecord[];
  terms: TermRecord[];
  papers: PaperRecord[];
  sources: SourceRecord[];
  schedule?: ContentRegistry["schedule"];
  scheduledTermSlugs: string[];
}

export class ContentValidationError extends Error {
  readonly issues: ContentValidationIssue[];

  constructor(issues: ContentValidationIssue[]) {
    super(formatValidationIssues(issues));
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

const requiredPublishedTermFields: VerifiableField[] = [
  "headword",
  "koreanEquivalents",
  "shortDefinitionKo",
  "explanationKo",
  "topicSlugs",
  "relatedTermSlugs",
  "sourceRefs"
];

const requiredPublishedTopicFields: VerifiableField[] = ["labelEn", "labelKo", "descriptionKo", "sourceRefs"];
const requiredPublishedPaperMetadataFields: VerifiableField[] = ["title", "authors", "venue", "year"];
const termRelationFields = new Set<VerifiableField>(["paperRelations"]);
const paperRelationFields = new Set<VerifiableField>(["relations"]);

export function validateContentRegistry(rawRegistry: RawContentRegistry): ContentValidationResult {
  const issues: ContentValidationIssue[] = [];
  const topics = parseRecords(topicSchema, rawRegistry.topics, "topics", issues);
  const terms = parseRecords(termSchema, rawRegistry.terms, "terms", issues);
  const papers = parseRecords(paperSchema, rawRegistry.papers, "papers", issues);
  const sources = parseRecords(sourceSchema, rawRegistry.sources, "sources", issues);
  const schedule = parseScheduleRecord(rawRegistry.schedule, issues);
  const scheduledTermSlugs =
    rawRegistry.scheduledTermSlugs === undefined
      ? schedule?.entries.map((entry) => entry.termSlug) ?? []
      : parseSchedule(rawRegistry.scheduledTermSlugs, issues);

  const registry: ContentRegistry = {
    topics,
    terms,
    papers,
    sources,
    schedule,
    scheduledTermSlugs
  };

  checkDuplicateRecords(registry, issues);
  checkDuplicateSourceLocators(sources, issues);
  checkTermReferences(registry, issues);
  checkPaperReferences(registry, issues);
  checkTopicReferences(registry, issues);
  checkSourceMappings(registry, issues);
  checkVerificationSourceChecks(registry, issues);
  checkDuplicatePaperRelationEdges(registry, issues);
  checkBidirectionalPaperRelations(registry, issues);
  checkScheduleConsistency(registry, rawRegistry.scheduledTermSlugs !== undefined, issues);
  checkPublicationExposure(registry, issues);
  checkPublishedCompletenessAndProvenance(registry, issues);

  return { registry, issues };
}

export function assertValidContentRegistry(rawRegistry: RawContentRegistry = productionContentRegistry): ContentRegistry {
  const result = validateContentRegistry(rawRegistry);

  if (result.issues.length > 0) {
    throw new ContentValidationError(result.issues);
  }

  return result.registry;
}

export function loadPublishedContent(rawRegistry: RawContentRegistry = productionContentRegistry): PublishedContentRegistry {
  const registry = assertValidContentRegistry(rawRegistry);
  const publishedTerms = registry.terms.filter(isPublished);
  const publishedTermSlugs = new Set(publishedTerms.map((term) => term.slug));

  return {
    topics: registry.topics.filter(isPublished),
    terms: publishedTerms,
    papers: registry.papers.filter(isPublished),
    sources: registry.sources.filter(isPublished),
    schedule: registry.schedule,
    scheduledTermSlugs: registry.scheduledTermSlugs.filter((slug) => publishedTermSlugs.has(slug))
  };
}

export function formatValidationIssues(issues: readonly ContentValidationIssue[]): string {
  return issues.map((issue) => `${issue.recordId} ${issue.fieldPath}: ${issue.reason}`).join("\n");
}

function parseRecords<T>(
  schema: z.ZodType<T>,
  records: readonly unknown[],
  collection: "topics" | "terms" | "papers" | "sources",
  issues: ContentValidationIssue[]
): T[] {
  const parsedRecords: T[] = [];

  records.forEach((record, index) => {
    if (collection === "papers") {
      reportAbstractBodyFields(record, index, issues);
    }

    const result = schema.safeParse(record);
    if (result.success) {
      parsedRecords.push(result.data);
      return;
    }

    const recordId = recordIdFromRaw(record, collection, index);
    for (const issue of result.error.issues) {
      issues.push({
        recordId,
        fieldPath: joinFieldPath(collection, index, issue.path),
        reason: issue.message
      });
    }
  });

  return parsedRecords;
}

function parseSchedule(rawSlugs: readonly unknown[], issues: ContentValidationIssue[]): string[] {
  const scheduledTermSlugs: string[] = [];

  rawSlugs.forEach((rawSlug, index) => {
    if (typeof rawSlug === "string") {
      scheduledTermSlugs.push(rawSlug);
      return;
    }

    issues.push({
      recordId: "schedule",
      fieldPath: `scheduledTermSlugs[${index}]`,
      reason: "scheduled term slug must be a string"
    });
  });

  return scheduledTermSlugs;
}

function parseScheduleRecord(rawSchedule: unknown, issues: ContentValidationIssue[]): ContentRegistry["schedule"] {
  if (rawSchedule === undefined) {
    return undefined;
  }

  const result = scheduleSchema.safeParse(rawSchedule);
  if (result.success) {
    return result.data;
  }

  const recordId = recordIdFromRaw(rawSchedule, "schedule", 0);
  for (const issue of result.error.issues) {
    issues.push({
      recordId,
      fieldPath: joinFieldPath("schedule", 0, issue.path),
      reason: issue.message
    });
  }

  return undefined;
}

function reportAbstractBodyFields(record: unknown, index: number, issues: ContentValidationIssue[]): void {
  if (!isPlainObject(record)) {
    return;
  }

  const recordId = recordIdFromRaw(record, "papers", index);
  for (const field of abstractBodyFields) {
    if (Object.hasOwn(record, field)) {
      issues.push({
        recordId,
        fieldPath: `papers[${index}].${field}`,
        reason: "abstract body fields are not allowed; store abstractStatus: \"not_copied\" only"
      });
    }
  }
}

function checkDuplicateRecords(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  addDuplicateIssues(
    registry.topics.map((topic) => ({ id: topic.slug, recordId: topic.slug, fieldPath: "topics.slug" })),
    "duplicate topic slug",
    issues
  );
  addDuplicateIssues(
    registry.terms.map((term) => ({ id: term.slug, recordId: term.slug, fieldPath: "terms.slug" })),
    "duplicate term slug",
    issues
  );
  addDuplicateIssues(
    registry.papers.map((paper) => ({ id: paper.id, recordId: paper.id, fieldPath: "papers.id" })),
    "duplicate paper ID",
    issues
  );
  addDuplicateIssues(
    registry.sources.map((source) => ({ id: source.id, recordId: source.id, fieldPath: "sources.id" })),
    "duplicate source ID",
    issues
  );
}

function checkDuplicateSourceLocators(sources: readonly SourceRecord[], issues: ContentValidationIssue[]): void {
  addDuplicateIssues(
    sources
      .filter((source): source is SourceRecord & { doi: string } => Boolean(source.doi))
      .map((source) => ({ id: source.doi, recordId: source.id, fieldPath: "sources.doi" })),
    "duplicate source DOI",
    issues
  );
  addDuplicateIssues(
    sources
      .filter((source): source is SourceRecord & { url: string } => Boolean(source.url))
      .map((source) => ({ id: source.url, recordId: source.id, fieldPath: "sources.url" })),
    "duplicate source URL",
    issues
  );
}

function checkTermReferences(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const topicSlugs = new Set(registry.topics.map((topic) => topic.slug));
  const termSlugs = new Set(registry.terms.map((term) => term.slug));
  const paperIds = new Set(registry.papers.map((paper) => paper.id));
  const sourceIds = new Set(registry.sources.map((source) => source.id));

  for (const term of registry.terms) {
    checkRefs(term.topicSlugs, topicSlugs, term.slug, "terms.topicSlugs", "orphan topic", issues);
    checkRefs(term.relatedTermSlugs, termSlugs, term.slug, "terms.relatedTermSlugs", "orphan related term", issues);
    checkRefs(term.sourceRefs, sourceIds, term.slug, "terms.sourceRefs", "orphan source", issues);

    term.paperRelations.forEach((relation, index) => {
      checkRef(relation.paperId, paperIds, term.slug, `terms.paperRelations[${index}].paperId`, "orphan paper", issues);
      checkRefs(
        relation.sourceRefs,
        sourceIds,
        term.slug,
        `terms.paperRelations[${index}].sourceRefs`,
        "orphan source",
        issues
      );
    });
  }
}

function checkPaperReferences(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const termSlugs = new Set(registry.terms.map((term) => term.slug));
  const sourceIds = new Set(registry.sources.map((source) => source.id));

  for (const paper of registry.papers) {
    checkRefs(paper.metadataSources, sourceIds, paper.id, "papers.metadataSources", "orphan source", issues);

    paper.relations.forEach((relation, index) => {
      checkRef(relation.termSlug, termSlugs, paper.id, `papers.relations[${index}].termSlug`, "orphan term", issues);
      checkRefs(
        relation.sourceRefs,
        sourceIds,
        paper.id,
        `papers.relations[${index}].sourceRefs`,
        "orphan source",
        issues
      );
    });
  }
}

function checkTopicReferences(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const sourceIds = new Set(registry.sources.map((source) => source.id));

  for (const topic of registry.topics) {
    checkRefs(topic.sourceRefs, sourceIds, topic.slug, "topics.sourceRefs", "orphan source", issues);
  }
}

function checkSourceMappings(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const knownRecordIds = new Set([
    ...registry.topics.map((topic) => topic.slug),
    ...registry.terms.map((term) => term.slug),
    ...registry.papers.map((paper) => paper.id),
    ...registry.sources.map((source) => source.id)
  ]);

  for (const source of registry.sources) {
    source.verifies.forEach((mapping, index) => {
      checkRef(
        mapping.recordId,
        knownRecordIds,
        source.id,
        `sources.verifies[${index}].recordId`,
        "orphan verified record",
        issues
      );
    });
  }
}

function checkVerificationSourceChecks(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const sourceIds = new Set(registry.sources.map((source) => source.id));

  for (const topic of registry.topics) {
    topic.verification?.sourceChecks.forEach((check, index) => {
      checkRef(
        check.sourceId,
        sourceIds,
        topic.slug,
        `topics.verification.sourceChecks[${index}].sourceId`,
        "orphan verification source",
        issues
      );
      checkDeclaredSource(
        topic.sourceRefs.includes(check.sourceId),
        topic.slug,
        `topics.verification.sourceChecks[${index}].sourceId`,
        check.sourceId,
        issues
      );
    });
  }

  for (const term of registry.terms) {
    term.verification?.sourceChecks.forEach((check, index) => {
      const hasDirectFields = check.fields.some((field) => !termRelationFields.has(field));
      const hasRelationFields = check.fields.some((field) => termRelationFields.has(field));
      checkRef(
        check.sourceId,
        sourceIds,
        term.slug,
        `terms.verification.sourceChecks[${index}].sourceId`,
        "orphan verification source",
        issues
      );
      if (hasDirectFields) {
        checkDeclaredSource(
          term.sourceRefs.includes(check.sourceId),
          term.slug,
          `terms.verification.sourceChecks[${index}].sourceId`,
          check.sourceId,
          issues
        );
      }
      if (hasRelationFields) {
        checkDeclaredSource(
          term.paperRelations.some((relation) => relation.sourceRefs.includes(check.sourceId)),
          term.slug,
          `terms.verification.sourceChecks[${index}].sourceId`,
          check.sourceId,
          issues
        );
      }
    });
  }

  for (const paper of registry.papers) {
    paper.verification?.sourceChecks.forEach((check, index) => {
      const hasDirectFields = check.fields.some((field) => !paperRelationFields.has(field));
      const hasRelationFields = check.fields.some((field) => paperRelationFields.has(field));
      checkRef(
        check.sourceId,
        sourceIds,
        paper.id,
        `papers.verification.sourceChecks[${index}].sourceId`,
        "orphan verification source",
        issues
      );
      if (hasDirectFields) {
        checkDeclaredSource(
          paper.metadataSources.includes(check.sourceId),
          paper.id,
          `papers.verification.sourceChecks[${index}].sourceId`,
          check.sourceId,
          issues
        );
      }
      if (hasRelationFields) {
        checkDeclaredSource(
          paper.relations.some((relation) => relation.sourceRefs.includes(check.sourceId)),
          paper.id,
          `papers.verification.sourceChecks[${index}].sourceId`,
          check.sourceId,
          issues
        );
      }
    });
  }
}

function checkBidirectionalPaperRelations(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const papersById = mapBy(registry.papers, (paper) => paper.id);
  const termsBySlug = mapBy(registry.terms, (term) => term.slug);

  for (const term of registry.terms) {
    term.paperRelations.forEach((relation, index) => {
      const paper = papersById.get(relation.paperId);
      if (!paper) {
        return;
      }

      const inverse = paper.relations.find((paperRelation) => paperRelation.termSlug === term.slug);
      const fieldPath = `terms.paperRelations[${index}]`;
      if (!inverse) {
        issues.push({
          recordId: term.slug,
          fieldPath,
          reason: `missing inverse paper relation: ${relation.paperId} -> ${term.slug}`
        });
        return;
      }

      checkInverseRelationMatch(
        {
          relationType: relation.relationType,
          relevanceRationaleKo: relation.relevanceRationaleKo,
          sourceRefs: relation.sourceRefs
        },
        inverse,
        term.slug,
        fieldPath,
        issues
      );
    });
  }

  for (const paper of registry.papers) {
    paper.relations.forEach((relation, index) => {
      const term = termsBySlug.get(relation.termSlug);
      if (!term) {
        return;
      }

      const inverse = term.paperRelations.find((termRelation) => termRelation.paperId === paper.id);
      const fieldPath = `papers.relations[${index}]`;
      if (!inverse) {
        issues.push({
          recordId: paper.id,
          fieldPath,
          reason: `missing inverse term relation: ${relation.termSlug} -> ${paper.id}`
        });
        return;
      }

      checkInverseRelationMatch(
        {
          relationType: relation.relationType,
          relevanceRationaleKo: relation.relevanceRationaleKo,
          sourceRefs: relation.sourceRefs
        },
        inverse,
        paper.id,
        fieldPath,
        issues
      );
    });
  }
}

function checkDuplicatePaperRelationEdges(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  for (const term of registry.terms) {
    addRepeatedRelationTargetIssues(
      term.paperRelations.map((relation, index) => ({
        targetId: relation.paperId,
        index,
        recordId: term.slug,
        fieldPathPrefix: "terms.paperRelations",
        fieldName: "paperId"
      })),
      "duplicate term paper relation",
      issues
    );
  }

  for (const paper of registry.papers) {
    addRepeatedRelationTargetIssues(
      paper.relations.map((relation, index) => ({
        targetId: relation.termSlug,
        index,
        recordId: paper.id,
        fieldPathPrefix: "papers.relations",
        fieldName: "termSlug"
      })),
      "duplicate paper term relation",
      issues
    );
  }
}

function checkScheduleConsistency(
  registry: ContentRegistry,
  hasExplicitScheduledTermSlugs: boolean,
  issues: ContentValidationIssue[]
): void {
  if (!registry.schedule) {
    return;
  }

  issues.push(...validateScheduleIntegrity(registry.schedule, registry.terms));

  if (!hasExplicitScheduledTermSlugs) {
    return;
  }

  const scheduleSlugs = registry.schedule.entries.map((entry) => entry.termSlug);
  if (!sameStringArray(registry.scheduledTermSlugs, scheduleSlugs)) {
    issues.push({
      recordId: registry.schedule.scheduleId,
      fieldPath: "scheduledTermSlugs",
      reason: "scheduledTermSlugs must match schedule.entries term order"
    });
  }
}

function checkPublicationExposure(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const topicsBySlug = mapBy(registry.topics, (topic) => topic.slug);
  const termsBySlug = mapBy(registry.terms, (term) => term.slug);
  const papersById = mapBy(registry.papers, (paper) => paper.id);
  const sourcesById = mapBy(registry.sources, (source) => source.id);

  registry.scheduledTermSlugs.forEach((slug, index) => {
    const term = termsBySlug.get(slug);
    if (!term) {
      issues.push({
        recordId: "schedule",
        fieldPath: `scheduledTermSlugs[${index}]`,
        reason: `orphan scheduled term: ${slug}`
      });
      return;
    }

    if (!isPublished(term)) {
      issues.push({
        recordId: term.slug,
        fieldPath: `scheduledTermSlugs[${index}]`,
        reason: "invalid publication exposure: scheduled terms must be published"
      });
    }
  });

  for (const topic of registry.topics.filter(isPublished)) {
    checkPublishedRefs(topic.sourceRefs, sourcesById, topic.slug, "topics.sourceRefs", issues);
  }

  for (const term of registry.terms.filter(isPublished)) {
    checkPublishedRefs(term.topicSlugs, topicsBySlug, term.slug, "terms.topicSlugs", issues);
    checkPublishedRefs(term.relatedTermSlugs, termsBySlug, term.slug, "terms.relatedTermSlugs", issues);
    checkPublishedRefs(term.sourceRefs, sourcesById, term.slug, "terms.sourceRefs", issues);

    term.paperRelations.forEach((relation, index) => {
      checkPublishedRef(relation.paperId, papersById, term.slug, `terms.paperRelations[${index}].paperId`, issues);
      checkPublishedRefs(relation.sourceRefs, sourcesById, term.slug, `terms.paperRelations[${index}].sourceRefs`, issues);
    });
  }

  for (const paper of registry.papers.filter(isPublished)) {
    checkPublishedRefs(paper.metadataSources, sourcesById, paper.id, "papers.metadataSources", issues);
    paper.relations.forEach((relation, index) => {
      checkPublishedRef(relation.termSlug, termsBySlug, paper.id, `papers.relations[${index}].termSlug`, issues);
      checkPublishedRefs(relation.sourceRefs, sourcesById, paper.id, `papers.relations[${index}].sourceRefs`, issues);
    });
  }
}

function checkPublishedCompletenessAndProvenance(registry: ContentRegistry, issues: ContentValidationIssue[]): void {
  const sourcesById = mapBy(registry.sources, (source) => source.id);

  for (const topic of registry.topics.filter(isPublished)) {
    checkRequired(topic.sourceRefs.length > 0, topic.slug, "topics.sourceRefs", "published topic needs source refs", issues);
    checkRequired(Boolean(topic.verification), topic.slug, "topics.verification", "published topic needs editorial verification", issues);

    checkProvenanceCoverage(
      topic.slug,
      "topics",
      topic.sourceRefs,
      topic.verification,
      requiredPublishedTopicFields,
      sourcesById,
      issues
    );
  }

  for (const term of registry.terms.filter(isPublished)) {
    checkRequired(
      term.koreanEquivalents.length > 0,
      term.slug,
      "terms.koreanEquivalents",
      "published term needs Korean equivalents",
      issues
    );
    checkRequired(term.topicSlugs.length > 0, term.slug, "terms.topicSlugs", "published term needs a topic", issues);
    checkRequired(
      term.relatedTermSlugs.length > 0,
      term.slug,
      "terms.relatedTermSlugs",
      "published term needs related terms",
      issues
    );
    checkRequired(
      term.paperRelations.length > 0,
      term.slug,
      "terms.paperRelations",
      "published term needs paper relations",
      issues
    );
    checkRequired(term.sourceRefs.length > 0, term.slug, "terms.sourceRefs", "published term needs source refs", issues);
    checkRequired(Boolean(term.verification), term.slug, "terms.verification", "published term needs editorial verification", issues);

    const termFields: VerifiableField[] = [...requiredPublishedTermFields];
    if (term.acronym) {
      termFields.push("acronym");
    }
    if (term.aliases.length > 0) {
      termFields.push("aliases");
    }

    checkProvenanceCoverage(
      term.slug,
      "terms",
      term.sourceRefs,
      term.verification,
      termFields,
      sourcesById,
      issues
    );

    if (term.paperRelations.length > 0) {
      checkProvenanceCoverage(
        term.slug,
        "terms",
        term.paperRelations.flatMap((relation) => relation.sourceRefs),
        term.verification,
        ["paperRelations"],
        sourcesById,
        issues
      );
    }
  }

  for (const paper of registry.papers.filter(isPublished)) {
    checkRequired(
      paper.metadataSources.length > 0,
      paper.id,
      "papers.metadataSources",
      "published paper needs metadata sources",
      issues
    );
    checkRequired(Boolean(paper.doi || paper.url), paper.id, "papers.url", "published paper needs DOI or URL", issues);
    checkRequired(paper.relations.length > 0, paper.id, "papers.relations", "published paper needs term relations", issues);
    checkRequired(Boolean(paper.verification), paper.id, "papers.verification", "published paper needs editorial verification", issues);

    const paperFields = paper.doi
      ? [...requiredPublishedPaperMetadataFields, "doi" as const]
      : [...requiredPublishedPaperMetadataFields, "url" as const];

    checkProvenanceCoverage(paper.id, "papers", paper.metadataSources, paper.verification, paperFields, sourcesById, issues);

    if (paper.relations.length > 0) {
      checkProvenanceCoverage(
        paper.id,
        "papers",
        paper.relations.flatMap((relation) => relation.sourceRefs),
        paper.verification,
        ["relations"],
        sourcesById,
        issues
      );
    }
  }
}

function checkProvenanceCoverage(
  recordId: string,
  collectionPath: string,
  sourceRefs: readonly string[],
  verification: Verification | undefined,
  fields: readonly VerifiableField[],
  sourcesById: ReadonlyMap<string, SourceRecord>,
  issues: ContentValidationIssue[]
): void {
  const sourceRefSet = new Set(sourceRefs);

  for (const field of fields) {
    const supportingSourceIds = [...sourceRefSet].filter((sourceId) => {
      const source = sourcesById.get(sourceId);
      return source?.verifies.some((mapping) => mapping.recordId === recordId && mapping.fields.includes(field)) ?? false;
    });

    if (supportingSourceIds.length === 0) {
      issues.push({
        recordId,
        fieldPath: `${collectionPath}.${field}`,
        reason: "missing source provenance for published field"
      });
    }

    const attestingSourceIds =
      verification?.sourceChecks
        .filter((check) => sourceRefSet.has(check.sourceId) && check.fields.includes(field))
        .map((check) => check.sourceId) ?? [];

    if (attestingSourceIds.length === 0) {
      issues.push({
        recordId,
        fieldPath: `${collectionPath}.${field}`,
        reason: "missing editorial verification attestation for published field"
      });
      continue;
    }

    if (
      supportingSourceIds.length > 0 &&
      !attestingSourceIds.some((sourceId) => supportingSourceIds.includes(sourceId))
    ) {
      issues.push({
        recordId,
        fieldPath: `${collectionPath}.${field}`,
        reason: "published field needs the same declared source for provenance and editorial verification"
      });
    }
  }
}

function checkRefs(
  refs: readonly string[],
  knownRefs: ReadonlySet<string>,
  recordId: string,
  fieldPath: string,
  reason: string,
  issues: ContentValidationIssue[]
): void {
  refs.forEach((ref, index) => {
    checkRef(ref, knownRefs, recordId, `${fieldPath}[${index}]`, reason, issues);
  });
}

function checkRef(
  ref: string,
  knownRefs: ReadonlySet<string>,
  recordId: string,
  fieldPath: string,
  reason: string,
  issues: ContentValidationIssue[]
): void {
  if (knownRefs.has(ref)) {
    return;
  }

  issues.push({
    recordId,
    fieldPath,
    reason: `${reason}: ${ref}`
  });
}

function checkDeclaredSource(
  condition: boolean,
  recordId: string,
  fieldPath: string,
  sourceId: string,
  issues: ContentValidationIssue[]
): void {
  if (condition) {
    return;
  }

  issues.push({
    recordId,
    fieldPath,
    reason: `verification source is not declared on record: ${sourceId}`
  });
}

function checkInverseRelationMatch(
  expected: {
    relationType: string;
    relevanceRationaleKo: string;
    sourceRefs: readonly string[];
  },
  actual: {
    relationType: string;
    relevanceRationaleKo: string;
    sourceRefs: readonly string[];
  },
  recordId: string,
  fieldPath: string,
  issues: ContentValidationIssue[]
): void {
  if (expected.relationType !== actual.relationType) {
    issues.push({
      recordId,
      fieldPath,
      reason: `mismatched inverse paper relation type: expected ${expected.relationType}, found ${actual.relationType}`
    });
  }

  if (expected.relevanceRationaleKo !== actual.relevanceRationaleKo) {
    issues.push({
      recordId,
      fieldPath,
      reason: "mismatched inverse paper relation Korean rationale"
    });
  }

  if (!sameStringArray(expected.sourceRefs, actual.sourceRefs)) {
    issues.push({
      recordId,
      fieldPath,
      reason: "mismatched inverse paper relation sourceRefs"
    });
  }
}

function checkPublishedRefs<T extends { publicationState: string }>(
  refs: readonly string[],
  recordsById: ReadonlyMap<string, T>,
  recordId: string,
  fieldPath: string,
  issues: ContentValidationIssue[]
): void {
  refs.forEach((ref, index) => {
    checkPublishedRef(ref, recordsById, recordId, `${fieldPath}[${index}]`, issues);
  });
}

function checkPublishedRef<T extends { publicationState: string }>(
  ref: string,
  recordsById: ReadonlyMap<string, T>,
  recordId: string,
  fieldPath: string,
  issues: ContentValidationIssue[]
): void {
  const record = recordsById.get(ref);

  if (!record || record.publicationState === "published") {
    return;
  }

  issues.push({
    recordId,
    fieldPath,
    reason: `invalid publication exposure: ${ref} is ${record.publicationState}`
  });
}

function checkRequired(
  condition: boolean,
  recordId: string,
  fieldPath: string,
  reason: string,
  issues: ContentValidationIssue[]
): void {
  if (condition) {
    return;
  }

  issues.push({ recordId, fieldPath, reason });
}

function addDuplicateIssues(
  entries: readonly { id: string; recordId: string; fieldPath: string }[],
  reason: string,
  issues: ContentValidationIssue[]
): void {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
  }

  for (const entry of entries) {
    if ((counts.get(entry.id) ?? 0) > 1) {
      issues.push({
        recordId: entry.recordId,
        fieldPath: entry.fieldPath,
        reason: `${reason}: ${entry.id}`
      });
    }
  }
}

function addRepeatedRelationTargetIssues(
  entries: readonly {
    targetId: string;
    index: number;
    recordId: string;
    fieldPathPrefix: string;
    fieldName: string;
  }[],
  reason: string,
  issues: ContentValidationIssue[]
): void {
  const seenTargets = new Set<string>();

  for (const entry of entries) {
    if (seenTargets.has(entry.targetId)) {
      issues.push({
        recordId: entry.recordId,
        fieldPath: `${entry.fieldPathPrefix}[${entry.index}].${entry.fieldName}`,
        reason: `${reason}: ${entry.targetId}`
      });
      continue;
    }

    seenTargets.add(entry.targetId);
  }
}

function mapBy<T>(records: readonly T[], getId: (record: T) => string): Map<string, T> {
  return new Map(records.map((record) => [getId(record), record]));
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isPublished<T extends { publicationState: string }>(record: T): boolean {
  return record.publicationState === "published";
}

function recordIdFromRaw(record: unknown, collection: string, index: number): string {
  if (isPlainObject(record)) {
    const id = record.id ?? record.slug;
    if (typeof id === "string") {
      return id;
    }
  }

  return `${collection}[${index}]`;
}

function joinFieldPath(collection: string, index: number, path: readonly (string | number | symbol)[]): string {
  const suffix = path
    .map((segment) => {
      if (typeof segment === "number") {
        return `[${segment}]`;
      }
      return `.${String(segment)}`;
    })
    .join("");

  return `${collection}[${index}]${suffix}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
