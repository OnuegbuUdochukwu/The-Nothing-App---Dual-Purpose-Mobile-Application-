import {
  buildPreNotificationTrigger,
  buildNotificationTrigger,
} from '../utils/scheduleUtils';

describe('buildPreNotificationTrigger', () => {
  it('computes daily pre-notice hour/minute correctly when offset does not borrow an hour', () => {
    const t = buildPreNotificationTrigger(
      '09:10',
      'daily',
      undefined,
      undefined,
      5
    ) as any;
    expect(t.repeats).toBe(true);
    expect(t.hour).toBe(9);
    expect(t.minute).toBe(5);
  });

  it('computes daily pre-notice that borrows hour when minutes < offset', () => {
    const t = buildPreNotificationTrigger(
      '09:02',
      'daily',
      undefined,
      undefined,
      5
    ) as any;
    expect(t.repeats).toBe(true);
    // should borrow to 08:(60 - 3) => 08:57
    expect(t.hour).toBe(8);
    expect(t.minute).toBe(57);
  });

  it('computes absolute date pre-notice for once', () => {
    const now = new Date(2025, 8, 16, 8, 0, 0);
    const main = buildNotificationTrigger('09:00', 'once', now) as any;
    const pre = buildPreNotificationTrigger(
      '09:00',
      'once',
      now,
      undefined,
      5
    ) as any;
    const mainDate = (main as any).date as Date;
    const preDate = pre.date as Date;
    expect(Math.round((mainDate.getTime() - preDate.getTime()) / 60000)).toBe(
      5
    );
  });
});
