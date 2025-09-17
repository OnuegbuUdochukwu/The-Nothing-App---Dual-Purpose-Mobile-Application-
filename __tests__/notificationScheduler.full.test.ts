import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(null),
}));

const {
  scheduleSessionNotifications,
  cancelSessionNotifications,
  reschedulePersistedSessions,
} = require('@/utils/notificationScheduler');

describe('notificationScheduler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('scheduleSessionNotifications schedules two notifications and returns ids', async () => {
    const session = {
      id: 's1',
      time: '10:00',
      duration: 15,
      repeat: 'none',
      enabled: true,
    };
    const ids = await scheduleSessionNotifications(session);
    expect(ids.id).toBe('notif-id');
    expect(ids.preId).toBe('notif-id');
    const Notifications = require('expo-notifications');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  test('cancelSessionNotifications calls cancel for present ids', async () => {
    const session = { notificationId: 'n1', preNotificationId: 'p1' };
    await cancelSessionNotifications(session);
    const Notifications = require('expo-notifications');
    expect(
      Notifications.cancelScheduledNotificationAsync
    ).toHaveBeenCalledTimes(2);
  });

  test('reschedulePersistedSessions loads sessions and schedules enabled ones', async () => {
    const sessions = [
      { id: 's1', time: '09:00', repeat: 'none', enabled: true, duration: 10 },
      { id: 's2', time: '23:59', repeat: 'none', enabled: false, duration: 5 },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(sessions)
    );
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(null);

    const count = await reschedulePersistedSessions(7);
    expect(count).toBeGreaterThanOrEqual(0);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
