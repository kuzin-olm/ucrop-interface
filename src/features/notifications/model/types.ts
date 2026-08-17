export type NotificationType = 'success' | 'error' | 'info' | 'system';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
  link?: string;
};
