import React, { useState } from 'react';
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
          style: 'cancel',
        },
        {
          text: 'Quick Add',
          onPress: () => {
            const newSession: ScheduledSession = {
              id: Date.now().toString(),
              time: times[0],
              duration: durations[0],
              repeat: 'daily',
              enabled: true,
            };
            setSessions(prev => [...prev, newSession]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
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

  return (
    <LinearGradient
      colors={[Colors.personal.background, Colors.personal.surface]}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nothing Scheduler</Text>
          <TouchableOpacity style={styles.addButton} onPress={addSession}>
            <Plus size={20} color={Colors.personal.background} />
            <Text style={styles.addButtonText}>Add Session</Text>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.personal.textSecondary} />
            <Text style={styles.emptyText}>No scheduled sessions</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Session" to schedule your focus time
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionTime}>
                    <Clock size={16} color={Colors.personal.accent} />
                    <Text style={styles.timeText}>{session.time}</Text>
                  </View>
                  <Text style={styles.durationText}>{session.duration} minutes</Text>
                  <Text style={styles.repeatText}>
                    {session.repeat === 'daily' ? 'Daily' : 
                     session.repeat === 'weekdays' ? 'Weekdays' : 'Once'}
                  </Text>
                </View>
                
                <View style={styles.sessionActions}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      session.enabled ? styles.enabledButton : styles.disabledButton
                    ]}
                    onPress={() => toggleSession(session.id)}
                  >
                    <Text style={[
                      styles.toggleText,
                      session.enabled ? styles.enabledText : styles.disabledText
                    ]}>
                      {session.enabled ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteSession(session.id)}
                  >
                    <Trash2 size={16} color={Colors.common.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.personal.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.personal.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.personal.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.personal.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.personal.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: Colors.personal.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.personal.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.personal.text,
  },
  durationText: {
    fontSize: 14,
    color: Colors.personal.textSecondary,
    marginBottom: 2,
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
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
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
    color: Colors.personal.background,
  },
  disabledText: {
    color: Colors.personal.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
});