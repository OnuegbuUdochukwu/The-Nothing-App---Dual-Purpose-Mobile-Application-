import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppMode } from '@/hooks/useAppMode';
import { AppMode } from '@/types';

export default function IndexScreen() {
  const { mode, saveMode, isLoading } = useAppMode();

  const handleModeSelect = (selectedMode: AppMode) => {
    saveMode(selectedMode);
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.loadingContainer}
      />
    );
  }

  if (mode) {
    return <Redirect href="/(tabs)" />;
  }

  return <OnboardingScreen onModeSelect={handleModeSelect} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
});