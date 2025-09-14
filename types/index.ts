export type AppMode = 'personal' | 'baby';

export interface User {
  id: string;
  mode: AppMode;
  isPremium: boolean;
}

export interface FocusSession {
  id: string;
  duration: number;
  startTime: Date;
  completed: boolean;
}

export interface ScheduledSession {
  id: string;
  time: string;
  duration: number;
  repeat: 'none' | 'daily' | 'weekdays';
  enabled: boolean;
}

export interface DoodleStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}