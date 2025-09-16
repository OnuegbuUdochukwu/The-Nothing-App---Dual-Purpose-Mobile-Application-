import { FocusSession } from '@/types';

export function totalPerDay(sessions: FocusSession[], date: Date) {
  const target = date.toISOString().slice(0, 10);
  return sessions
    .filter((s) => s.startTime.toISOString().slice(0, 10) === target && s.completed)
    .reduce((acc, s) => acc + s.duration, 0);
}

export function totalPerWeek(sessions: FocusSession[], weekStart: Date) {
  // weekStart is assumed to be start of week (Sunday) in UTC
  const start = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate()));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 7));

  return sessions
    .filter((s) => s.completed && s.startTime.getTime() >= start.getTime() && s.startTime.getTime() < end.getTime())
    .reduce((acc, s) => acc + s.duration, 0);
}

export function totalPerMonth(sessions: FocusSession[], monthStart: Date) {
  const start = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));

  return sessions
    .filter((s) => s.completed && s.startTime.getTime() >= start.getTime() && s.startTime.getTime() < end.getTime())
    .reduce((acc, s) => acc + s.duration, 0);
}

export function streak(sessions: FocusSession[], asOf: Date = new Date()) {
  // Work in UTC to avoid local timezone issues
  const dates = new Set(
    sessions.filter((s) => s.completed).map((s) => s.startTime.toISOString().slice(0, 10))
  );

  let count = 0;
  // cursor at UTC midnight of asOf
  let cursor = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (dates.has(key)) {
      count++;
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() - 1));
    } else break;
  }
  return count;
}

export default { totalPerDay, totalPerWeek, totalPerMonth, streak };
