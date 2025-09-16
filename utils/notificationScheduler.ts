import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ScheduledSession } from '@/types';
import {
  buildNotificationTrigger,
  buildPreNotificationTrigger,
  getNextOccurrence,
} from './scheduleUtils';

const SESSIONS_KEY = 'scheduledSessions';

/**
 * Schedule both pre-notice and main notification for a session and return ids
 */
export async function scheduleSessionNotifications(session: ScheduledSession) {
  // ensure permissions
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') throw new Error('notification-permission-denied');
  }

  const trigger: any = buildNotificationTrigger(session.time, session.repeat, undefined, session.days);
  const preTrigger: any = buildPreNotificationTrigger(session.time, session.repeat, undefined, session.days, 5);

  const preId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming Nothing Session',
      body: `Starting in 5 minutes: ${session.duration} minute session.`,
    },
    trigger: preTrigger,
  });

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nothing Session',
      body: `Your scheduled Nothing session (${session.duration} min) is starting.`,
    },
    trigger,
  });

  return { id, preId };
}

/**
 * Cancel both notification ids for a session (if present)
 */
export async function cancelSessionNotifications(session: ScheduledSession) {
  try {
    if (session.notificationId) await Notifications.cancelScheduledNotificationAsync(session.notificationId);
    if (session.preNotificationId) await Notifications.cancelScheduledNotificationAsync(session.preNotificationId);
  } catch (e) {
    console.error('Failed to cancel session notifications', e);
  }
}

/**
 * Scan persisted scheduled sessions and (re)schedule notifications for enabled sessions
 * within the next `daysAhead` days. Returns number scheduled.
 */
export async function reschedulePersistedSessions(daysAhead = 7) {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return 0;
    const sessions: ScheduledSession[] = JSON.parse(raw) as ScheduledSession[];

    let count = 0;
    const now = new Date();
    const until = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    for (const s of sessions) {
      if (!s.enabled) continue;

      // compute next occurrence and skip if beyond 'until'
      const next = getNextOccurrence(s.time, s.repeat, now, s.days);
      if (next > until) continue;

      // cancel prior notifications if any
      try {
        if (s.notificationId) await Notifications.cancelScheduledNotificationAsync(s.notificationId);
        if (s.preNotificationId) await Notifications.cancelScheduledNotificationAsync(s.preNotificationId);
      } catch (e) {
        // ignore cancel errors
      }

      try {
        const ids = await scheduleSessionNotifications(s);
        // persist ids back into storage
        s.notificationId = (ids as any).id;
        s.preNotificationId = (ids as any).preId;
        count += 1;
      } catch (e) {
        // permission denied or schedule failed; skip
        console.error('Failed to schedule persisted session', e);
      }
    }

    // write back updated sessions (with ids)
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return count;
  } catch (e) {
    console.error('reschedulePersistedSessions error', e);
    return 0;
  }
}

export default {
  scheduleSessionNotifications,
  cancelSessionNotifications,
  reschedulePersistedSessions,
};
