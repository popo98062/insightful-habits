import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  iconColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className,
  iconColor = "text-primary"
}: StatsCardProps) {
  return (
    <div className={cn(
      "glass rounded-2xl p-6 glass-hover animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          "bg-primary/10"
        )}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {trend && trendValue && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            trend === 'up' && "text-success bg-success/10",
            trend === 'down' && "text-destructive bg-destructive/10",
            trend === 'neutral' && "text-muted-foreground bg-muted"
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </span>
        )}
      </div>
      
      <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
