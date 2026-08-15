import type { Crop, CropFilter } from '../model/types';

export function filterCrops(crops: Crop[], category: CropFilter, query: string): Crop[] {
  const normalizedQuery = query.trim().toLowerCase();

  return crops.filter((crop) => {
    const matchesCategory = category === 'all' || crop.category === category;
    const matchesQuery = normalizedQuery.length === 0 || crop.name.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}
