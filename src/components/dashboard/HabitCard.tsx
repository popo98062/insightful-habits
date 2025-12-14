import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Habit, HabitLog } from '@/types/habit';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getIconByName } from '@/lib/icons';
import { 
  Check, 
  Flame, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  streak: number;
  trend?: 'improving' | 'stable' | 'declining';
  onToggle: () => void;
  onUpdateValue?: (value: number) => void;
  onClick?: () => void;
}

export function HabitCard({ 
  habit, 
  log, 
  streak, 
  trend = 'stable',
  onToggle, 
  onUpdateValue,
  onClick 
}: HabitCardProps) {
  const [localValue, setLocalValue] = useState(log?.value || 0);
  const isCompleted = log?.completed;
  const progress = habit.type === 'binary' 
    ? (isCompleted ? 100 : 0) 
    : Math.min(((log?.value || 0) / habit.goal) * 100, 100);

  const IconComponent = getIconByName(habit.icon);

  const handleIncrement = () => {
    const newValue = Math.min(localValue + 1, habit.goal * 2);
    setLocalValue(newValue);
    onUpdateValue?.(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(localValue - 1, 0);
    setLocalValue(newValue);
    onUpdateValue?.(newValue);
  };

  return (
    <div 
      className={cn(
        "glass rounded-2xl p-5 transition-all duration-300 cursor-pointer group",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isCompleted && "border-success/30 bg-success/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              isCompleted ? "bg-success/20" : "bg-secondary"
            )}
            style={{ 
              backgroundColor: isCompleted ? undefined : `${habit.color}20`,
            }}
          >
            <IconComponent 
              className="w-6 h-6 transition-colors" 
              style={{ color: isCompleted ? 'hsl(var(--success))' : habit.color }}
            />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{habit.name}</h3>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </div>
        </div>
        
        <button 
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        {habit.type === 'binary' ? (
          <div className="flex items-center gap-3">
            <Progress 
              value={progress} 
              className="flex-1 h-3"
              indicatorClassName={isCompleted ? "bg-success" : "bg-primary"}
            />
            <span className={cn(
              "text-sm font-medium",
              isCompleted ? "text-success" : "text-muted-foreground"
            )}>
              {isCompleted ? 'Done' : 'Not done'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {log?.value || 0} / {habit.goal} {habit.unit}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-3"
              indicatorClassName={progress >= 100 ? "bg-success" : "bg-primary"}
            />
          </div>
        )}
      </div>

      {/* Actions & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame className={cn(
                "w-4 h-4",
                streak >= 7 ? "text-warning streak-fire" : "text-warning/70"
              )} />
              <span className="text-sm font-medium text-foreground">{streak}</span>
            </div>
          )}
          
          {/* Trend */}
          <div className={cn(
            "flex items-center gap-1 text-sm",
            trend === 'improving' && "text-success",
            trend === 'declining' && "text-destructive",
            trend === 'stable' && "text-muted-foreground"
          )}>
            {trend === 'improving' && <TrendingUp className="w-4 h-4" />}
            {trend === 'declining' && <TrendingDown className="w-4 h-4" />}
            {trend === 'stable' && <Minus className="w-4 h-4" />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {habit.type !== 'binary' && (
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button 
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                onClick={handleDecrement}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{log?.value || 0}</span>
              <button 
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                onClick={handleIncrement}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <Button
            variant={isCompleted ? "success" : "default"}
            size="sm"
            onClick={onToggle}
            className="min-w-[80px]"
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4" />
                Done
              </>
            ) : (
              'Complete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
