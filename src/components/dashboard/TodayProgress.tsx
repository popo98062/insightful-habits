import { cn } from '@/lib/utils';
import { DailyProgress } from '@/types/habit';

interface TodayProgressProps {
  progress: DailyProgress;
}

export function TodayProgress({ progress }: TodayProgressProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress.completionRate / 100) * circumference;
  
  const getProgressColor = () => {
    if (progress.completionRate >= 80) return 'hsl(var(--success))';
    if (progress.completionRate >= 50) return 'hsl(var(--info))';
    if (progress.completionRate >= 25) return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg text-foreground mb-6">
        Today's Progress
      </h3>
      
      <div className="flex items-center justify-center">
        <div className="relative w-36 h-36">
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: progress.completionRate >= 50 
                  ? `drop-shadow(0 0 8px ${getProgressColor()})` 
                  : 'none'
              }}
            />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-display font-bold text-foreground">
              {progress.completionRate}%
            </span>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-success">
            {progress.completedHabits}
          </p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-muted-foreground">
            {progress.totalHabits - progress.completedHabits}
          </p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </div>
    </div>
  );
}
