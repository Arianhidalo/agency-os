import { AppSettings, Task } from '../types';

const TASKS_KEY = 'command-day.tasks';
const SETTINGS_KEY = 'command-day.settings';
const STREAK_KEY = 'command-day.streak';

export const defaultSettings: AppSettings = {
  compactMode: false,
  motivationalPhrases: true,
  accent: 'steel',
};

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as AppSettings) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

export const loadStreak = (): number => Number(localStorage.getItem(STREAK_KEY) ?? '0');
export const saveStreak = (streak: number): void => localStorage.setItem(STREAK_KEY, String(streak));

export const resetAllData = (): void => {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(STREAK_KEY);
};
