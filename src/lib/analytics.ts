import { Habit, HabitLog, HabitStreak, HabitAnalytics, DailyProgress } from '@/types/habit';
import { getLogsByHabit, getLogs, getDateRange, formatDate } from './storage';

export function calculateStreak(habitId: string): HabitStreak {
  const logs = getLogsByHabit(habitId)
    .filter(l => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (logs.length === 0) {
    return { habitId, currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const lastCompletedDate = logs[0].date;
  const lastDate = new Date(lastCompletedDate);
  lastDate.setHours(0, 0, 0, 0);
  
  // Check if streak is still active (completed today or yesterday)
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const streakActive = diffDays <= 1;
  
  // Calculate streaks
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (let i = 0; i < sortedLogs.length; i++) {
    const currentDate = new Date(sortedLogs[i].date);
    
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedLogs[i - 1].date);
      const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  currentStreak = streakActive ? tempStreak : 0;
  
  return { habitId, currentStreak, longestStreak, lastCompletedDate };
}

export function calculateAnalytics(habit: Habit, days: number = 30): HabitAnalytics {
  const logs = getLogsByHabit(habit.id);
  const dateRange = getDateRange(days);
  
  // Calculate completion rate
  const relevantLogs = logs.filter(l => dateRange.includes(l.date));
  const completedDays = relevantLogs.filter(l => l.completed).length;
  const completionRate = Math.round((completedDays / days) * 100);
  
  // Calculate consistency score (weighted by recency)
  let consistencyScore = 0;
  const recentDays = getDateRange(7);
  const recentLogs = logs.filter(l => recentDays.includes(l.date));
  const recentCompletions = recentLogs.filter(l => l.completed).length;
  const recentRate = recentCompletions / 7;
  
  consistencyScore = Math.round((completionRate * 0.6 + recentRate * 100 * 0.4));
  
  // Calculate average value for numeric habits
  let averageValue: number | undefined;
  if (habit.type === 'numeric' || habit.type === 'time') {
    const valuesLogs = relevantLogs.filter(l => l.value !== undefined);
    if (valuesLogs.length > 0) {
      averageValue = Math.round(
        valuesLogs.reduce((sum, l) => sum + (l.value || 0), 0) / valuesLogs.length
      );
    }
  }
  
  // Calculate trend
  const firstHalfDays = dateRange.slice(0, Math.floor(days / 2));
  const secondHalfDays = dateRange.slice(Math.floor(days / 2));
  
  const firstHalfRate = logs.filter(l => firstHalfDays.includes(l.date) && l.completed).length / firstHalfDays.length;
  const secondHalfRate = logs.filter(l => secondHalfDays.includes(l.date) && l.completed).length / secondHalfDays.length;
  
  let trend: 'improving' | 'stable' | 'declining';
  if (secondHalfRate > firstHalfRate + 0.1) {
    trend = 'improving';
  } else if (secondHalfRate < firstHalfRate - 0.1) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }
  
  // Calculate risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (completionRate >= 70 && trend !== 'declining') {
    riskLevel = 'low';
  } else if (completionRate >= 40 || (completionRate >= 30 && trend === 'improving')) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }
  
  // Weekly data
  const weeklyData = recentDays.map(date => {
    const log = logs.find(l => l.date === date);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      value: log?.value || 0,
      completed: log?.completed || false,
    };
  });
  
  // Monthly data (by week)
  const monthlyData: { week: string; completionRate: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekDays = getDateRange(7).map((_, idx) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + idx);
      return formatDate(d);
    });
    
    const weekLogs = logs.filter(l => weekDays.includes(l.date));
    const weekCompletions = weekLogs.filter(l => l.completed).length;
    const weekRate = Math.round((weekCompletions / 7) * 100);
    
    monthlyData.unshift({
      week: `Week ${4 - i}`,
      completionRate: weekRate,
    });
  }
  
  return {
    habitId: habit.id,
    consistencyScore,
    completionRate,
    averageValue,
    trend,
    riskLevel,
    weeklyData,
    monthlyData,
  };
}

export function getDailyProgress(date: string, habits: Habit[]): DailyProgress {
  const activeHabits = habits.filter(h => h.status === 'active');
  const logs = getLogs().filter(l => l.date === date);
  
  const completedHabits = activeHabits.filter(habit => {
    const log = logs.find(l => l.habitId === habit.id);
    return log?.completed;
  }).length;
  
  return {
    date,
    totalHabits: activeHabits.length,
    completedHabits,
    completionRate: activeHabits.length > 0 
      ? Math.round((completedHabits / activeHabits.length) * 100) 
      : 0,
  };
}

export function getWeeklyOverview(habits: Habit[]): DailyProgress[] {
  const dates = getDateRange(7);
  return dates.map(date => getDailyProgress(date, habits));
}

export function getOverallStats(habits: Habit[]) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const allLogs = getLogs();
  const last30Days = getDateRange(30);
  
  let totalCompletions = 0;
  let totalPossible = 0;
  let totalCurrentStreak = 0;
  let bestStreak = 0;
  
  activeHabits.forEach(habit => {
    const logs = allLogs.filter(l => l.habitId === habit.id && last30Days.includes(l.date));
    totalCompletions += logs.filter(l => l.completed).length;
    totalPossible += 30;
    
    const streak = calculateStreak(habit.id);
    totalCurrentStreak += streak.currentStreak;
    bestStreak = Math.max(bestStreak, streak.longestStreak);
  });
  
  return {
    totalHabits: activeHabits.length,
    overallCompletionRate: totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0,
    averageStreak: activeHabits.length > 0 ? Math.round(totalCurrentStreak / activeHabits.length) : 0,
    bestStreak,
    totalCompletionsToday: getDailyProgress(formatDate(new Date()), habits).completedHabits,
  };
}
