import AsyncStorage from '@react-native-async-storage/async-storage';
import { FocusSession } from '@/types';
import {
  totalPerDay,
  totalPerWeek,
  totalPerMonth,
  streak as computeStreak,
} from './insights';

const FOCUS_SESSIONS_KEY = 'focusSessions';

export async function loadFocusSessions(): Promise<FocusSession[]> {
  try {
    const raw = await AsyncStorage.getItem(FOCUS_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    // normalize startTime to Date objects
    return parsed.map((s) => ({
      id: s.id,
      duration: s.duration,
      startTime: new Date(s.startTime),
      completed: !!s.completed,
    })) as FocusSession[];
  } catch (e) {
    console.error('Failed to load focus sessions', e);
    return [];
  }
}

export async function getTotalForDay(date: Date) {
  const sessions = await loadFocusSessions();
  return totalPerDay(sessions, date);
}

export async function getTotalForWeek(weekStart: Date) {
  const sessions = await loadFocusSessions();
  return totalPerWeek(sessions, weekStart);
}

export async function getTotalForMonth(monthStart: Date) {
  const sessions = await loadFocusSessions();
  return totalPerMonth(sessions, monthStart);
}

export async function getStreak(asOf?: Date) {
  const sessions = await loadFocusSessions();
  return computeStreak(sessions, asOf);
}

export default {
  loadFocusSessions,
  getTotalForDay,
  getTotalForWeek,
  getTotalForMonth,
  getStreak,
};
