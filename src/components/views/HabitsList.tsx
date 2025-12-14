import { useState, useMemo } from 'react';
import { Habit, HabitCategory } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calculateStreak, calculateAnalytics } from '@/lib/analytics';
import { getIconByName } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Search, Filter, Plus, Trash2, Edit, Pause, Play, Archive, Flame, BarChart3, Tag } from 'lucide-react';

interface HabitsListProps {
  habits: Habit[];
  categories: HabitCategory[];
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabitStatus: (habitId: string, status: 'active' | 'paused' | 'archived') => void;
}

export function HabitsList({ 
  habits, 
  categories, 
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onUpdateHabitStatus
}: HabitsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           habit.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || habit.categoryId === selectedCategory;
      const matchesStatus = statusFilter === 'all' || habit.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [habits, searchQuery, selectedCategory, statusFilter]);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Habits</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your habits
          </p>
        </div>
        <Button variant="glow" onClick={onAddHabit}>
          <Plus className="w-4 h-4" />
          New Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {['all', 'active', 'paused', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                statusFilter === status 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
            !selectedCategory 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const CatIcon = getIconByName(cat.icon);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                selectedCategory === cat.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <CatIcon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No habits found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit, index) => {
            const Icon = getIconByName(habit.icon);
            const category = getCategoryById(habit.categoryId);
            const streak = calculateStreak(habit.id);
            const analytics = calculateAnalytics(habit);
            
            return (
              <div 
                key={habit.id}
                className="glass rounded-2xl p-5 hover:border-primary/30 transition-all group animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: habit.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{habit.name}</h3>
                      {category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={habit.status === 'active' ? 'default' : 'secondary'}
                    className={cn(
                      habit.status === 'paused' && 'bg-warning/20 text-warning',
                      habit.status === 'archived' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {habit.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {habit.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-warning" />
                    <span className="text-foreground">{streak.currentStreak} day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-info" />
                    <span className="text-foreground">{analytics.completionRate}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditHabit(habit)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {habit.status === 'active' ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onUpdateHabitStatus(habit.id, 'paused')}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : habit.status === 'paused' ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onUpdateHabitStatus(habit.id, 'active')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : null}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onUpdateHabitStatus(habit.id, 'archived')}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteHabit(habit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
