import { resolveSeasonId } from '@/features/seasons/lib/resolveSeasonId';
import { CURRENT_USER } from '../model/currentUser';
import type { CalculationPlan, CreatePlanInput, UpdatePlanInput } from '../model/types';
import { SEED_PLANS } from './seed';

const STORAGE_KEY = 'cropoptimize.plans.v1';
const CALC_STEP_MS = 1100;
const CALC_MESSAGES = [
  'Инициализация расчёта',
  'Загрузка характеристик полей',
  'Применение ограничений',
  'Оптимизация распределения культур',
  'Расчёт маржинальной прибыли',
  'Проверка ограничений по годам',
  'Формирование итогового плана',
  'Расчёт завершён',
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalize(plans: CalculationPlan[]): CalculationPlan[] {
  return plans.map((plan) => ({
    ...plan,
    seasonId: resolveSeasonId(plan.seasonId, plan.createdAt),
  }));
}

function readStore(): CalculationPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize([...SEED_PLANS]);
    const parsed = JSON.parse(raw) as CalculationPlan[];
    return Array.isArray(parsed) ? normalize(parsed) : normalize([...SEED_PLANS]);
  } catch {
    return normalize([...SEED_PLANS]);
  }
}

function writeStore(plans: CalculationPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

let memoryStore = readStore();
let warmed = false;
const jobs = new Map<string, number>();

function patch(id: string, updater: (plan: CalculationPlan) => CalculationPlan): CalculationPlan | null {
  const current = memoryStore.find((plan) => plan.id === id);
  if (!current) return null;
  const next = updater(current);
  memoryStore = memoryStore.map((plan) => (plan.id === id ? next : plan));
  writeStore(memoryStore);
  return next;
}

function appendLog(id: string, message: string): void {
  patch(id, (plan) => ({
    ...plan,
    logs: [...plan.logs, { timestamp: new Date().toISOString(), message }],
  }));
}

function stopJob(id: string): void {
  const timer = jobs.get(id);
  if (timer) window.clearInterval(timer);
  jobs.delete(id);
}

function startJob(id: string): void {
  stopJob(id);
  const started = Date.now();
  const plan = memoryStore.find((item) => item.id === id);
  let index = Math.max(0, (plan?.logs.length ?? 0) - 1);

  const timer = window.setInterval(() => {
    index += 1;
    if (index < CALC_MESSAGES.length - 1) {
      appendLog(id, CALC_MESSAGES[index]);
      return;
    }
    stopJob(id);
    patch(id, (current) => ({
      ...current,
      status: 'completed',
      durationSeconds: Math.max(1, Math.round((Date.now() - started) / 1000) + (current.logs.length > 1 ? 2 : 0)),
      logs: [...current.logs, { timestamp: new Date().toISOString(), message: CALC_MESSAGES[CALC_MESSAGES.length - 1] }],
    }));
  }, CALC_STEP_MS);

  jobs.set(id, timer);
}

function resumeJobs(): void {
  memoryStore
    .filter((plan) => plan.status === 'calculating')
    .forEach((plan) => startJob(plan.id));
}

resumeJobs();

export const planRepository = {
  async list(seasonId: string): Promise<CalculationPlan[]> {
    if (!warmed) {
      await delay(500);
      warmed = true;
    }
    return memoryStore
      .filter((plan) => plan.seasonId === seasonId)
      .map((plan) => ({ ...plan, logs: [...plan.logs], crops: [...plan.crops], fieldIds: [...plan.fieldIds] }));
  },

  async create(input: CreatePlanInput): Promise<CalculationPlan> {
    await delay(300);
    const plan: CalculationPlan = {
      id: crypto.randomUUID(),
      seasonId: input.seasonId,
      name: input.name,
      description: input.description,
      goal: input.goal,
      status: input.start ? 'calculating' : 'draft',
      createdBy: input.createdBy ?? CURRENT_USER,
      createdAt: new Date().toISOString(),
      fieldIds: input.fieldIds,
      fieldsCount: input.fieldsCount,
      totalArea: input.totalArea,
      crops: input.crops,
      constraints: input.constraints,
      logs: input.start ? [{ timestamp: new Date().toISOString(), message: CALC_MESSAGES[0] }] : [],
    };
    memoryStore = [plan, ...memoryStore];
    writeStore(memoryStore);
    if (input.start) startJob(plan.id);
    return { ...plan };
  },

  async update(input: UpdatePlanInput): Promise<CalculationPlan> {
    await delay(250);
    const next = patch(input.id, (current) => ({ ...current, ...input, id: current.id }));
    if (!next) throw new Error('План не найден');
    return { ...next };
  },

  async start(id: string): Promise<CalculationPlan> {
    await delay(200);
    const next = patch(id, (current) => ({
      ...current,
      status: 'calculating',
      durationSeconds: undefined,
      logs: [{ timestamp: new Date().toISOString(), message: CALC_MESSAGES[0] }],
    }));
    if (!next) throw new Error('План не найден');
    startJob(id);
    return { ...next };
  },

  async stop(id: string): Promise<CalculationPlan> {
    await delay(200);
    stopJob(id);
    const next = patch(id, (current) => ({
      ...current,
      status: 'draft',
      logs: [...current.logs, { timestamp: new Date().toISOString(), message: 'Расчёт остановлен пользователем' }],
    }));
    if (!next) throw new Error('План не найден');
    return { ...next };
  },

  async remove(id: string): Promise<void> {
    await delay(250);
    stopJob(id);
    memoryStore = memoryStore.filter((plan) => plan.id !== id);
    writeStore(memoryStore);
  },
};
