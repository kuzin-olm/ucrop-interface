export type CropCategory = 'grain' | 'oilseed' | 'legume' | 'other';
export type CropStatus = 'sowing_now' | 'planned' | 'history';
export type MarginPotential = 'high' | 'medium' | 'low';

export interface Crop {
  id: string;
  seasonId?: string;
  name: string;
  category: CropCategory;
  status: CropStatus;
  averageYield: number;
  yieldUnit: 't/ha';
  sowingWindow: {
    start: string;
    end: string;
  };
  preferredSoil: string;
  marginPotential: MarginPotential;
  lastSeasonResult: {
    yield: number;
    trend: number[];
  };
  icon?: string;
}

export type CreateCropInput = Omit<Crop, 'id' | 'yieldUnit' | 'lastSeasonResult' | 'icon'> & {
  icon?: string;
};

export type UpdateCropInput = Partial<Omit<Crop, 'id' | 'yieldUnit'>> & {
  id: string;
};

export type CropFilter = 'all' | CropCategory;
