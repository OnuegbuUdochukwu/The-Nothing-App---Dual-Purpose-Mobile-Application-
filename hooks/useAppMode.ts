import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode } from '@/types';

const APP_MODE_KEY = '@nothing_app_mode';

export function useAppMode() {
  const [mode, setMode] = useState<AppMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(APP_MODE_KEY);
      if (savedMode) {
        setMode(savedMode as AppMode);
      }
    } catch (error) {
      console.error('Error loading app mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMode = async (newMode: AppMode) => {
    try {
      await AsyncStorage.setItem(APP_MODE_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Error saving app mode:', error);
    }
  };

  return { mode, saveMode, isLoading };
}