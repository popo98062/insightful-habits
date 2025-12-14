import { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { calculateStreak, calculateAnalytics, getWeeklyOverview, getOverallStats } from '@/lib/analytics';
import { Progress } from '@/components/ui/progress';
import { getIconByName } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Target, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Flame, BarChart3 } from 'lucide-react';

interface AnalyticsProps {
  habits: Habit[];
}

export function Analytics({ habits }: AnalyticsProps) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const weeklyData = getWeeklyOverview(habits);
  const overallStats = getOverallStats(habits);

  const habitAnalytics = useMemo(() => {
    return activeHabits.map(habit => ({
      habit,
      streak: calculateStreak(habit.id),
      analytics: calculateAnalytics(habit),
    })).sort((a, b) => b.analytics.consistencyScore - a.analytics.consistencyScore);
  }, [activeHabits]);

  const weeklyAverage = useMemo(() => {
    if (weeklyData.length === 0) return 0;
    return Math.round(weeklyData.reduce((sum, d) => sum + d.completionRate, 0) / weeklyData.length);
  }, [weeklyData]);

  const riskHabits = habitAnalytics.filter(h => h.analytics.riskLevel === 'high');
  const improvingHabits = habitAnalytics.filter(h => h.analytics.trend === 'improving');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep insights into your behavior patterns
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Completion</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {overallStats.overallCompletionRate}%
              </p>
            </div>
          </div>
          <Progress value={overallStats.overallCompletionRate} className="h-2" />
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weekly Average</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {weeklyAverage}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>{improvingHabits.length} habits improving</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              riskHabits.length > 0 ? "bg-destructive/20" : "bg-success/20"
            )}>
              {riskHabits.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Habits at Risk</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {riskHabits.length}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {riskHabits.length > 0 
              ? 'Need attention to maintain progress' 
              : 'All habits are on track!'}
          </p>
        </div>
      </div>

      {/* Habit Performance Table */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          Habit Performance
        </h2>
        
        {habitAnalytics.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No habits to analyze yet. Create some habits to see insights!
          </p>
        ) : (
          <div className="space-y-4">
            {habitAnalytics.map(({ habit, streak, analytics }) => {
              const Icon = getIconByName(habit.icon);
              
              return (
                <div 
                  key={habit.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  {/* Icon & Name */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: habit.color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        analytics.riskLevel === 'low' && "bg-success/20 text-success",
                        analytics.riskLevel === 'medium' && "bg-warning/20 text-warning",
                        analytics.riskLevel === 'high' && "bg-destructive/20 text-destructive"
                      )}>
                        {analytics.riskLevel} risk
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-warning" />
                        {streak.currentStreak} days
                      </span>
                      <span>Best: {streak.longestStreak} days</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-foreground">
                        {analytics.completionRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-foreground">
                        {analytics.consistencyScore}
                      </p>
                      <p className="text-xs text-muted-foreground">Consistency</p>
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg",
                      analytics.trend === 'improving' && "bg-success/20 text-success",
                      analytics.trend === 'declining' && "bg-destructive/20 text-destructive",
                      analytics.trend === 'stable' && "bg-muted text-muted-foreground"
                    )}>
                      {analytics.trend === 'improving' && <TrendingUp className="w-4 h-4" />}
                      {analytics.trend === 'declining' && <TrendingDown className="w-4 h-4" />}
                      {analytics.trend === 'stable' && <Minus className="w-4 h-4" />}
                      <span className="text-sm font-medium capitalize">{analytics.trend}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Breakdown */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-display font-semibold text-foreground mb-6">
          Weekly Breakdown
        </h2>
        
        <div className="grid grid-cols-7 gap-3">
          {weeklyData.map((day) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div 
                key={day.date}
                className={cn(
                  "p-4 rounded-xl text-center transition-all",
                  isToday ? "bg-primary/20 border border-primary/30" : "bg-secondary/50"
                )}
              >
                <p className={cn(
                  "text-sm font-medium mb-2",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {day.completionRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {day.completedHabits}/{day.totalHabits}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
