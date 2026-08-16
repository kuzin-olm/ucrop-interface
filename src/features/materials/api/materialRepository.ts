import { resolveSeasonId } from '@/features/seasons/lib/resolveSeasonId';
import type { CreateMaterialInput, Material, UpdateMaterialInput } from '../model/types';
import { SEED_MATERIALS } from './seed';

const STORAGE_KEY = 'cropoptimize.materials.v1';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalize(materials: Material[]): Material[] {
  return materials.map((material) => ({
    ...material,
    seasonId: resolveSeasonId(material.seasonId),
  }));
}

function readStore(): Material[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize([...SEED_MATERIALS]);
    const parsed = JSON.parse(raw) as Material[];
    return Array.isArray(parsed) ? normalize(parsed) : normalize([...SEED_MATERIALS]);
  } catch {
    return normalize([...SEED_MATERIALS]);
  }
}

function writeStore(materials: Material[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

let memoryStore = readStore();

export const materialRepository = {
  async list(seasonId: string): Promise<Material[]> {
    await delay(420);
    return memoryStore.filter((material) => material.seasonId === seasonId).map((material) => ({ ...material }));
  },

  async create(input: CreateMaterialInput): Promise<Material> {
    await delay(280);
    const material: Material = {
      ...input,
      id: crypto.randomUUID(),
      name: input.name.trim(),
      note: input.note?.trim() || undefined,
      pricePerUnit: Number(input.pricePerUnit) || 0,
    };
    memoryStore = [material, ...memoryStore];
    writeStore(memoryStore);
    return { ...material };
  },

  async update(input: UpdateMaterialInput): Promise<Material> {
    await delay(250);
    const current = memoryStore.find((material) => material.id === input.id);
    if (!current) throw new Error('Материал не найден');
    const next: Material = {
      ...current,
      ...input,
      id: current.id,
      name: (input.name ?? current.name).trim(),
      note: input.note === undefined ? current.note : input.note.trim() || undefined,
    };
    memoryStore = memoryStore.map((material) => (material.id === next.id ? next : material));
    writeStore(memoryStore);
    return { ...next };
  },

  async remove(id: string): Promise<void> {
    await delay(250);
    memoryStore = memoryStore.filter((material) => material.id !== id);
    writeStore(memoryStore);
  },
};
