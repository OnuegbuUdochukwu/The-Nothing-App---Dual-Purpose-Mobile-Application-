import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

export default function FocusScreen() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5); // minutes

  const durations = [5, 15, 30, 60];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Session Complete', 'Well done! You completed your focus session.');
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startSession = () => {
    setTimeLeft(selectedDuration * 60);
    setIsActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopSession = () => {
    setIsActive(false);
    setTimeLeft(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isActive) {
    return (
      <View style={styles.activeContainer}>
        <TouchableOpacity 
          style={styles.timeDisplay}
          onPress={stopSession}
          onLongPress={stopSession}
          activeOpacity={1}
        >
          <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.escapeHint}>Tap & hold to exit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.personal.background, Colors.personal.surface]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Nothing Block</Text>
        <Text style={styles.subtitle}>Choose your focus duration</Text>
        
        <View style={styles.durationContainer}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.selectedDuration
              ]}
              onPress={() => {
                setSelectedDuration(duration);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.durationText,
                selectedDuration === duration && styles.selectedDurationText
              ]}>
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={startSession}
        >
          <Play size={24} color={Colors.personal.background} />
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeContainer: {
    flex: 1,
    backgroundColor: Colors.personal.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.personal.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.personal.textSecondary,
    marginBottom: 48,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  durationButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.personal.surface,
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  selectedDuration: {
    backgroundColor: Colors.personal.accent,
    borderColor: Colors.personal.accent,
  },
  durationText: {
    fontSize: 18,
    color: Colors.personal.text,
    fontWeight: '500',
  },
  selectedDurationText: {
    color: Colors.personal.background,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.personal.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.personal.background,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '200',
    color: Colors.personal.text,
    marginBottom: 32,
  },
  escapeHint: {
    fontSize: 16,
    color: Colors.personal.textSecondary,
    opacity: 0.6,
  },
});