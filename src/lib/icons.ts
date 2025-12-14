import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Helper to safely get an icon component by name
export function getIconByName(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] || LucideIcons.Target;
}
