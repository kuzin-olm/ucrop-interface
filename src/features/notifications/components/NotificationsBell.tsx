import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../model/types';
import { NotificationRow } from './NotificationRow';
import styles from './NotificationsBell.module.css';

export function NotificationsBell() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const items = data ?? [];
  const hasUnread = items.some((item) => !item.read);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openItem = (item: AppNotification) => {
    if (!item.read) void markRead.mutateAsync(item.id);
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bell}
        aria-label="Уведомления"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={18} aria-hidden="true" />
        {hasUnread ? <span className={styles.dot} /> : null}
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Уведомления">
          <div className={styles.head}>
            <span className={styles.title}>Уведомления</span>
            <button
              type="button"
              className={styles.link}
              disabled={!hasUnread || markAll.isPending}
              onClick={() => void markAll.mutateAsync()}
            >
              Прочитать все
            </button>
          </div>

          <div className={styles.list}>
            {isLoading ? (
              Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton} />)
            ) : items.length === 0 ? (
              <p className={styles.empty}>Нет уведомлений</p>
            ) : (
              items.map((item) => <NotificationRow key={item.id} item={item} onSelect={openItem} />)
            )}
          </div>

          <div className={styles.foot}>
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
            >
              Все уведомления
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
