import type { AppNotification } from '../model/types';
import { SEED_NOTIFICATIONS } from './seed';

const STORAGE_KEY = 'cropoptimize.notifications.v1';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function readStore(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_NOTIFICATIONS.map((item) => ({ ...item }));
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((item) => ({ ...item }))
      : SEED_NOTIFICATIONS.map((item) => ({ ...item }));
  } catch {
    return SEED_NOTIFICATIONS.map((item) => ({ ...item }));
  }
}

function writeStore(items: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let memoryStore = readStore();

export const notificationRepository = {
  async list(): Promise<AppNotification[]> {
    await delay(220);
    return memoryStore
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((item) => ({ ...item }));
  },

  async markRead(id: string): Promise<void> {
    memoryStore = memoryStore.map((item) => (item.id === id ? { ...item, read: true } : item));
    writeStore(memoryStore);
  },

  async markAllRead(): Promise<void> {
    memoryStore = memoryStore.map((item) => ({ ...item, read: true }));
    writeStore(memoryStore);
  },
};
