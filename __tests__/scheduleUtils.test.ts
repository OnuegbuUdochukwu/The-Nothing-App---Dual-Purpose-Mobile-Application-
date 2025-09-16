import { getNextOccurrence } from '../utils/scheduleUtils';

describe('getNextOccurrence', () => {
  it('schedules once for later today', () => {
    // local time: 2025-09-16 08:00
    const now = new Date(2025, 8, 16, 8, 0, 0);
    const next = getNextOccurrence('09:00', 'once', now);
    expect(next.getHours()).toBe(9);
    expect(next.getDate()).toBe(16);
  });

  it('schedules once for tomorrow if time passed', () => {
    // local time: 2025-09-16 10:00
    const now = new Date(2025, 8, 16, 10, 0, 0);
    const next = getNextOccurrence('09:00', 'once', now);
    expect(next.getDate()).toBe(17);
  });

  it('schedules daily next occurrence', () => {
    const now = new Date(2025, 8, 16, 10, 0, 0);
    const next = getNextOccurrence('11:00', 'daily', now);
    expect(next.getDate()).toBe(16);
  });

  it('schedules weekdays correctly', () => {
    // 2025-09-20 is Saturday
    const now = new Date(2025, 8, 20, 10, 0, 0);
    const next = getNextOccurrence('09:00', 'weekdays', now);
    // Next weekday should be Monday (22nd)
    expect(next.getDate()).toBe(22);
  });

  it('schedules custom days', () => {
    // now is Sunday 2025-09-21
    const now = new Date(2025, 8, 21, 8, 0, 0);
    // choose Monday (1) and Wednesday (3)
    const next = getNextOccurrence('09:00', 'custom', now, [1, 3]);
    // Should schedule Monday 22nd
    expect(next.getDate()).toBe(22);
  });
});
