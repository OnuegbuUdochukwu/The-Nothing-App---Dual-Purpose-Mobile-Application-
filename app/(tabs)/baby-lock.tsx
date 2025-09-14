import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Clock as Unlock, Timer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function BabyLockScreen() {
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(10); // minutes
  const [unlockAttempts, setUnlockAttempts] = useState(0);

  const durations = [5, 10, 15, 20];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLocked && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsLocked(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Baby Time Complete', 'Baby mode session has ended.');
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
  }, [isLocked, timeLeft]);

  const startBabyMode = () => {
    setTimeLeft(selectedDuration * 60);
    setIsLocked(true);
    setUnlockAttempts(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleUnlockAttempt = () => {
    setUnlockAttempts(prev => prev + 1);
    
    if (unlockAttempts >= 2) { // Three taps total
      Alert.alert(
        'Parent Unlock',
        'Hold the unlock button for 3 seconds to exit Baby Mode.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock',
            style: 'destructive',
            onPress: () => {
              setIsLocked(false);
              setTimeLeft(0);
              setUnlockAttempts(0);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            },
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <LinearGradient
        colors={[Colors.baby.yellow, Colors.baby.blue]}
        style={styles.lockedContainer}
      >
        <TouchableOpacity
          style={styles.lockedContent}
          onPress={handleUnlockAttempt}
          activeOpacity={1}
        >
          <View style={styles.lockIcon}>
            <Lock size={48} color={Colors.common.white} />
          </View>
          <Text style={styles.lockedTitle}>Baby Mode Active</Text>
          <Text style={styles.timeDisplay}>{formatTime(timeLeft)}</Text>
          <Text style={styles.unlockHint}>
            {unlockAttempts === 0 && "Tap 3 times in corner to unlock"}
            {unlockAttempts === 1 && "Tap 2 more times..."}
            {unlockAttempts === 2 && "Tap 1 more time..."}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.common.white, Colors.baby.surface]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Unlock size={48} color={Colors.baby.blue} />
          <Text style={styles.title}>Baby Lock</Text>
          <Text style={styles.subtitle}>Safe digital space for little ones</Text>
        </View>
        
        <View style={styles.durationSection}>
          <Text style={styles.sectionTitle}>Session Duration</Text>
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
                <Timer size={20} color={
                  selectedDuration === duration ? Colors.common.white : Colors.baby.blue
                } />
                <Text style={[
                  styles.durationText,
                  selectedDuration === duration && styles.selectedDurationText
                ]}>
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>Important:</Text>
          <Text style={styles.warningText}>
            • Baby Mode will lock your phone for the selected duration{'\n'}
            • Tap the corner 3 times to unlock early{'\n'}
            • Your phone will be safe from accidental calls or app switches
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={startBabyMode}
        >
          <Lock size={24} color={Colors.common.white} />
          <Text style={styles.startButtonText}>Start Baby Mode</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContent: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  lockIcon: {
    marginBottom: 32,
  },
  lockedTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.common.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  timeDisplay: {
    fontSize: 64,
    fontWeight: '300',
    color: Colors.common.white,
    marginBottom: 32,
  },
  unlockHint: {
    fontSize: 16,
    color: Colors.common.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.baby.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.baby.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  durationSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.baby.text,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.common.white,
    borderWidth: 2,
    borderColor: Colors.baby.blue,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  selectedDuration: {
    backgroundColor: Colors.baby.blue,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.baby.blue,
  },
  selectedDurationText: {
    color: Colors.common.white,
  },
  warningSection: {
    backgroundColor: Colors.baby.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.baby.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.baby.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.baby.blue,
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.common.white,
  },
});