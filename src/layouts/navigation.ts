import { ClipboardList, LayoutDashboard, Map, Settings, Sprout, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plans', label: 'Планы расчёта', icon: ClipboardList },
  { to: '/fields', label: 'Поля', icon: Map },
  { to: '/crops', label: 'Культуры', icon: Sprout },
  { to: '/employees', label: 'Сотрудники', icon: Users },
];

export const SECONDARY_NAV: NavItem[] = [{ to: '/settings', label: 'Settings', icon: Settings }];
