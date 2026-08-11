import { addDaysKst, inclusiveDaysBetweenKst } from "./dates";
import type { ScheduleRecord, TermRecord } from "@/src/lib/content/schemas";

export interface ScheduleValidationIssue {
  recordId: string;
  fieldPath: string;
  reason: string;
}

export function validateScheduleIntegrity(
  schedule: ScheduleRecord,
  terms: readonly TermRecord[] = []
): ScheduleValidationIssue[] {
  const issues: ScheduleValidationIssue[] = [];
  const expectedDuration = safeInclusiveDays(schedule.startDateKst, schedule.endDateKst, issues);

  if (expectedDuration !== undefined && expectedDuration !== schedule.durationDays) {
    issues.push({
      recordId: schedule.scheduleId,
      fieldPath: "schedule.durationDays",
      reason: `durationDays must equal inclusive date span: ${expectedDuration}`
    });
  }

  if (schedule.entries.length !== schedule.durationDays) {
    issues.push({
      recordId: schedule.scheduleId,
      fieldPath: "schedule.entries",
      reason: `schedule must contain exactly ${schedule.durationDays} entries`
    });
  }

  checkDateSequence(schedule, issues);
  checkScheduledTerms(schedule, terms, issues);
  checkNoRepeatWindow(schedule, issues);
  checkPrimaryTopicBalance(schedule, terms, issues);

  return issues;
}

function safeInclusiveDays(
  startDateKst: string,
  endDateKst: string,
  issues: ScheduleValidationIssue[]
): number | undefined {
  try {
    return inclusiveDaysBetweenKst(startDateKst, endDateKst);
  } catch (error) {
    issues.push({
      recordId: "schedule",
      fieldPath: "schedule.startDateKst",
      reason: error instanceof Error ? error.message : "invalid schedule date range"
    });
    return undefined;
  }
}

function checkDateSequence(schedule: ScheduleRecord, issues: ScheduleValidationIssue[]): void {
  const seenDates = new Set<string>();

  schedule.entries.forEach((entry, index) => {
    if (seenDates.has(entry.dateKst)) {
      issues.push({
        recordId: schedule.scheduleId,
        fieldPath: `schedule.entries[${index}].dateKst`,
        reason: `duplicate schedule date: ${entry.dateKst}`
      });
    }
    seenDates.add(entry.dateKst);

    const expectedDate = addDaysKst(schedule.startDateKst, index);
    if (entry.dateKst !== expectedDate) {
      issues.push({
        recordId: schedule.scheduleId,
        fieldPath: `schedule.entries[${index}].dateKst`,
        reason: `expected ${expectedDate}`
      });
    }
  });

  const lastEntry = schedule.entries.at(-1);
  if (lastEntry && lastEntry.dateKst !== schedule.endDateKst) {
    issues.push({
      recordId: schedule.scheduleId,
      fieldPath: "schedule.endDateKst",
      reason: `endDateKst must match the last entry date: ${lastEntry.dateKst}`
    });
  }
}

function checkScheduledTerms(
  schedule: ScheduleRecord,
  terms: readonly TermRecord[],
  issues: ScheduleValidationIssue[]
): void {
  if (terms.length === 0) {
    return;
  }

  const termsBySlug = new Map(terms.map((term) => [term.slug, term]));

  schedule.entries.forEach((entry, index) => {
    const term = termsBySlug.get(entry.termSlug);
    if (!term) {
      issues.push({
        recordId: schedule.scheduleId,
        fieldPath: `schedule.entries[${index}].termSlug`,
        reason: `orphan scheduled term: ${entry.termSlug}`
      });
      return;
    }

    if (term.publicationState !== "published") {
      issues.push({
        recordId: term.slug,
        fieldPath: `schedule.entries[${index}].termSlug`,
        reason: "invalid publication exposure: scheduled terms must be published"
      });
    }
  });
}

function checkNoRepeatWindow(schedule: ScheduleRecord, issues: ScheduleValidationIssue[]): void {
  const windowSize = schedule.noRepeatWindowDays;

  schedule.entries.forEach((entry, index) => {
    const windowStart = Math.max(0, index - windowSize + 1);

    for (let priorIndex = windowStart; priorIndex < index; priorIndex += 1) {
      if (schedule.entries[priorIndex]?.termSlug === entry.termSlug) {
        issues.push({
          recordId: schedule.scheduleId,
          fieldPath: `schedule.entries[${index}].termSlug`,
          reason: `term repeats within ${windowSize}-day window: ${entry.termSlug}`
        });
        return;
      }
    }
  });
}

function checkPrimaryTopicBalance(
  schedule: ScheduleRecord,
  terms: readonly TermRecord[],
  issues: ScheduleValidationIssue[]
): void {
  if (terms.length === 0) {
    return;
  }

  const termsBySlug = new Map(terms.map((term) => [term.slug, term]));
  const availablePrimaryTopics = new Set(
    terms
      .filter((term) => term.publicationState === "published")
      .map((term) => term.topicSlugs[0])
      .filter((topicSlug): topicSlug is string => Boolean(topicSlug))
  );

  if (availablePrimaryTopics.size < 2) {
    return;
  }

  for (let index = 2; index < schedule.entries.length; index += 1) {
    const topics = [index - 2, index - 1, index].map((entryIndex) => {
      const slug = schedule.entries[entryIndex]?.termSlug;
      return slug ? termsBySlug.get(slug)?.topicSlugs[0] : undefined;
    });

    if (topics[0] && topics[0] === topics[1] && topics[1] === topics[2]) {
      issues.push({
        recordId: schedule.scheduleId,
        fieldPath: `schedule.entries[${index}].termSlug`,
        reason: `three consecutive entries use primary topic: ${topics[0]}`
      });
    }
  }
}
