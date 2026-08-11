import { z } from "zod";

export const publicationStates = [
  "draft",
  "metadata_verified",
  "language_reviewed",
  "published",
  "retired"
] as const;

export const relationTypes = ["seminal", "survey", "application", "recent-development"] as const;

export const sourceKinds = [
  "publisher",
  "doi-registry",
  "preprint-repository",
  "openalex-record",
  "semantic-scholar-record",
  "official-documentation",
  "editorial-review"
] as const;

export const verifiableFields = [
  "labelEn",
  "labelKo",
  "descriptionKo",
  "headword",
  "acronym",
  "aliases",
  "koreanEquivalents",
  "shortDefinitionKo",
  "explanationKo",
  "topicSlugs",
  "relatedTermSlugs",
  "paperRelations",
  "sourceRefs",
  "title",
  "authors",
  "venue",
  "year",
  "doi",
  "openAlexId",
  "url",
  "metadataSources",
  "relations",
  "publisherOrVenue",
  "retrievedAt",
  "verifiedAt",
  "reviewer",
  "usagePolicy"
] as const;

export const abstractBodyFields = [
  "abstract",
  "abstractText",
  "abstractKo",
  "abstractBody",
  "summaryAbstract",
  "copiedAbstract"
] as const;

const asciiSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localIdPattern = /^[a-z0-9][a-z0-9._:-]*$/;
const doiPattern = /^10\.\d{4,9}\/[-._;()/:a-z0-9]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const publicationStateSchema = z.enum(publicationStates);
export const relationTypeSchema = z.enum(relationTypes);
export const sourceKindSchema = z.enum(sourceKinds);
export const verifiableFieldSchema = z.enum(verifiableFields);

export const slugSchema = z
  .string()
  .regex(asciiSlugPattern, "must be a lowercase ASCII slug");

export const localIdSchema = z
  .string()
  .regex(localIdPattern, "must be a stable lowercase ASCII local ID");

export const doiSchema = z
  .string()
  .regex(doiPattern, "must be a normalized lowercase DOI");

export const urlSchema = z.string().url("must be a valid URL");
export const isoDateSchema = z.string().regex(isoDatePattern, "must be an ISO date in YYYY-MM-DD format");
export const nonEmptyStringSchema = z.string().trim().min(1, "must not be empty");

export const verificationCheckSchema = z.strictObject({
  sourceId: localIdSchema,
  fields: z.array(verifiableFieldSchema).min(1, "must name at least one verified field"),
  checkedAt: isoDateSchema.optional(),
  notes: nonEmptyStringSchema.optional()
});

export const verificationSchema = z.strictObject({
  reviewer: nonEmptyStringSchema,
  verifiedAt: isoDateSchema,
  sourceChecks: z.array(verificationCheckSchema).min(1, "must include at least one source check"),
  notes: nonEmptyStringSchema.optional()
});

export const provenanceMappingSchema = z.strictObject({
  recordId: localIdSchema,
  fields: z.array(verifiableFieldSchema).min(1, "must name at least one supported field")
});

export const topicSchema = z.strictObject({
  slug: slugSchema,
  labelEn: nonEmptyStringSchema,
  labelKo: nonEmptyStringSchema,
  descriptionKo: nonEmptyStringSchema,
  publicationState: publicationStateSchema,
  sourceRefs: z.array(localIdSchema),
  verification: verificationSchema.optional()
});

export const termPaperRelationSchema = z.strictObject({
  paperId: localIdSchema,
  relationType: relationTypeSchema,
  relevanceRationaleKo: nonEmptyStringSchema,
  sourceRefs: z.array(localIdSchema)
});

export const paperTermRelationSchema = z.strictObject({
  termSlug: slugSchema,
  relationType: relationTypeSchema,
  relevanceRationaleKo: nonEmptyStringSchema,
  sourceRefs: z.array(localIdSchema)
});

export const termSchema = z.strictObject({
  slug: slugSchema,
  headword: nonEmptyStringSchema,
  acronym: nonEmptyStringSchema.optional(),
  aliases: z.array(nonEmptyStringSchema),
  koreanEquivalents: z.array(nonEmptyStringSchema),
  shortDefinitionKo: nonEmptyStringSchema,
  explanationKo: nonEmptyStringSchema,
  topicSlugs: z.array(slugSchema),
  relatedTermSlugs: z.array(slugSchema),
  paperRelations: z.array(termPaperRelationSchema),
  sourceRefs: z.array(localIdSchema),
  publicationState: publicationStateSchema,
  verification: verificationSchema.optional()
});

export const paperAuthorSchema = z.strictObject({
  name: nonEmptyStringSchema,
  displayTruncated: z.boolean().optional()
});

export const paperSchema = z.strictObject({
  id: localIdSchema,
  title: nonEmptyStringSchema,
  authors: z.array(paperAuthorSchema).min(1, "must include at least one author"),
  venue: nonEmptyStringSchema,
  year: z.number().int().min(1900).max(2100),
  doi: doiSchema.optional(),
  openAlexId: nonEmptyStringSchema.optional(),
  url: urlSchema.optional(),
  metadataSources: z.array(localIdSchema),
  abstractStatus: z.literal("not_copied"),
  relations: z.array(paperTermRelationSchema),
  publicationState: publicationStateSchema,
  verification: verificationSchema.optional()
});

export const scheduleEntrySchema = z.strictObject({
  dateKst: isoDateSchema,
  termSlug: slugSchema
});

export const scheduleSchema = z.strictObject({
  scheduleId: localIdSchema,
  version: z.literal("v1"),
  timezone: z.literal("Asia/Seoul"),
  startDateKst: isoDateSchema,
  endDateKst: isoDateSchema,
  durationDays: z.number().int().positive(),
  noRepeatWindowDays: z.number().int().positive(),
  immutableSinceKst: isoDateSchema,
  entries: z.array(scheduleEntrySchema)
});

export const sourceSchema = z
  .strictObject({
    id: localIdSchema,
    kind: sourceKindSchema,
    url: urlSchema.optional(),
    doi: doiSchema.optional(),
    title: nonEmptyStringSchema,
    publisherOrVenue: nonEmptyStringSchema,
    retrievedAt: isoDateSchema,
    verifiedAt: isoDateSchema,
    reviewer: nonEmptyStringSchema,
    usagePolicy: nonEmptyStringSchema,
    verifies: z.array(provenanceMappingSchema).min(1, "must support at least one record field"),
    publicationState: publicationStateSchema
  })
  .superRefine((source, context) => {
    if (!source.url && !source.doi) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "must include a URL or DOI evidence locator"
      });
    }
  });

export type PublicationState = z.infer<typeof publicationStateSchema>;
export type RelationType = z.infer<typeof relationTypeSchema>;
export type SourceKind = z.infer<typeof sourceKindSchema>;
export type VerifiableField = z.infer<typeof verifiableFieldSchema>;
export type VerificationCheck = z.infer<typeof verificationCheckSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type ProvenanceMapping = z.infer<typeof provenanceMappingSchema>;
export type TopicRecord = z.infer<typeof topicSchema>;
export type TermPaperRelation = z.infer<typeof termPaperRelationSchema>;
export type PaperTermRelation = z.infer<typeof paperTermRelationSchema>;
export type TermRecord = z.infer<typeof termSchema>;
export type PaperAuthor = z.infer<typeof paperAuthorSchema>;
export type PaperRecord = z.infer<typeof paperSchema>;
export type ScheduleEntry = z.infer<typeof scheduleEntrySchema>;
export type ScheduleRecord = z.infer<typeof scheduleSchema>;
export type SourceRecord = z.infer<typeof sourceSchema>;

export interface ContentRegistry {
  topics: TopicRecord[];
  terms: TermRecord[];
  papers: PaperRecord[];
  sources: SourceRecord[];
  schedule?: ScheduleRecord;
  scheduledTermSlugs: string[];
}

export interface RawContentRegistry {
  topics: readonly unknown[];
  terms: readonly unknown[];
  papers: readonly unknown[];
  sources: readonly unknown[];
  schedule?: unknown;
  scheduledTermSlugs?: readonly unknown[];
}
