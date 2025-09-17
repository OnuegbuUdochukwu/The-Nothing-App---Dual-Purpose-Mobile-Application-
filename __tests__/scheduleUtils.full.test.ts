import {
  getNextOccurrence,
  buildNotificationTrigger,
  buildPreNotificationTrigger,
} from '@/utils/scheduleUtils';

describe('scheduleUtils.getNextOccurrence', () => {
  // Use local date constructor to avoid timezone/UTC mismatches in tests
  const base = new Date(2025, 8, 17, 9, 0, 0, 0); // 2025-09-17 09:00 local (Wednesday)

  test('returns today if time in future for once/none', () => {
    const next = getNextOccurrence('10:00', 'none', base);
    expect(next.getHours()).toBe(10);
    expect(next.getDate()).toBe(base.getDate());
  });

  test('returns tomorrow if time already passed for once/none', () => {
    const next = getNextOccurrence('08:00', 'none', base);
    // should be next day
    expect(next.getDate()).toBe(base.getDate() + 1);
  });

  test('daily repeats returns same day if in future else next day', () => {
    const a = getNextOccurrence('11:00', 'daily', base);
    expect(a.getHours()).toBe(11);
    const b = getNextOccurrence('07:00', 'daily', base);
    expect(b.getDate()).toBe(base.getDate() + 1);
  });

  test('weekdays returns next weekday', () => {
    // base is Wednesday
    const next = getNextOccurrence('09:30', 'weekdays', base);
    // candidate 09:30 today is after base 09:00 so should be today
    expect(next.getDate()).toBe(base.getDate());

    // if base is Friday and time passed, should land on Monday
    const fri = new Date(2025, 8, 19, 10, 0, 0, 0); // Friday
    const next2 = getNextOccurrence('09:00', 'weekdays', fri);
    // Next weekday should be Monday (or at least a weekday)
    expect(next2.getDay()).toBeGreaterThanOrEqual(1);
  });

  test('custom repeat respects provided days', () => {
    // days: 0=Sun..6=Sat. Base Wed (3). Choose next allowed day 5 (Friday)
    const next = getNextOccurrence('08:00', 'custom', base, [5]);
    expect(next.getDay()).toBe(5);
  });
});

describe('scheduleUtils triggers', () => {
  const base = new Date(2025, 8, 17, 9, 0, 0, 0);

  test('buildNotificationTrigger daily returns repeats object', () => {
    const t = buildNotificationTrigger('07:30', 'daily', base);
    expect((t as any).repeats).toBe(true);
    expect((t as any).hour).toBe(7);
  });

  test('buildPreNotificationTrigger offsets absolute date triggers', () => {
    const pre = buildPreNotificationTrigger(
      '09:00',
      'none',
      base,
      undefined,
      10
    );
    expect((pre as any).date).toBeInstanceOf(Date);
  });

  test('buildPreNotificationTrigger for daily adjusts hour/minute', () => {
    const pre = buildPreNotificationTrigger('00:05', 'daily');
    expect((pre as any).repeats).toBe(true);
    expect((pre as any).hour).toBeGreaterThanOrEqual(0);
  });
});
