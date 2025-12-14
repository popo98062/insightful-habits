import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog, HabitCategory } from '@/types/habit';
import * as storage from '@/lib/storage';
import { calculateStreak, calculateAnalytics, getOverallStats } from '@/lib/analytics';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    setHabits(storage.getHabits());
    setLogs(storage.getLogs());
    setCategories(storage.getCategories());
    setLoading(false);
  }, []);

  // Habit operations
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveHabit(newHabit);
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback((habit: Habit) => {
    storage.saveHabit(habit);
    setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    storage.deleteHabit(habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setLogs(prev => prev.filter(l => l.habitId !== habitId));
  }, []);

  // Log operations
  const logHabit = useCallback((
    habitId: string,
    date: string,
    data: Partial<Omit<HabitLog, 'id' | 'habitId' | 'date' | 'createdAt'>>
  ) => {
    const existingLog = storage.getLogByHabitAndDate(habitId, date);
    
    const log: HabitLog = {
      id: existingLog?.id || storage.generateId(),
      habitId,
      date,
      completed: data.completed ?? false,
      value: data.value,
      confidenceLevel: data.confidenceLevel,
      mood: data.mood,
      notes: data.notes,
      createdAt: existingLog?.createdAt || new Date().toISOString(),
    };
    
    storage.saveLog(log);
    setLogs(prev => {
      const filtered = prev.filter(l => l.id !== log.id);
      return [...filtered, log];
    });
    
    return log;
  }, []);

  const toggleHabitCompletion = useCallback((habitId: string, date: string) => {
    const existingLog = storage.getLogByHabitAndDate(habitId, date);
    const habit = habits.find(h => h.id === habitId);
    
    const log: HabitLog = {
      id: existingLog?.id || storage.generateId(),
      habitId,
      date,
      completed: !existingLog?.completed,
      value: !existingLog?.completed ? habit?.goal : 0,
      createdAt: existingLog?.createdAt || new Date().toISOString(),
    };
    
    storage.saveLog(log);
    setLogs(prev => {
      const filtered = prev.filter(l => l.id !== log.id);
      return [...filtered, log];
    });
    
    return log;
  }, [habits]);

  // Get logs for a specific date
  const getLogsForDate = useCallback((date: string) => {
    return logs.filter(l => l.date === date);
  }, [logs]);

  // Get log for a specific habit and date
  const getHabitLog = useCallback((habitId: string, date: string) => {
    return logs.find(l => l.habitId === habitId && l.date === date);
  }, [logs]);

  // Get streak for a habit
  const getStreak = useCallback((habitId: string) => {
    return calculateStreak(habitId);
  }, []);

  // Get analytics for a habit
  const getAnalytics = useCallback((habit: Habit, days?: number) => {
    return calculateAnalytics(habit, days);
  }, []);

  // Get overall stats
  const getStats = useCallback(() => {
    return getOverallStats(habits);
  }, [habits]);

  // Filter habits
  const getActiveHabits = useCallback(() => {
    return habits.filter(h => h.status === 'active');
  }, [habits]);

  const getHabitsByCategory = useCallback((categoryId: string) => {
    return habits.filter(h => h.categoryId === categoryId);
  }, [habits]);

  return {
    habits,
    logs,
    categories,
    loading,
    addHabit,
    updateHabit,
    removeHabit,
    logHabit,
    toggleHabitCompletion,
    getLogsForDate,
    getHabitLog,
    getStreak,
    getAnalytics,
    getStats,
    getActiveHabits,
    getHabitsByCategory,
  };
}
