import { describe, expect, it } from "vitest";
import { paperSchema, publicationStateSchema, scheduleSchema, sourceSchema, termSchema, topicSchema } from "@/src/lib/content";
import { makeValidContentRegistry } from "./fixtures";

describe("content record schemas", () => {
  it("accept valid topic, term, paper, and source records", () => {
    const registry = makeValidContentRegistry();

    expect(topicSchema.safeParse(registry.topics[0]).success).toBe(true);
    expect(termSchema.safeParse(registry.terms[0]).success).toBe(true);
    expect(paperSchema.safeParse(registry.papers[0]).success).toBe(true);
    expect(sourceSchema.safeParse(registry.sources[0]).success).toBe(true);
    expect(
      scheduleSchema.safeParse({
        scheduleId: "fixture-schedule.v1",
        version: "v1",
        timezone: "Asia/Seoul",
        startDateKst: "2026-08-11",
        endDateKst: "2026-08-11",
        durationDays: 1,
        noRepeatWindowDays: 20,
        immutableSinceKst: "2026-08-11",
        entries: [{ dateKst: "2026-08-11", termSlug: "rag" }]
      }).success
    ).toBe(true);
  });

  it("reject unknown keys through strict Zod objects", () => {
    const [term] = makeValidContentRegistry().terms;

    expect(termSchema.safeParse({ ...term, experimentalNote: "not in schema" }).success).toBe(false);
  });

  it("reject copied abstract body fields", () => {
    const [paper] = makeValidContentRegistry().papers;

    expect(paperSchema.safeParse({ ...paper, abstractText: "Do not copy paper abstracts." }).success).toBe(false);
  });

  it("reject invalid publication states and paper relation types", () => {
    const [term] = makeValidContentRegistry().terms;

    expect(publicationStateSchema.safeParse("ready").success).toBe(false);
    expect(
      termSchema.safeParse({
        ...term,
        paperRelations: [{ ...term.paperRelations[0], relationType: "background" }]
      }).success
    ).toBe(false);
  });

  it("reject invalid DOI and URL fields", () => {
    const [paper] = makeValidContentRegistry().papers;
    const [source] = makeValidContentRegistry().sources;

    expect(paperSchema.safeParse({ ...paper, doi: "not-a-doi" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...source, url: "not a url" }).success).toBe(false);
  });

  it("reject unknown source provenance fields", () => {
    const [source] = makeValidContentRegistry().sources;

    expect(
      sourceSchema.safeParse({
        ...source,
        verifies: [{ recordId: "rag", fields: ["abstractText"] }]
      }).success
    ).toBe(false);
  });
});
