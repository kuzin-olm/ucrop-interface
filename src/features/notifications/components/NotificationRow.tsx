import { cn } from '@/shared/lib/cn';
import { formatNotificationTime } from '../lib/formatRelativeTime';
import type { AppNotification } from '../model/types';
import styles from './NotificationRow.module.css';

type NotificationRowProps = {
  item: AppNotification;
  onSelect: (item: AppNotification) => void;
  wide?: boolean;
};

export function NotificationRow({ item, onSelect, wide = false }: NotificationRowProps) {
  return (
    <button
      type="button"
      className={cn(styles.row, styles[item.type], !item.read && styles.unread, wide && styles.wide)}
      onClick={() => onSelect(item)}
    >
      <span className={styles.title}>{item.title}</span>
      <time className={styles.time} dateTime={item.createdAt}>
        {formatNotificationTime(item.createdAt)}
      </time>
    </button>
  );
}
