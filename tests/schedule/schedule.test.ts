import { describe, expect, it } from "vitest";
import { contentRegistry } from "@/content/registry";
import { activeSchedule } from "@/content/schedule";
import {
  addDaysKst,
  getScheduledTermForDate,
  resolveKstDate,
  validateScheduleIntegrity
} from "@/src/lib/schedule";
import {
  ContentValidationError,
  loadPublishedContent,
  validateContentRegistry,
  type RawContentRegistry,
  type ScheduleRecord
} from "@/src/lib/content";
import { makeValidContentRegistry } from "@/tests/content/fixtures";

describe("versioned KST schedule", () => {
  const published = loadPublishedContent(contentRegistry);

  it("declares the immutable initial v1 metadata", () => {
    expect(activeSchedule).toMatchObject({
      scheduleId: "paperwords-mvp-2026-08-11.v1",
      version: "v1",
      timezone: "Asia/Seoul",
      startDateKst: "2026-08-11",
      endDateKst: "2026-11-08",
      durationDays: 90,
      noRepeatWindowDays: 20,
      immutableSinceKst: "2026-08-11"
    });
    expect(activeSchedule.entries).toHaveLength(90);
  });

  it("has one published term for every KST date in the 90-day range", () => {
    expect(validateScheduleIntegrity(activeSchedule, published.terms)).toEqual([]);

    activeSchedule.entries.forEach((entry, index) => {
      expect(entry.dateKst).toBe(addDaysKst(activeSchedule.startDateKst, index));
      expect(published.terms.some((term) => term.slug === entry.termSlug), entry.termSlug).toBe(true);
    });
    expect(activeSchedule.entries.at(-1)?.dateKst).toBe("2026-11-08");
  });

  it("enforces the versioned 20-day no-repeat window", () => {
    activeSchedule.entries.forEach((entry, index) => {
      const windowStart = Math.max(0, index - activeSchedule.noRepeatWindowDays + 1);
      const priorWindow = activeSchedule.entries.slice(windowStart, index).map((candidate) => candidate.termSlug);

      expect(priorWindow, `${entry.dateKst} ${entry.termSlug}`).not.toContain(entry.termSlug);
    });
  });

  it("avoids three consecutive days with the same primary topic", () => {
    const termsBySlug = new Map(published.terms.map((term) => [term.slug, term]));

    for (let index = 2; index < activeSchedule.entries.length; index += 1) {
      const topics = [index - 2, index - 1, index].map((entryIndex) => {
        const slug = activeSchedule.entries[entryIndex]?.termSlug;
        return slug ? termsBySlug.get(slug)?.topicSlugs[0] : undefined;
      });

      expect(new Set(topics).size, `${activeSchedule.entries[index]?.dateKst} ${topics.join(" -> ")}`).toBeGreaterThan(1);
    }
  });

  it("resolves Asia/Seoul dates independently of the machine timezone", () => {
    expect(resolveKstDate(new Date("2026-08-10T14:59:59.999Z"))).toBe("2026-08-10");
    expect(resolveKstDate(new Date("2026-08-10T15:00:00.000Z"))).toBe("2026-08-11");
    expect(resolveKstDate(new Date("2026-08-11T14:59:59.999Z"))).toBe("2026-08-11");
    expect(resolveKstDate(new Date("2026-08-11T15:00:00.000Z"))).toBe("2026-08-12");

    expect(getScheduledTermForDate(published, new Date("2026-08-10T15:00:00.000Z"))?.term.slug).toBe("transformer");
    expect(getScheduledTermForDate(published, new Date("2026-08-11T15:00:00.000Z"))?.term.slug).toBe(
      "neural-network-quantization"
    );
  });

  it("keeps past results fixed when additional corpus records are supplied", () => {
    const baseline = getScheduledTermForDate(published, "2026-08-11")?.term.slug;
    const registryWithFutureTerm = {
      ...published,
      terms: [
        ...published.terms,
        {
          ...published.terms[0],
          slug: "future-published-term",
          headword: "Future Published Term"
        }
      ]
    };

    expect(getScheduledTermForDate(registryWithFutureTerm, "2026-08-11")?.term.slug).toBe(baseline);
  });

  it("rejects draft and orphan scheduled slugs through the public loader", () => {
    const registry = makeValidContentRegistry();
    const draftTerm = {
      ...registry.terms[0],
      slug: "draft-term",
      publicationState: "draft",
      topicSlugs: [],
      relatedTermSlugs: [],
      paperRelations: [],
      sourceRefs: [],
      verification: undefined
    };
    const draftScheduleRegistry: RawContentRegistry = {
      ...registry,
      terms: [...registry.terms, draftTerm],
      schedule: makeOneDaySchedule("draft-term"),
      scheduledTermSlugs: undefined
    };
    const orphanScheduleRegistry: RawContentRegistry = {
      ...registry,
      schedule: makeOneDaySchedule("missing-term"),
      scheduledTermSlugs: undefined
    };

    expect(validateContentRegistry(draftScheduleRegistry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "draft-term",
          fieldPath: "schedule.entries[0].termSlug",
          reason: "invalid publication exposure: scheduled terms must be published"
        })
      ])
    );
    expect(() => loadPublishedContent(draftScheduleRegistry)).toThrow(ContentValidationError);

    expect(validateContentRegistry(orphanScheduleRegistry).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.entries[0].termSlug",
          reason: "orphan scheduled term: missing-term"
        })
      ])
    );
    expect(() => loadPublishedContent(orphanScheduleRegistry)).toThrow(ContentValidationError);
  });

  it("rejects duplicate or skipped date sequences", () => {
    const duplicateDateSchedule = {
      ...makeTwoDaySchedule("rag", "dense-retrieval"),
      entries: [
        { dateKst: "2026-08-11", termSlug: "rag" },
        { dateKst: "2026-08-11", termSlug: "dense-retrieval" }
      ]
    };
    const skippedDateSchedule = {
      ...makeTwoDaySchedule("rag", "dense-retrieval"),
      endDateKst: "2026-08-13",
      entries: [
        { dateKst: "2026-08-11", termSlug: "rag" },
        { dateKst: "2026-08-13", termSlug: "dense-retrieval" }
      ]
    };

    expect(validateScheduleIntegrity(duplicateDateSchedule, published.terms)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.entries[1].dateKst",
          reason: "duplicate schedule date: 2026-08-11"
        }),
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.entries[1].dateKst",
          reason: "expected 2026-08-12"
        })
      ])
    );
    expect(validateScheduleIntegrity(skippedDateSchedule, published.terms)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.entries[1].dateKst",
          reason: "expected 2026-08-12"
        })
      ])
    );
  });

  it("rejects duration metadata that does not match the inclusive KST date span", () => {
    const schedule = {
      ...makeOneDaySchedule("rag"),
      endDateKst: "2026-08-12"
    };

    expect(validateScheduleIntegrity(schedule, published.terms)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.durationDays",
          reason: "durationDays must equal inclusive date span: 2"
        })
      ])
    );
  });

  it("rejects term repeats inside the configured no-repeat window", () => {
    const schedule = makeTwoDaySchedule("rag", "rag");

    expect(validateScheduleIntegrity(schedule, published.terms)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.entries[1].termSlug",
          reason: "term repeats within 20-day window: rag"
        })
      ])
    );
  });

  it("rejects three consecutive scheduled entries with the same primary topic", () => {
    const quantizationTerms = published.terms
      .filter((term) => term.topicSlugs[0] === "model-quantization")
      .slice(0, 3);
    expect(quantizationTerms).toHaveLength(3);
    const schedule = {
      ...makeOneDaySchedule(quantizationTerms[0]!.slug),
      endDateKst: "2026-08-13",
      durationDays: 3,
      entries: quantizationTerms.map((term, index) => ({
        dateKst: addDaysKst("2026-08-11", index),
        termSlug: term.slug
      }))
    };

    expect(validateScheduleIntegrity(schedule, published.terms)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordId: "fixture-schedule.v1",
          fieldPath: "schedule.entries[2].termSlug",
          reason: "three consecutive entries use primary topic: model-quantization"
        })
      ])
    );
  });
});

function makeOneDaySchedule(termSlug: string): ScheduleRecord {
  return {
    scheduleId: "fixture-schedule.v1",
    version: "v1",
    timezone: "Asia/Seoul",
    startDateKst: "2026-08-11",
    endDateKst: "2026-08-11",
    durationDays: 1,
    noRepeatWindowDays: 20,
    immutableSinceKst: "2026-08-11",
    entries: [{ dateKst: "2026-08-11", termSlug }]
  };
}

function makeTwoDaySchedule(firstTermSlug: string, secondTermSlug: string): ScheduleRecord {
  return {
    ...makeOneDaySchedule(firstTermSlug),
    endDateKst: "2026-08-12",
    durationDays: 2,
    entries: [
      { dateKst: "2026-08-11", termSlug: firstTermSlug },
      { dateKst: "2026-08-12", termSlug: secondTermSlug }
    ]
  };
}
