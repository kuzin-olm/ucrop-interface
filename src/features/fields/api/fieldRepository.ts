import { resolveSeasonId } from '@/features/seasons/lib/resolveSeasonId';
import type { CreateFieldInput, Field, UpdateFieldInput } from '../model/types';
import { FIELD_STATUS_COLOR } from '../model/labels';
import { createPlaceholderPolygon } from '../lib/geometry';
import { SEED_FIELDS } from './seed';

const STORAGE_KEY = 'cropoptimize.fields.v1';
const NETWORK_DELAY_MS = 550;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalize(fields: Field[]): Field[] {
  return fields.map((field) => ({ ...field, seasonId: resolveSeasonId(field.seasonId) }));
}

function readStore(): Field[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize([...SEED_FIELDS]);
    const parsed = JSON.parse(raw) as Field[];
    return Array.isArray(parsed) ? normalize(parsed) : normalize([...SEED_FIELDS]);
  } catch {
    return normalize([...SEED_FIELDS]);
  }
}

function writeStore(fields: Field[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

let memoryStore = readStore();

export const fieldRepository = {
  async list(seasonId: string): Promise<Field[]> {
    await delay(NETWORK_DELAY_MS);
    return memoryStore.filter((field) => field.seasonId === seasonId).map((field) => ({ ...field }));
  },

  async create(input: CreateFieldInput): Promise<Field> {
    await delay(350);
    const neighbors = memoryStore.filter((field) => field.seasonId === input.seasonId);
    const field: Field = {
      ...input,
      id: crypto.randomUUID(),
      areaUnit: 'ha',
      color: input.color ?? FIELD_STATUS_COLOR[input.status],
      geometry: input.geometry ?? createPlaceholderPolygon(neighbors, input.area),
      history: input.history ?? [],
    };
    memoryStore = [field, ...memoryStore];
    writeStore(memoryStore);
    return { ...field };
  },

  async update(input: UpdateFieldInput): Promise<Field> {
    await delay(300);
    const current = memoryStore.find((field) => field.id === input.id);
    if (!current) {
      throw new Error('Поле не найдено');
    }

    const next: Field = {
      ...current,
      ...input,
      id: current.id,
      areaUnit: 'ha',
      color: input.color ?? (input.status ? FIELD_STATUS_COLOR[input.status] : current.color),
    };

    memoryStore = memoryStore.map((field) => (field.id === next.id ? next : field));
    writeStore(memoryStore);
    return { ...next };
  },

  async remove(id: string): Promise<void> {
    await delay(300);
    memoryStore = memoryStore.filter((field) => field.id !== id);
    writeStore(memoryStore);
  },
};
