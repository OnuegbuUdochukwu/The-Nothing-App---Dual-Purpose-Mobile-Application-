jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

import wellnessService from '@/utils/wellnessService';

describe('wellnessService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads and parses sessions correctly', async () => {
    const raw = [
      { id: '1', duration: 30, startTime: '2025-09-14T09:00:00Z', completed: true },
      { id: '2', duration: 20, startTime: '2025-09-13T10:00:00Z', completed: true },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(raw));

    const sessions = await wellnessService.loadFocusSessions();
    expect(sessions.length).toBe(2);
    expect(sessions[0].startTime instanceof Date).toBeTruthy();
  });

  it('calculates totals and streaks', async () => {
    const raw = [
      { id: '1', duration: 30, startTime: '2025-09-14T09:00:00Z', completed: true },
      { id: '2', duration: 20, startTime: '2025-09-13T10:00:00Z', completed: true },
      { id: '3', duration: 25, startTime: '2025-09-12T10:00:00Z', completed: true },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(raw));

    const dayTotal = await wellnessService.getTotalForDay(new Date('2025-09-14'));
    expect(dayTotal).toBe(30);

  const weekStart = new Date(Date.UTC(2025, 8, 7));
  const weekTotal = await wellnessService.getTotalForWeek(weekStart);
  // week starting 2025-09-07 includes 2025-09-12 and 2025-09-13 but not 2025-09-14
  expect(weekTotal).toBe(20 + 25);

    const streak = await wellnessService.getStreak(new Date('2025-09-14T12:00:00Z'));
    expect(streak).toBe(3);
  });
});
