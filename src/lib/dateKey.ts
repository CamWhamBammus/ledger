/**
 * Local calendar-day key, e.g. "2026-08-12" — the single source of truth
 * for "which day does this belong to." Tasks and events are bucketed by
 * this key rather than by comparing raw DateTimes, so a stored time
 * component (or lack of one) never shifts something into the wrong day.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Parses a "YYYY-MM-DD" key back into a local midnight Date. */
export function dateKeyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
