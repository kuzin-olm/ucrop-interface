import type { Material, MaterialFilter } from '../model/types';

export function filterMaterials(materials: Material[], category: MaterialFilter, query: string): Material[] {
  const needle = query.trim().toLowerCase();
  return materials.filter((material) => {
    const matchesCategory = category === 'all' || material.category === category;
    const matchesQuery =
      needle.length === 0 ||
      material.name.toLowerCase().includes(needle) ||
      (material.note ?? '').toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  });
}
