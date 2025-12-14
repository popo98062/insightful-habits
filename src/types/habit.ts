export type HabitType = 'binary' | 'numeric' | 'time' | 'progress';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type HabitStatus = 'active' | 'paused' | 'archived';

export type HabitPriority = 'low' | 'medium' | 'high' | 'critical';

export interface HabitCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  type: HabitType;
  categoryId: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0-6 for Sunday-Saturday
  goal: number; // For numeric: count, for time: minutes, for progress: percentage
  unit?: string; // "glasses", "minutes", "pages", etc.
  priority: HabitPriority;
  status: HabitStatus;
  color: string;
  icon: string;
  reminderTime?: string; // HH:MM format
  createdAt: string;
  updatedAt: string;
  stackedWith?: string[]; // IDs of habits this is stacked with
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // Actual value achieved
  confidenceLevel?: number; // 1-5
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  notes?: string;
  createdAt: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface HabitAnalytics {
  habitId: string;
  consistencyScore: number; // 0-100
  completionRate: number; // 0-100
  averageValue?: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  weeklyData: { day: string; value: number; completed: boolean }[];
  monthlyData: { week: string; completionRate: number }[];
}

export interface DailyProgress {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
}

export const DEFAULT_CATEGORIES: HabitCategory[] = [
  { id: 'health', name: 'Health & Fitness', icon: 'Heart', color: 'hsl(0, 72%, 51%)' },
  { id: 'productivity', name: 'Productivity', icon: 'Zap', color: 'hsl(38, 92%, 50%)' },
  { id: 'learning', name: 'Learning', icon: 'BookOpen', color: 'hsl(199, 89%, 48%)' },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'Brain', color: 'hsl(280, 65%, 60%)' },
  { id: 'social', name: 'Social', icon: 'Users', color: 'hsl(158, 64%, 52%)' },
  { id: 'finance', name: 'Finance', icon: 'DollarSign', color: 'hsl(168, 84%, 45%)' },
  { id: 'creativity', name: 'Creativity', icon: 'Palette', color: 'hsl(330, 80%, 60%)' },
  { id: 'self-care', name: 'Self Care', icon: 'Sparkles', color: 'hsl(45, 93%, 58%)' },
];

export const HABIT_TEMPLATES: Partial<Habit>[] = [
  { name: 'Drink Water', description: 'Stay hydrated', type: 'numeric', goal: 8, unit: 'glasses', categoryId: 'health', icon: 'Droplets', color: 'hsl(199, 89%, 48%)' },
  { name: 'Exercise', description: '30 minutes of physical activity', type: 'time', goal: 30, unit: 'minutes', categoryId: 'health', icon: 'Dumbbell', color: 'hsl(0, 72%, 51%)' },
  { name: 'Read', description: 'Read for personal growth', type: 'time', goal: 20, unit: 'minutes', categoryId: 'learning', icon: 'BookOpen', color: 'hsl(280, 65%, 60%)' },
  { name: 'Meditate', description: 'Practice mindfulness', type: 'time', goal: 10, unit: 'minutes', categoryId: 'mindfulness', icon: 'Brain', color: 'hsl(168, 84%, 45%)' },
  { name: 'Journal', description: 'Write daily reflections', type: 'binary', goal: 1, categoryId: 'mindfulness', icon: 'PenLine', color: 'hsl(38, 92%, 50%)' },
  { name: 'No Social Media', description: 'Digital detox', type: 'binary', goal: 1, categoryId: 'productivity', icon: 'Smartphone', color: 'hsl(158, 64%, 52%)' },
  { name: 'Sleep 8 Hours', description: 'Quality rest', type: 'time', goal: 480, unit: 'minutes', categoryId: 'health', icon: 'Moon', color: 'hsl(245, 58%, 51%)' },
  { name: 'Learn Language', description: 'Practice a new language', type: 'time', goal: 15, unit: 'minutes', categoryId: 'learning', icon: 'Languages', color: 'hsl(330, 80%, 60%)' },
];
