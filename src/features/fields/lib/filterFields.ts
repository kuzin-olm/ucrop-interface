import type { AreaFilter, Field, FieldFilters } from '../model/types';

function matchesArea(area: number, filter: AreaFilter): boolean {
  if (filter === 'lt50') return area < 50;
  if (filter === 'mid') return area >= 50 && area <= 100;
  if (filter === 'gt100') return area > 100;
  return true;
}

export function filterFields(fields: Field[], filters: FieldFilters): Field[] {
  const query = filters.query.trim().toLowerCase();

  return fields.filter((field) => {
    const matchesQuery = query.length === 0 || field.name.toLowerCase().includes(query);
    const matchesSoil = filters.soil === 'all' || field.soilType === filters.soil;
    const matchesCrop =
      filters.previousCrop === 'all' ||
      (filters.previousCrop === 'none' && field.previousCrop === null) ||
      field.previousCrop === filters.previousCrop;
    return matchesQuery && matchesSoil && matchesCrop && matchesArea(field.area, filters.area);
  });
}

export function hasActiveFilters(filters: FieldFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.soil !== 'all' ||
    filters.previousCrop !== 'all' ||
    filters.area !== 'all'
  );
}
