// Mock AsyncStorage and expo-notifications before requiring the module under test
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const Notifications = require('expo-notifications');
const { reschedulePersistedSessions } = require('../utils/notificationScheduler');

describe('reschedulePersistedSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('schedules enabled sessions within window and persists ids', async () => {
    const session = {
      id: 's1',
      time: '09:00',
      duration: 15,
      repeat: 'once',
      enabled: true,
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([session]));

    // mock scheduleNotificationAsync to return incremental ids
    let counter = 1;
    (Notifications.scheduleNotificationAsync as jest.Mock).mockImplementation(async () => {
      return `id-${counter++}`;
    });

    const scheduled = await reschedulePersistedSessions(7);
    expect(scheduled).toBeGreaterThanOrEqual(1);
    // ensure AsyncStorage.setItem called to persist ids
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    // scheduleNotificationAsync called at least twice (pre + main)
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('skips disabled sessions', async () => {
    const session = {
      id: 's2',
      time: '09:00',
      duration: 15,
      repeat: 'once',
      enabled: false,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([session]));

    const scheduled = await reschedulePersistedSessions(7);
    expect(scheduled).toBe(0);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
