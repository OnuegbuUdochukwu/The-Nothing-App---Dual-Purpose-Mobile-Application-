import { ScheduledSession } from '@/types';

/**
 * Return a Date representing the next occurrence for a given HH:mm time string
 * according to the repeat mode.
 * - 'once' or 'none': next occurrence (today if in future, otherwise tomorrow)
 * - 'daily': next occurrence today if in future, otherwise next day
 * - 'weekdays': next weekday (Mon-Fri) at the given time
 */
export function getNextOccurrence(
  time: string,
  repeat: ScheduledSession['repeat'],
  from?: Date,
  days?: number[]
) {
  const [hh, mm] = time.split(':').map((s) => parseInt(s, 10));
  const now = from ? new Date(from) : new Date();

  const candidate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh,
    mm,
    0,
    0
  );

  if (repeat === 'daily') {
    if (candidate > now) return candidate;
    candidate.setDate(candidate.getDate() + 1);
    return candidate;
  }

  if (repeat === 'weekdays') {
    // If candidate is in the future and a weekday, return it.
    const isWeekday = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
    if (candidate > now && isWeekday(candidate)) return candidate;

    // Otherwise iterate day-by-day until next weekday
    let next = new Date(candidate);
    // if candidate <= now, start from tomorrow
    if (next <= now) next.setDate(next.getDate() + 1);

    while (!isWeekday(next)) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  if (repeat === 'custom') {
    // days: array of weekday numbers 0=Sunday..6=Saturday
    const allowed = (days || []).slice().sort();
    if (allowed.length === 0) {
      // fallback to next occurrence
      if (candidate > now) return candidate;
      candidate.setDate(candidate.getDate() + 1);
      return candidate;
    }

    // If candidate is in the future and its weekday is allowed, return it
    if (candidate > now && allowed.includes(candidate.getDay()))
      return candidate;

    // Otherwise iterate day-by-day until we hit an allowed weekday
    const next = new Date(candidate);
    // start from tomorrow if candidate <= now
    if (next <= now) next.setDate(next.getDate() + 1);

    for (let i = 0; i < 14; i++) {
      if (allowed.includes(next.getDay())) return next;
      next.setDate(next.getDate() + 1);
    }

    // fallback
    if (candidate > now) return candidate;
    candidate.setDate(candidate.getDate() + 1);
    return candidate;
  }

  // 'once' | 'none' -> next occurrence (today if in future, else tomorrow)
  if (candidate > now) return candidate;
  candidate.setDate(candidate.getDate() + 1);
  return candidate;
}

/**
 * Build a notification trigger usable by expo-notifications scheduleNotificationAsync.
 * For simple date triggers we return { date: Date } and for repeating daily triggers
 * we return an object with repeats and hour/minute for expo.
 */
export function buildNotificationTrigger(
  time: string,
  repeat: ScheduledSession['repeat'],
  from?: Date,
  days?: number[]
) {
  const [hh, mm] = time.split(':').map((s) => parseInt(s, 10));

  if (repeat === 'daily') {
    return { hour: hh, minute: mm, repeats: true } as any;
  }

  if (repeat === 'custom') {
    const next = getNextOccurrence(time, repeat, from, days);
    return { date: next } as any;
  }

  // For 'weekdays' and 'once'/'none' we provide an absolute date
  const next = getNextOccurrence(time, repeat, from);
  return { date: next } as any;
}

export default {
  getNextOccurrence,
  buildNotificationTrigger,
};
