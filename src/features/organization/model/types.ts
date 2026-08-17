export type PlanId = 'free' | 'pro' | 'enterprise';
export type PaymentStatus = 'paid' | 'pending' | 'cancelled';

export type Subscription = {
  plan: PlanId;
  status: 'active';
  limits: {
    maxPlans: number;
    maxFields: number;
    maxEmployees: number;
    maxConcurrentCalculations: number;
  };
  usage: {
    plans: number;
    fields: number;
    employees: number;
    concurrentCalculations: number;
  };
};

export type Payment = {
  id: string;
  organizationId: string;
  date: string;
  description: string;
  amount: number;
  currency: 'RUB';
  status: PaymentStatus;
  invoiceUrl?: string;
};
