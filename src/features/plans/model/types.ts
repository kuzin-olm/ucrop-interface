export type PlanGoal = 'maximize_margin';
export type PlanStatus = 'draft' | 'calculating' | 'completed' | 'error';
export type PeriodFilter = 'all' | '7d' | '30d' | 'year';

export type PlanAuthor = {
  id: string;
  name: string;
  role: string;
};

export type PlanConstraints = {
  budgetLimit?: number;
  marginDeviationPercent?: number;
  minAreaPerCrop?: number;
  maxAreaPerCrop?: number;
};

export type PlanLog = {
  timestamp: string;
  message: string;
};

export interface CalculationPlan {
  id: string;
  seasonId?: string;
  name: string;
  description?: string;
  goal: PlanGoal;
  status: PlanStatus;
  createdBy: PlanAuthor;
  createdAt: string;
  durationSeconds?: number;
  fieldIds: string[];
  fieldsCount: number;
  totalArea: number;
  crops: string[];
  constraints: PlanConstraints;
  logs: PlanLog[];
}

export type CreatePlanInput = {
  seasonId?: string;
  createdBy?: PlanAuthor;
  name: string;
  description?: string;
  goal: PlanGoal;
  fieldIds: string[];
  fieldsCount: number;
  totalArea: number;
  crops: string[];
  constraints: PlanConstraints;
  start: boolean;
};

export type UpdatePlanInput = Partial<Omit<CalculationPlan, 'id' | 'createdBy' | 'createdAt'>> & {
  id: string;
};

export type PlanFilters = {
  query: string;
  status: 'all' | PlanStatus;
  author: string;
  period: PeriodFilter;
};
