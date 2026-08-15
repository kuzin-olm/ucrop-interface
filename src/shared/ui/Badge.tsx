import { cn } from '@/shared/lib/cn';
import styles from './Badge.module.css';

type BadgeProps = {
  tone: 'sowing_now' | 'planned' | 'history';
  children: string;
};

export function Badge({ tone, children }: BadgeProps) {
  return <span className={cn(styles.badge, styles[tone])}>{children}</span>;
}
