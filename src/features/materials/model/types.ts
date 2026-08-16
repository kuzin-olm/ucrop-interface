export type MaterialCategory = 'seeds' | 'fertilizer' | 'ppp' | 'fuel';
export type MaterialUnit = 'kg' | 'l' | 't' | 'se' | 'pcs';
export type MaterialStatus = 'active' | 'inactive';

export interface Material {
  id: string;
  seasonId?: string;
  name: string;
  note?: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  pricePerUnit: number;
  status: MaterialStatus;
}

export type CreateMaterialInput = Omit<Material, 'id'>;
export type UpdateMaterialInput = Partial<Omit<Material, 'id'>> & { id: string };
export type MaterialFilter = 'all' | MaterialCategory;
