import { totalPerDay, totalPerWeek, totalPerMonth, streak } from '@/utils/insights';
import { FocusSession } from '@/types';

function makeSession(dateStr: string, duration: number, completed = true): FocusSession {
  return {
    id: dateStr + '-' + duration,
    duration,
    startTime: new Date(dateStr),
    completed,
  } as any;
}

describe('insights utilities', () => {
  const sessions: FocusSession[] = [
    makeSession('2025-09-14T09:00:00Z', 30),
    makeSession('2025-09-14T18:00:00Z', 15, false),
    makeSession('2025-09-13T10:00:00Z', 20),
    makeSession('2025-09-12T10:00:00Z', 25),
    makeSession('2025-08-20T10:00:00Z', 60),
  ];

  test('totalPerDay counts completed only', () => {
    const total = totalPerDay(sessions, new Date('2025-09-14'));
    expect(total).toBe(30);
  });

  test('totalPerWeek sums correct week', () => {
  // week starting 2025-09-07 (Sunday UTC) -- includes 2025-09-12 and 2025-09-13
  const weekStart = new Date(Date.UTC(2025, 8, 7));
  const total = totalPerWeek(sessions, weekStart);
  expect(total).toBe(20 + 25);
  });

  test('totalPerMonth sums month', () => {
    const monthStart = new Date('2025-09-01T00:00:00Z');
    const total = totalPerMonth(sessions, monthStart);
    expect(total).toBe(30 + 20 + 25);
  });

  test('streak counts consecutive days', () => {
    const asOf = new Date('2025-09-14T12:00:00Z');
    expect(streak(sessions, asOf)).toBe(3);
  });
});
