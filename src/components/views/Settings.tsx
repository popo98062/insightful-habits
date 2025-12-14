import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HabitCategory } from '@/types/habit';
import { getIconByName } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Download, Upload, Trash2, Bell, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  categories: HabitCategory[];
  onResetData: () => void;
}

export function Settings({ categories, onResetData }: SettingsProps) {
  const [notifications, setNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  const handleExportData = () => {
    const data = {
      habits: localStorage.getItem('habitflow_habits'),
      logs: localStorage.getItem('habitflow_logs'),
      categories: localStorage.getItem('habitflow_categories'),
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.habits) localStorage.setItem('habitflow_habits', data.habits);
        if (data.logs) localStorage.setItem('habitflow_logs', data.logs);
        if (data.categories) localStorage.setItem('habitflow_categories', data.categories);
        
        toast.success('Data imported successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      onResetData();
      toast.success('All data has been reset.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your HabitFlow experience
        </p>
      </div>

      {/* Preferences */}
      <div className="glass rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-display font-semibold text-foreground">Preferences</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="font-medium text-foreground">Notifications</p>
              <p className="text-sm text-muted-foreground">Get reminded about your habits</p>
            </div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Sound Effects</p>
              <p className="text-sm text-muted-foreground">Play sounds on completion</p>
            </div>
          </div>
          <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
        </div>
      </div>

      {/* Categories */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-foreground">Categories</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const CatIcon = getIconByName(cat.icon);
            return (
              <div 
                key={cat.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <span className="font-medium text-foreground">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-foreground">Data Management</h2>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          
          <Label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4" />
                Import Data
              </span>
            </Button>
            <Input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleImportData}
            />
          </Label>
          
          <Button variant="destructive" onClick={handleResetData}>
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Your data is stored locally in your browser. Export regularly to keep a backup.
        </p>
      </div>

      {/* About */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-foreground">About HabitFlow</h2>
        
        <p className="text-muted-foreground">
          A behavior-intelligence system that helps you understand your patterns, identify trends, 
          and develop consistency using data-driven insights.
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>Built with React & TypeScript</span>
        </div>
      </div>
    </div>
  );
}
