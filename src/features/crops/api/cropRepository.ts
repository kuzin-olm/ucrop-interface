import { resolveSeasonId } from '@/features/seasons/lib/resolveSeasonId';
import type { CreateCropInput, Crop, UpdateCropInput } from '../model/types';
import { SEED_CROPS } from './seed';

const STORAGE_KEY = 'cropoptimize.crops.v1';
const NETWORK_DELAY_MS = 550;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function inferIcon(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes('пшен')) return 'wheat';
  if (normalized.includes('ячмен')) return 'barley';
  if (normalized.includes('кукуруз')) return 'corn';
  if (normalized.includes('подсолнеч')) return 'sunflower';
  if (normalized.includes('рапс')) return 'rapeseed';
  if (normalized.includes('соя') || normalized.includes('сое')) return 'soy';
  if (normalized.includes('горох')) return 'pea';
  return 'sprout';
}

function normalize(crops: Crop[]): Crop[] {
  return crops.map((crop) => ({ ...crop, seasonId: resolveSeasonId(crop.seasonId) }));
}

function readStore(): Crop[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize([...SEED_CROPS]);
    const parsed = JSON.parse(raw) as Crop[];
    return Array.isArray(parsed) ? normalize(parsed) : normalize([...SEED_CROPS]);
  } catch {
    return normalize([...SEED_CROPS]);
  }
}

function writeStore(crops: Crop[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
}

let memoryStore = readStore();

export const cropRepository = {
  async list(seasonId: string): Promise<Crop[]> {
    await delay(NETWORK_DELAY_MS);
    return memoryStore.filter((crop) => crop.seasonId === seasonId).map((crop) => ({ ...crop }));
  },

  async create(input: CreateCropInput): Promise<Crop> {
    await delay(350);
    const crop: Crop = {
      ...input,
      id: crypto.randomUUID(),
      yieldUnit: 't/ha',
      icon: input.icon ?? inferIcon(input.name),
      lastSeasonResult: {
        yield: input.averageYield,
        trend: [input.averageYield],
      },
    };
    memoryStore = [crop, ...memoryStore];
    writeStore(memoryStore);
    return { ...crop };
  },

  async update(input: UpdateCropInput): Promise<Crop> {
    await delay(300);
    const current = memoryStore.find((crop) => crop.id === input.id);
    if (!current) {
      throw new Error('Культура не найдена');
    }

    const name = input.name ?? current.name;
    const next: Crop = {
      ...current,
      ...input,
      id: current.id,
      yieldUnit: 't/ha',
      icon: input.icon ?? inferIcon(name),
      lastSeasonResult: input.lastSeasonResult ?? current.lastSeasonResult,
    };

    memoryStore = memoryStore.map((crop) => (crop.id === next.id ? next : crop));
    writeStore(memoryStore);
    return { ...next };
  },

  async remove(id: string): Promise<void> {
    await delay(300);
    memoryStore = memoryStore.filter((crop) => crop.id !== id);
    writeStore(memoryStore);
  },
};
