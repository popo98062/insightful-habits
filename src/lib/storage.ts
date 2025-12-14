import { Habit, HabitLog, HabitCategory, DEFAULT_CATEGORIES } from '@/types/habit';

const STORAGE_KEYS = {
  HABITS: 'habitflow_habits',
  LOGS: 'habitflow_logs',
  CATEGORIES: 'habitflow_categories',
} as const;

// Generic storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Habits
export function getHabits(): Habit[] {
  return getItem<Habit[]>(STORAGE_KEYS.HABITS, []);
}

export function saveHabit(habit: Habit): void {
  const habits = getHabits();
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  
  if (existingIndex >= 0) {
    habits[existingIndex] = { ...habit, updatedAt: new Date().toISOString() };
  } else {
    habits.push(habit);
  }
  
  setItem(STORAGE_KEYS.HABITS, habits);
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits().filter(h => h.id !== habitId);
  setItem(STORAGE_KEYS.HABITS, habits);
  
  // Also delete associated logs
  const logs = getLogs().filter(l => l.habitId !== habitId);
  setItem(STORAGE_KEYS.LOGS, logs);
}

// Logs
export function getLogs(): HabitLog[] {
  return getItem<HabitLog[]>(STORAGE_KEYS.LOGS, []);
}

export function getLogsByHabit(habitId: string): HabitLog[] {
  return getLogs().filter(l => l.habitId === habitId);
}

export function getLogsByDate(date: string): HabitLog[] {
  return getLogs().filter(l => l.date === date);
}

export function getLogByHabitAndDate(habitId: string, date: string): HabitLog | undefined {
  return getLogs().find(l => l.habitId === habitId && l.date === date);
}

export function saveLog(log: HabitLog): void {
  const logs = getLogs();
  const existingIndex = logs.findIndex(l => l.id === log.id);
  
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  
  setItem(STORAGE_KEYS.LOGS, logs);
}

export function deleteLog(logId: string): void {
  const logs = getLogs().filter(l => l.id !== logId);
  setItem(STORAGE_KEYS.LOGS, logs);
}

// Categories
export function getCategories(): HabitCategory[] {
  const stored = getItem<HabitCategory[]>(STORAGE_KEYS.CATEGORIES, []);
  return stored.length > 0 ? stored : DEFAULT_CATEGORIES;
}

export function saveCategory(category: HabitCategory): void {
  const categories = getCategories();
  const existingIndex = categories.findIndex(c => c.id === category.id);
  
  if (existingIndex >= 0) {
    categories[existingIndex] = category;
  } else {
    categories.push(category);
  }
  
  setItem(STORAGE_KEYS.CATEGORIES, categories);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Date helpers
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return formatDate(new Date());
}

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  
  return dates;
}
