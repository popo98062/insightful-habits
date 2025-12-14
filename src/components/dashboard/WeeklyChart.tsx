import { cn } from '@/lib/utils';
import { DailyProgress } from '@/types/habit';

interface WeeklyChartProps {
  data: DailyProgress[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxCompletion = Math.max(...data.map(d => d.completionRate), 1);
  
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg text-foreground mb-6">
        Weekly Overview
      </h3>
      
      <div className="flex items-end justify-between gap-3 h-40">
        {data.map((day, index) => {
          const height = (day.completionRate / 100) * 100;
          const today = isToday(day.date);
          
          return (
            <div 
              key={day.date} 
              className="flex-1 flex flex-col items-center gap-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Bar */}
              <div className="w-full h-32 flex items-end">
                <div 
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-500 ease-out",
                    today 
                      ? "bg-primary glow-sm" 
                      : day.completionRate >= 80 
                        ? "bg-success/80" 
                        : day.completionRate >= 50 
                          ? "bg-info/80" 
                          : day.completionRate > 0 
                            ? "bg-warning/80"
                            : "bg-muted"
                  )}
                  style={{ 
                    height: `${Math.max(height, 4)}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
              
              {/* Percentage */}
              <span className={cn(
                "text-xs font-medium",
                today ? "text-primary" : "text-muted-foreground"
              )}>
                {day.completionRate}%
              </span>
              
              {/* Day Label */}
              <span className={cn(
                "text-xs",
                today ? "text-foreground font-semibold" : "text-muted-foreground"
              )}>
                {getDayLabel(day.date)}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">80%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-info" />
          <span className="text-xs text-muted-foreground">50-79%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
