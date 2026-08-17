import type { AppNotification } from '../model/types';

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60_000).toISOString();
}

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-plan-done',
    type: 'success',
    title: 'Расчёт «Севооборот Север» завершён',
    createdAt: minutesAgo(8),
    read: false,
    link: '/plans/plan-north/results',
  },
  {
    id: 'ntf-plan-error',
    type: 'error',
    title: 'Ошибка в плане «Кукуруза центр»',
    createdAt: minutesAgo(35),
    read: false,
    link: '/plans',
  },
  {
    id: 'ntf-invite',
    type: 'info',
    title: 'Мария Орлова приняла приглашение',
    createdAt: minutesAgo(80),
    read: false,
    link: '/employees',
  },
  {
    id: 'ntf-plan-update',
    type: 'info',
    title: 'План «Черновик масличных» обновлён',
    createdAt: minutesAgo(200),
    read: true,
    link: '/plans',
  },
  {
    id: 'ntf-limit',
    type: 'system',
    title: 'Использовано 8 из 40 планов',
    createdAt: daysAgo(1),
    read: true,
    link: '/organization',
  },
];
