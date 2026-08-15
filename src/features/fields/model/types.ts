export type FieldStatus = 'active' | 'planned' | 'in_progress' | 'inactive';
export type AreaFilter = 'all' | 'lt50' | 'mid' | 'gt100';

export type FieldPolygon = {
  type: 'Polygon';
  coordinates: [number, number][][];
};

export type FieldHistoryItem = {
  year: number;
  crop: string;
  yield: number;
};

export interface Field {
  id: string;
  seasonId?: string;
  name: string;
  area: number;
  areaUnit: 'ha';
  soilType: string;
  previousCrop: string | null;
  status: FieldStatus;
  indicators: {
    ph: number;
    n: number;
    p: number;
    k: number;
  };
  geometry: FieldPolygon;
  color?: string;
  history?: FieldHistoryItem[];
}

export type CreateFieldInput = Omit<Field, 'id' | 'areaUnit' | 'geometry' | 'color'> & {
  geometry?: FieldPolygon;
  color?: string;
};

export type UpdateFieldInput = Partial<Omit<Field, 'id' | 'areaUnit'>> & {
  id: string;
};

export type FieldFilters = {
  query: string;
  soil: string;
  previousCrop: string;
  area: AreaFilter;
};
