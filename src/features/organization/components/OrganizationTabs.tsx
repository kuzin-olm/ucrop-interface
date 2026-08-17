import { cn } from '@/shared/lib/cn';
import styles from './OrganizationTabs.module.css';

export type OrganizationTab = 'main' | 'payments';

const TABS: Array<{ id: OrganizationTab; label: string }> = [
  { id: 'main', label: 'Основная' },
  { id: 'payments', label: 'Платежи' },
];

type OrganizationTabsProps = {
  value: OrganizationTab;
  onChange: (value: OrganizationTab) => void;
};

export function OrganizationTabs({ value, onChange }: OrganizationTabsProps) {
  return (
    <div className={styles.list} role="tablist" aria-label="Разделы организации">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn(styles.tab, value === tab.id && styles.active)}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
