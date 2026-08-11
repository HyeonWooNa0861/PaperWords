import { loadPublishedContent } from "@/src/lib/content/registry";
import { resolveKstDate } from "./dates";
import type { PublishedContentRegistry } from "@/src/lib/content/registry";
import type { ScheduleEntry, ScheduleRecord, TermRecord } from "@/src/lib/content/schemas";

export { addDaysKst, inclusiveDaysBetweenKst, resolveKstDate } from "./dates";
export { validateScheduleIntegrity, type ScheduleValidationIssue } from "./validation";

export interface ScheduledTermResult {
  dateKst: string;
  entry: ScheduleEntry;
  term: TermRecord;
  schedule: ScheduleRecord;
}

export function getScheduleEntryForDate(
  schedule: ScheduleRecord,
  input: Date | string | number = new Date()
): ScheduleEntry | undefined {
  const dateKst = resolveKstDate(input);
  return schedule.entries.find((entry) => entry.dateKst === dateKst);
}

export function getScheduledTermForDate(
  registry: PublishedContentRegistry = loadPublishedContent(),
  input: Date | string | number = new Date()
): ScheduledTermResult | undefined {
  if (!registry.schedule) {
    return undefined;
  }

  const dateKst = resolveKstDate(input);
  const entry = registry.schedule.entries.find((candidate) => candidate.dateKst === dateKst);
  if (!entry) {
    return undefined;
  }

  const term = registry.terms.find((candidate) => candidate.slug === entry.termSlug);
  if (!term) {
    return undefined;
  }

  return {
    dateKst,
    entry,
    term,
    schedule: registry.schedule
  };
}
