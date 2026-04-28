export type TaskStatus = 'pending' | 'completed' | 'failed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Category = 'Fitness' | 'Business' | 'Health' | 'Learning' | 'Deep Work' | 'Personal' | 'Other';
export type TimeBlock = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type SabotageCategory =
  | 'The Negotiator'
  | 'The Assassin'
  | 'The Seducer'
  | 'The Nihilist'
  | 'The Arsonist'
  | 'Other';

export interface FailureLog {
  sabotageCategory: SabotageCategory;
  whatHappened: string;
  excuse: string;
  nextCorrectAction: string;
}

export interface Task {
  id: string;
  dateKey: string;
  title: string;
  note?: string;
  category: Category;
  priority: Priority;
  timeBlock: TimeBlock;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  sabotageCategory?: SabotageCategory;
  nextCorrectAction?: string;
  excuse?: string;
}

export interface AppSettings {
  compactMode: boolean;
  showDailyDoctrine: boolean;
  accent: 'steel' | 'crimson' | 'gold' | 'terminal';
  languageMode: 'English' | 'Spanish';
  dangerousMode: boolean;
}

export type AppView = 'today' | 'knowEnemy' | 'intelligence' | 'history' | 'settings';
