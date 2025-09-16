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
  // 'custom' allows selecting specific weekdays via `days` (0=Sunday..6=Saturday)
  repeat: 'none' | 'once' | 'daily' | 'weekdays' | 'custom';
  enabled: boolean;
  notificationId?: string;
  days?: number[];
}

export interface DoodleStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}
