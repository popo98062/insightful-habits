import { useMemo } from 'react';
import { Habit, HabitLog, HabitCategory } from '@/types/habit';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { HabitCard } from '@/components/dashboard/HabitCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { TodayProgress } from '@/components/dashboard/TodayProgress';
import { getWeeklyOverview, getDailyProgress, calculateStreak, calculateAnalytics } from '@/lib/analytics';
import { getTodayDate } from '@/lib/storage';
import { Target, Flame, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';

interface DashboardProps {
  habits: Habit[];
  logs: HabitLog[];
  categories: HabitCategory[];
  onToggleHabit: (habitId: string) => void;
  onUpdateHabitValue: (habitId: string, value: number) => void;
  getHabitLog: (habitId: string, date: string) => HabitLog | undefined;
}

export function Dashboard({ 
  habits, 
  logs, 
  categories,
  onToggleHabit, 
  onUpdateHabitValue,
  getHabitLog 
}: DashboardProps) {
  const today = getTodayDate();
  const activeHabits = habits.filter(h => h.status === 'active');
  
  const weeklyData = useMemo(() => getWeeklyOverview(habits), [habits, logs]);
  const todayProgress = useMemo(() => getDailyProgress(today, habits), [habits, logs, today]);
  
  const stats = useMemo(() => {
    let totalStreak = 0;
    let bestStreak = 0;
    let improvingCount = 0;
    
    activeHabits.forEach(habit => {
      const streak = calculateStreak(habit.id);
      totalStreak += streak.currentStreak;
      bestStreak = Math.max(bestStreak, streak.longestStreak);
      
      const analytics = calculateAnalytics(habit);
      if (analytics.trend === 'improving') improvingCount++;
    });
    
    return {
      totalHabits: activeHabits.length,
      avgStreak: activeHabits.length > 0 ? Math.round(totalStreak / activeHabits.length) : 0,
      bestStreak,
      improvingCount,
    };
  }, [activeHabits]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {getGreeting()}! <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {todayProgress.completedHabits === todayProgress.totalHabits && todayProgress.totalHabits > 0
              ? "You've completed all habits today! 🎉"
              : `You have ${todayProgress.totalHabits - todayProgress.completedHabits} habits remaining today`
            }
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Habits"
          value={stats.totalHabits}
          subtitle="Currently tracking"
          icon={Target}
          iconColor="text-primary"
        />
        <StatsCard
          title="Today's Progress"
          value={`${todayProgress.completionRate}%`}
          subtitle={`${todayProgress.completedHabits}/${todayProgress.totalHabits} completed`}
          icon={CheckCircle2}
          iconColor="text-success"
        />
        <StatsCard
          title="Average Streak"
          value={`${stats.avgStreak} days`}
          subtitle={`Best: ${stats.bestStreak} days`}
          icon={Flame}
          iconColor="text-warning"
        />
        <StatsCard
          title="Improving"
          value={stats.improvingCount}
          subtitle="Habits trending up"
          icon={TrendingUp}
          iconColor="text-info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Today's Habits
            </h2>
            <span className="text-sm text-muted-foreground">
              {todayProgress.completedHabits}/{todayProgress.totalHabits} done
            </span>
          </div>
          
          {activeHabits.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                No habits yet
              </h3>
              <p className="text-muted-foreground">
                Create your first habit to start tracking your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeHabits.map((habit, index) => {
                const log = getHabitLog(habit.id, today);
                const streak = calculateStreak(habit.id);
                const analytics = calculateAnalytics(habit);
                
                return (
                  <div 
                    key={habit.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <HabitCard
                      habit={habit}
                      log={log}
                      streak={streak.currentStreak}
                      trend={analytics.trend}
                      onToggle={() => onToggleHabit(habit.id)}
                      onUpdateValue={(value) => onUpdateHabitValue(habit.id, value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <TodayProgress progress={todayProgress} />
          <WeeklyChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
