import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Baby } from 'lucide-react-native';
import { AppMode } from '@/types';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onModeSelect: (mode: AppMode) => void;
}

export default function OnboardingScreen({ onModeSelect }: OnboardingScreenProps) {
  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Nothing</Text>
        <Text style={styles.subtitle}>Choose your experience</Text>
        
        <View style={styles.modesContainer}>
          <TouchableOpacity 
            style={[styles.modeCard, styles.personalCard]}
            onPress={() => onModeSelect('personal')}
            activeOpacity={0.8}
          >
            <User size={48} color={Colors.personal.accent} />
            <Text style={styles.modeTitle}>Personal Mode</Text>
            <Text style={styles.modeDescription}>
              Focus, wellness, and distraction-free time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeCard, styles.babyCard]}
            onPress={() => onModeSelect('baby')}
            activeOpacity={0.8}
          >
            <Baby size={48} color={Colors.baby.blue} />
            <Text style={[styles.modeTitle, { color: Colors.baby.text }]}>Baby Mode</Text>
            <Text style={[styles.modeDescription, { color: Colors.baby.textSecondary }]}>
              Safe digital space for little ones
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '300',
    color: Colors.common.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.personal.textSecondary,
    marginBottom: 64,
    textAlign: 'center',
  },
  modesContainer: {
    width: '100%',
    gap: 24,
  },
  modeCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  personalCard: {
    backgroundColor: Colors.personal.surface,
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  babyCard: {
    backgroundColor: Colors.common.white,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.common.white,
    marginTop: 16,
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 16,
    color: Colors.personal.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});