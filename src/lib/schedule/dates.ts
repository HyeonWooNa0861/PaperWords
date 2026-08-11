const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function resolveKstDate(input: Date | string | number = new Date()): string {
  if (typeof input === "string" && isoDatePattern.test(input)) {
    return input;
  }

  const instant = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError("Cannot resolve an invalid date to an Asia/Seoul calendar date");
  }

  return new Date(instant.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDaysKst(dateKst: string, days: number): string {
  return new Date(dateToUtcMs(dateKst) + days * DAY_MS).toISOString().slice(0, 10);
}

export function inclusiveDaysBetweenKst(startDateKst: string, endDateKst: string): number {
  return Math.floor((dateToUtcMs(endDateKst) - dateToUtcMs(startDateKst)) / DAY_MS) + 1;
}

function dateToUtcMs(dateKst: string): number {
  const [year, month, day] = dateKst.split("-").map(Number);

  if (!year || !month || !day) {
    throw new RangeError(`Invalid KST date: ${dateKst}`);
  }

  return Date.UTC(year, month - 1, day);
}
