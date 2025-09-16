import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, Calendar, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { ScheduledSession } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { buildNotificationTrigger, buildPreNotificationTrigger } from '@/utils/scheduleUtils';
import PermissionsModal from '@/components/PermissionsModal';
import WeekdaySelector from '@/components/WeekdaySelector';

const SESSIONS_KEY = 'scheduledSessions';

export default function ScheduleScreen() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);

  React.useEffect(() => {
    // Load persisted sessions
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSIONS_KEY);
        if (raw) setSessions(JSON.parse(raw));
      } catch (e) {
        console.error('Error loading scheduled sessions', e);
      }
    })();

    // determine notification permission state for header UI
    (async () => {
      try {
        const p = await Notifications.getPermissionsAsync();
        setNotifStatus(p.status || 'unknown');
      } catch (e) {
        setNotifStatus('unknown');
      }
    })();
  }, []);

  React.useEffect(() => {
    // Persist sessions whenever they change
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)).catch((e) =>
      console.error('Error saving scheduled sessions', e)
    );
  }, [sessions]);

  const scheduleNotificationForSession = async (session: ScheduledSession) => {
    try {
      // Ensure we have permission before scheduling
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        // Prompt permissions request
        const req = await Notifications.requestPermissionsAsync();
        if (req.status !== 'granted') {
          // Permission denied — throw so callers can show friendly UI
          throw new Error('notification-permission-denied');
        }
      }
      // Parse HH:mm to a Date for next occurrence
      const trigger: any = buildNotificationTrigger(
        session.time,
        session.repeat,
        undefined,
        session.days
      );

      // also schedule a pre-notification (5 minutes before)
      const preTrigger: any = buildPreNotificationTrigger(
        session.time,
        session.repeat,
        undefined,
        session.days,
        5
      );

      const preId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming Nothing Session',
          body: `Starting in 5 minutes: ${session.duration} minute session.`,
        },
        trigger: preTrigger,
      });

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nothing Session',
          body: `Your scheduled Nothing session (${session.duration} min) is starting.`,
        },
        trigger,
      });

      return { id: identifier, preId };
    } catch (e) {
      console.error('Failed to schedule notification', e);
      return null;
    }
  };

  const cancelNotification = async (identifier?: string) => {
    try {
      if (identifier)
        await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
      console.error('Failed to cancel notification', e);
    }
  };

  const durations = [5, 15, 30, 60];
  const times = ['07:00', '12:00', '18:00', '21:00'];

  const [notifStatus, setNotifStatus] = React.useState<string>('unknown');

  const addSession = () => {
    // Show inline creation sheet
    setCreating(true);
  };

  const [creating, setCreating] = React.useState(false);
  const [createRepeat, setCreateRepeat] =
    React.useState<ScheduledSession['repeat']>('once');
  const [createDays, setCreateDays] = React.useState<number[]>([]);

  const finishCreate = async () => {
    const newSession: ScheduledSession = {
      id: Date.now().toString(),
      time: times[Math.floor(Math.random() * times.length)],
      duration: durations[Math.floor(Math.random() * durations.length)],
      repeat: createRepeat,
      enabled: true,
      days: createRepeat === 'custom' ? createDays : undefined,
    };

    try {
      const ids = await scheduleNotificationForSession(newSession);
      if (ids) {
        newSession.notificationId = (ids as any).id || undefined;
        newSession.preNotificationId = (ids as any).preId || undefined;
      }
      setSessions((prev) => [...prev, newSession]);
      setCreating(false);
      setCreateRepeat('once');
      setCreateDays([]);
    } catch (err: any) {
      if (err?.message === 'notification-permission-denied') {
        setShowPermissionModal(true);
      }
      console.error('create session failed', err);
    }
  };

  const toggleSession = (id: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== id) return session;
        const updated = { ...session, enabled: !session.enabled };
        // cancel or schedule notification accordingly
        if (!updated.enabled) {
          cancelNotification(updated.notificationId).catch(() => null);
          cancelNotification(updated.preNotificationId).catch(() => null);
          updated.notificationId = undefined;
          updated.preNotificationId = undefined;
        } else {
          (async () => {
            try {
              const ids = await scheduleNotificationForSession(updated);
              if (ids) {
                updated.notificationId = (ids as any).id || undefined;
                updated.preNotificationId = (ids as any).preId || undefined;
              }
            } catch (err: any) {
              if (err?.message === 'notification-permission-denied') {
                setShowPermissionModal(true);
                updated.enabled = false;
              }
            }
          })();
        }
        return updated;
      })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const [showPermissionModal, setShowPermissionModal] = React.useState(false);

  const deleteSession = (id: string) => {
    const toDelete = sessions.find((s) => s.id === id);
    if (toDelete?.notificationId)
      cancelNotification(toDelete.notificationId).catch(() => null);
    if (toDelete?.preNotificationId)
      cancelNotification(toDelete.preNotificationId).catch(() => null);
    setSessions((prev) => prev.filter((session) => session.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return React.createElement(
    LinearGradient,
    {
      colors: [Colors.personal.background, Colors.personal.surface],
      style: styles.container,
    },
    React.createElement(
      ScrollView,
      { style: styles.content },
      creating &&
        React.createElement(
          View,
          { style: styles.createSheet },
          React.createElement(
            Text,
            { style: styles.createTitle },
            'New Session'
          ),
          React.createElement(
            View,
            { style: { flexDirection: 'row', gap: 8, marginTop: 8 } },
            React.createElement(
              TouchableOpacity,
              {
                style: [
                  styles.smallBtn,
                  createRepeat === 'once' ? styles.primarySmall : null,
                ],
                onPress: () => setCreateRepeat('once'),
              },
              React.createElement(Text, null, 'Once')
            ),
            React.createElement(
              TouchableOpacity,
              {
                style: [
                  styles.smallBtn,
                  createRepeat === 'daily' ? styles.primarySmall : null,
                ],
                onPress: () => setCreateRepeat('daily'),
              },
              React.createElement(Text, null, 'Daily')
            ),
            React.createElement(
              TouchableOpacity,
              {
                style: [
                  styles.smallBtn,
                  createRepeat === 'weekdays' ? styles.primarySmall : null,
                ],
                onPress: () => setCreateRepeat('weekdays'),
              },
              React.createElement(Text, null, 'Weekdays')
            ),
            React.createElement(
              TouchableOpacity,
              {
                style: [
                  styles.smallBtn,
                  createRepeat === 'custom' ? styles.primarySmall : null,
                ],
                onPress: () => setCreateRepeat('custom'),
              },
              React.createElement(Text, null, 'Custom')
            )
          ),
          createRepeat === 'custom' &&
            React.createElement(WeekdaySelector, {
              selected: createDays,
              onChange: (d: number[]) => setCreateDays(d),
            }),
          React.createElement(
            View,
            { style: { flexDirection: 'row', marginTop: 12, gap: 8 } },
            React.createElement(
              TouchableOpacity,
              { style: styles.smallBtn, onPress: () => setCreating(false) },
              React.createElement(Text, null, 'Cancel')
            ),
            React.createElement(
              TouchableOpacity,
              {
                style: [styles.smallBtn, styles.primarySmall],
                onPress: finishCreate,
              },
              React.createElement(Text, null, 'Create')
            )
          )
        ),
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'Nothing Scheduler'),
        React.createElement(
          View,
          { style: { flexDirection: 'row', gap: 8 } },
          notifStatus !== 'granted' &&
            React.createElement(
              TouchableOpacity,
              {
                style: [styles.smallBtn, { marginRight: 8 }],
                onPress: async () => {
                  const r = await Notifications.requestPermissionsAsync();
                  setNotifStatus(r.status || 'unknown');
                },
              },
              React.createElement(
                Text,
                { style: { color: Colors.common.white } },
                'Enable Notifications'
              )
            ),
          React.createElement(
            TouchableOpacity,
            { style: styles.addButton, onPress: addSession },
            React.createElement(Plus, {
              size: 20,
              color: Colors.personal.background,
            }),
            React.createElement(
              Text,
              { style: styles.addButtonText },
              'Add Session'
            )
          )
        )
      ),

      sessions.length === 0
        ? React.createElement(
            View,
            { style: styles.emptyState },
            React.createElement(Calendar, {
              size: 48,
              color: Colors.personal.textSecondary,
            }),
            React.createElement(
              Text,
              { style: styles.emptyText },
              'No scheduled sessions'
            ),
            React.createElement(
              Text,
              { style: styles.emptySubtext },
              'Tap "Add Session" to schedule your focus time'
            )
          )
        : React.createElement(
            View,
            { style: styles.sessionsList },
            sessions.map((session) =>
              React.createElement(
                View,
                { key: session.id, style: styles.sessionCard },
                React.createElement(
                  View,
                  { style: styles.sessionInfo },
                  React.createElement(
                    View,
                    { style: styles.sessionTime },
                    React.createElement(Clock, {
                      size: 16,
                      color: Colors.personal.accent,
                    }),
                    React.createElement(
                      Text,
                      { style: styles.timeText },
                      session.time
                    )
                  ),
                  React.createElement(
                    Text,
                    { style: styles.durationText },
                    `${session.duration} minutes`
                  ),
                  React.createElement(
                    Text,
                    { style: styles.repeatText },
                    session.repeat === 'daily'
                      ? 'Daily'
                      : session.repeat === 'weekdays'
                      ? 'Weekdays'
                      : 'Once'
                  )
                ),

                React.createElement(
                  View,
                  { style: styles.sessionActions },
                  showPermissionModal &&
                    React.createElement(PermissionsModal, {
                      visible: showPermissionModal,
                      title: 'Notification permission required',
                      message:
                        'Scheduling requires notifications permission. Please enable notifications in Settings.',
                      onRequestClose: () => setShowPermissionModal(false),
                    }),
                  React.createElement(
                    TouchableOpacity,
                    {
                      style: [
                        styles.toggleButton,
                        session.enabled
                          ? styles.enabledButton
                          : styles.disabledButton,
                      ],
                      onPress: () => toggleSession(session.id),
                    },
                    React.createElement(
                      Text,
                      {
                        style: [
                          styles.toggleText,
                          session.enabled
                            ? styles.enabledText
                            : styles.disabledText,
                        ],
                      },
                      session.enabled ? 'ON' : 'OFF'
                    )
                  ),

                  React.createElement(
                    TouchableOpacity,
                    {
                      style: styles.deleteButton,
                      onPress: () => deleteSession(session.id),
                    },
                    React.createElement(Trash2, {
                      size: 16,
                      color: Colors.common.error,
                    })
                  )
                )
              )
            )
          )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.personal.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.personal.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: Colors.personal.background,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.personal.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.personal.textSecondary,
    textAlign: 'center',
  },
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: Colors.personal.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  sessionInfo: {
    flex: 1,
    gap: 8,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.personal.text,
  },
  durationText: {
    fontSize: 14,
    color: Colors.personal.text,
  },
  repeatText: {
    fontSize: 12,
    color: Colors.personal.textSecondary,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  enabledButton: {
    backgroundColor: Colors.personal.accent,
  },
  disabledButton: {
    backgroundColor: Colors.personal.border,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  enabledText: {
    color: Colors.common.white,
  },
  disabledText: {
    color: Colors.personal.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  createSheet: {
    backgroundColor: Colors.personal.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.personal.text,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.personal.background,
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  primarySmall: {
    backgroundColor: Colors.personal.accent,
  },
});
