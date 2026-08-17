import type { Payment } from '../model/types';
import { SEED_PAYMENTS } from './seed';

const STORAGE_KEY = 'cropoptimize.payments.v1';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function readStore(): Payment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEED_PAYMENTS];
    const parsed = JSON.parse(raw) as Payment[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_PAYMENTS];
  } catch {
    return [...SEED_PAYMENTS];
  }
}

let memoryStore = readStore();

export const paymentRepository = {
  async list(organizationId: string): Promise<Payment[]> {
    await delay(280);
    return memoryStore
      .filter((payment) => payment.organizationId === organizationId)
      .slice()
      .sort((left, right) => right.date.localeCompare(left.date))
      .map((payment) => ({ ...payment }));
  },
};
