import { DEFAULT_ORGANIZATION_ID } from '@/features/auth/api/seed';
import type { Payment } from '../model/types';

export const SEED_PAYMENTS: Payment[] = [
  {
    id: 'pay-2026-07',
    organizationId: DEFAULT_ORGANIZATION_ID,
    date: '2026-07-15T10:00:00',
    description: 'Оплата тарифа Pro',
    amount: 4900,
    currency: 'RUB',
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'pay-2026-06',
    organizationId: DEFAULT_ORGANIZATION_ID,
    date: '2026-06-15T10:00:00',
    description: 'Оплата тарифа Pro',
    amount: 4900,
    currency: 'RUB',
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'pay-2026-05',
    organizationId: DEFAULT_ORGANIZATION_ID,
    date: '2026-05-15T10:00:00',
    description: 'Оплата тарифа Pro',
    amount: 4900,
    currency: 'RUB',
    status: 'paid',
    invoiceUrl: '#',
  },
];
