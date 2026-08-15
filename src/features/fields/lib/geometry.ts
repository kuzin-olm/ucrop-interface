import type { Field, FieldPolygon } from '../model/types';

export function polygonToLatLngs(geometry: FieldPolygon): [number, number][] {
  return geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
}

export function latLngsToPolygon(ring: number[][]): FieldPolygon | null {
  const unique = ring.filter((point, index) => {
    if (index === 0) return true;
    const prev = ring[index - 1];
    return point[0] !== prev[0] || point[1] !== prev[1];
  });

  if (unique.length < 3) return null;

  const geo = unique.map(([lat, lng]) => [lng, lat] as [number, number]);
  const first = geo[0];
  const last = geo[geo.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    geo.push([first[0], first[1]]);
  }

  return { type: 'Polygon', coordinates: [geo] };
}

export function polygonAreaHa(geometry: FieldPolygon): number {
  const ring = geometry.coordinates[0];
  if (ring.length < 3) return 0;

  const closed =
    ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring
      : [...ring, ring[0]];
  const lat0 = (closed[0][1] * Math.PI) / 180;
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos(lat0);

  let sum = 0;
  for (let index = 0; index < closed.length - 1; index += 1) {
    const x1 = closed[index][0] * metersPerDegLng;
    const y1 = closed[index][1] * metersPerDegLat;
    const x2 = closed[index + 1][0] * metersPerDegLng;
    const y2 = closed[index + 1][1] * metersPerDegLat;
    sum += x1 * y2 - x2 * y1;
  }

  return Math.abs(sum) / 2 / 10_000;
}

export function polygonCentroid(geometry: FieldPolygon): [number, number] {
  const ring = polygonToLatLngs(geometry);
  const closed =
    ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const points = closed ? ring.slice(0, -1) : ring;
  const sum = points.reduce<[number, number]>(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0],
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

export function boundsFromFields(fields: Field[]): [number, number][] | null {
  const points = fields.flatMap((field) => polygonToLatLngs(field.geometry));
  if (points.length === 0) return null;
  return points;
}

export function createPlaceholderPolygon(existing: Field[], areaHa: number): FieldPolygon {
  const allLngs = existing.flatMap((field) => field.geometry.coordinates[0].map(([lng]) => lng));
  const allLats = existing.flatMap((field) => field.geometry.coordinates[0].map(([, lat]) => lat));

  const originLng = allLngs.length > 0 ? Math.max(...allLngs) + 0.004 : 39.1;
  const originLat = allLats.length > 0 ? Math.min(...allLats) : 45.13;
  const lat = originLat + 0.004;

  const sideKm = Math.sqrt(Math.max(areaHa, 10) / 100);
  const dLat = sideKm / 111;
  const dLng = sideKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    type: 'Polygon',
    coordinates: [
      [
        [originLng, originLat],
        [originLng + dLng, originLat],
        [originLng + dLng, originLat + dLat],
        [originLng, originLat + dLat],
        [originLng, originLat],
      ],
    ],
  };
}
