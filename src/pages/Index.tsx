import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/views/Dashboard';
import { HabitsList } from '@/components/views/HabitsList';
import { Analytics } from '@/components/views/Analytics';
import { Settings } from '@/components/views/Settings';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { useHabits } from '@/hooks/useHabits';
import { getTodayDate } from '@/lib/storage';
import { Habit } from '@/types/habit';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    habits,
    logs,
    categories,
    loading,
    addHabit,
    updateHabit,
    removeHabit,
    toggleHabitCompletion,
    logHabit,
    getHabitLog,
  } = useHabits();

  const today = getTodayDate();

  const handleAddHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    addHabit(habitData);
    toast.success('Habit created successfully!');
  }, [addHabit]);

  const handleToggleHabit = useCallback((habitId: string) => {
    toggleHabitCompletion(habitId, today);
    const log = getHabitLog(habitId, today);
    if (!log?.completed) {
      toast.success('Habit completed! 🎉');
    }
  }, [toggleHabitCompletion, today, getHabitLog]);

  const handleUpdateHabitValue = useCallback((habitId: string, value: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      logHabit(habitId, today, {
        value,
        completed: value >= habit.goal,
      });
    }
  }, [habits, logHabit, today]);

  const handleEditHabit = useCallback((habit: Habit) => {
    // For now, just log - could open edit modal
    console.log('Edit habit:', habit);
    toast.info('Edit functionality coming soon!');
  }, []);

  const handleDeleteHabit = useCallback((habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      removeHabit(habitId);
      toast.success('Habit deleted');
    }
  }, [removeHabit]);

  const handleUpdateHabitStatus = useCallback((habitId: string, status: 'active' | 'paused' | 'archived') => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      updateHabit({ ...habit, status });
      toast.success(`Habit ${status === 'active' ? 'resumed' : status}`);
    }
  }, [habits, updateHabit]);

  const handleResetData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary animate-pulse" />
          <p className="text-muted-foreground">Loading HabitFlow...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            habits={habits}
            logs={logs}
            categories={categories}
            onToggleHabit={handleToggleHabit}
            onUpdateHabitValue={handleUpdateHabitValue}
            getHabitLog={getHabitLog}
          />
        );
      case 'habits':
        return (
          <HabitsList
            habits={habits}
            categories={categories}
            onAddHabit={() => setShowCreateModal(true)}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onUpdateHabitStatus={handleUpdateHabitStatus}
          />
        );
      case 'analytics':
        return <Analytics habits={habits} />;
      case 'settings':
        return <Settings categories={categories} onResetData={handleResetData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onAddHabit={() => setShowCreateModal(true)}
      />
      
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        "ml-64 p-8"
      )}>
        {renderView()}
      </main>

      <CreateHabitModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleAddHabit}
        categories={categories}
      />
    </div>
  );
};

export default Index;
