import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, Calendar, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { ScheduledSession } from '@/types';

export default function ScheduleScreen() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);

  const durations = [5, 15, 30, 60];
  const times = ['07:00', '12:00', '18:00', '21:00'];

  const addSession = () => {
    Alert.alert(
      'Schedule Session',
      'Choose session details',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Add',
          onPress: () => {
            const newSession: ScheduledSession = {
              id: Date.now().toString(),
              time: times[Math.floor(Math.random() * times.length)],
              duration: durations[Math.floor(Math.random() * durations.length)],
              repeat: Math.random() > 0.5 ? 'daily' : 'once',
              enabled: true
            };
            setSessions(prev => [...prev, newSession]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      ]
    );
  };

  const toggleSession = (id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id
          ? { ...session, enabled: !session.enabled }
          : session
      )
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return React.createElement(
    LinearGradient,
    {
      colors: [Colors.personal.background, Colors.personal.surface],
      style: styles.container
    },
    React.createElement(ScrollView, { style: styles.content },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, "Nothing Scheduler"),
        React.createElement(TouchableOpacity, { style: styles.addButton, onPress: addSession },
          React.createElement(Plus, { size: 20, color: Colors.personal.background }),
          React.createElement(Text, { style: styles.addButtonText }, "Add Session")
        )
      ),

      sessions.length === 0 
        ? React.createElement(View, { style: styles.emptyState },
            React.createElement(Calendar, { size: 48, color: Colors.personal.textSecondary }),
            React.createElement(Text, { style: styles.emptyText }, "No scheduled sessions"),
            React.createElement(Text, { style: styles.emptySubtext },
              "Tap \"Add Session\" to schedule your focus time"
            )
          )
        : React.createElement(View, { style: styles.sessionsList },
            sessions.map((session) => 
              React.createElement(View, { key: session.id, style: styles.sessionCard },
                React.createElement(View, { style: styles.sessionInfo },
                  React.createElement(View, { style: styles.sessionTime },
                    React.createElement(Clock, { size: 16, color: Colors.personal.accent }),
                    React.createElement(Text, { style: styles.timeText }, session.time)
                  ),
                  React.createElement(Text, { style: styles.durationText }, `${session.duration} minutes`),
                  React.createElement(Text, { style: styles.repeatText },
                    session.repeat === 'daily' ? 'Daily' : 
                    session.repeat === 'weekdays' ? 'Weekdays' : 'Once'
                  )
                ),
                
                React.createElement(View, { style: styles.sessionActions },
                  React.createElement(TouchableOpacity,
                    { 
                      style: [
                        styles.toggleButton,
                        session.enabled ? styles.enabledButton : styles.disabledButton
                      ],
                      onPress: () => toggleSession(session.id)
                    },
                    React.createElement(Text, { 
                      style: [
                        styles.toggleText,
                        session.enabled ? styles.enabledText : styles.disabledText
                      ]
                    }, session.enabled ? 'ON' : 'OFF')
                  ),
                  
                  React.createElement(TouchableOpacity,
                    {
                      style: styles.deleteButton,
                      onPress: () => deleteSession(session.id)
                    },
                    React.createElement(Trash2, { size: 16, color: Colors.common.error })
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
});