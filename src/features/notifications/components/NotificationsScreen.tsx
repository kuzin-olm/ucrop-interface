import { useNavigate } from 'react-router-dom';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../model/types';
import { NotificationRow } from './NotificationRow';
import styles from './NotificationsScreen.module.css';

export function NotificationsScreen() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = data ?? [];
  const hasUnread = items.some((item) => !item.read);

  const openItem = (item: AppNotification) => {
    if (!item.read) void markRead.mutateAsync(item.id);
    if (item.link) navigate(item.link);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Уведомления</h1>
        <button
          type="button"
          className={styles.link}
          disabled={!hasUnread || markAll.isPending}
          onClick={() => void markAll.mutateAsync()}
        >
          Прочитать все
        </button>
      </header>

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      ) : null}

      {!isLoading && items.length === 0 ? <p className={styles.empty}>Нет уведомлений</p> : null}

      {!isLoading && items.length > 0 ? (
        <div className={styles.card}>
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} wide onSelect={openItem} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
