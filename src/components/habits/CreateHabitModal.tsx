import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Habit, HabitType, HabitFrequency, HabitPriority, HabitCategory, HABIT_TEMPLATES } from '@/types/habit';
import { getIconByName } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

interface CreateHabitModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  categories: HabitCategory[];
}

const HABIT_ICONS = [
  'Target', 'Heart', 'Zap', 'BookOpen', 'Brain', 'Dumbbell', 
  'Droplets', 'Moon', 'Sun', 'Coffee', 'Apple', 'Bike',
  'PenLine', 'Music', 'Palette', 'Code', 'Camera', 'Plane'
];

const HABIT_COLORS = [
  'hsl(168, 84%, 45%)', // Primary teal
  'hsl(199, 89%, 48%)', // Info blue
  'hsl(38, 92%, 50%)',  // Warning amber
  'hsl(0, 72%, 51%)',   // Destructive red
  'hsl(280, 65%, 60%)', // Purple
  'hsl(158, 64%, 52%)', // Success green
  'hsl(330, 80%, 60%)', // Pink
  'hsl(45, 93%, 58%)',  // Yellow
];

export function CreateHabitModal({ open, onClose, onSubmit, categories }: CreateHabitModalProps) {
  const [mode, setMode] = useState<'custom' | 'template'>('custom');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'binary' as HabitType,
    categoryId: categories[0]?.id || '',
    frequency: 'daily' as HabitFrequency,
    goal: 1,
    unit: '',
    priority: 'medium' as HabitPriority,
    icon: 'Target',
    color: HABIT_COLORS[0],
    reminderTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      status: 'active',
    });
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      type: 'binary',
      categoryId: categories[0]?.id || '',
      frequency: 'daily',
      goal: 1,
      unit: '',
      priority: 'medium',
      icon: 'Target',
      color: HABIT_COLORS[0],
      reminderTime: '',
    });
    onClose();
  };

  const handleTemplateSelect = (template: typeof HABIT_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      name: template.name || '',
      description: template.description || '',
      type: template.type || 'binary',
      categoryId: template.categoryId || categories[0]?.id || '',
      goal: template.goal || 1,
      unit: template.unit || '',
      icon: template.icon || 'Target',
      color: template.color || HABIT_COLORS[0],
    });
    setMode('custom');
  };

  const IconComponent = getIconByName(formData.icon);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Habit</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'custom' | 'template')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-4">
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {HABIT_TEMPLATES.map((template, index) => {
                const TemplateIcon = getIconByName(template.icon || 'Target');
                return (
                  <button
                    key={index}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <TemplateIcon className="w-5 h-5" style={{ color: template.color }} />
                    </div>
                    <p className="font-medium text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: formData.color }} />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {formData.name || 'Your Habit'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || 'Add a description'}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Habit Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Exercise"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's this habit about?"
                    rows={2}
                  />
                </div>
              </div>

              {/* Type & Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: HabitType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="binary">Yes/No</SelectItem>
                      <SelectItem value="numeric">Count</SelectItem>
                      <SelectItem value="time">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goal (for non-binary) */}
              {formData.type !== 'binary' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal">Goal</Label>
                    <Input
                      id="goal"
                      type="number"
                      min={1}
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder={formData.type === 'time' ? 'minutes' : 'times'}
                    />
                  </div>
                </div>
              )}

              {/* Icon & Color */}
              <div className="space-y-3">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map((iconName) => {
                    const Icon = getIconByName(iconName);
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                          formData.icon === iconName 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        formData.color === color && "ring-2 ring-offset-2 ring-offset-card ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: HabitPriority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="glow" className="flex-1">
                  Create Habit
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
