import { FIELD_STATUS_COLOR } from '../model/labels';
import type { Field } from '../model/types';
import styles from './FieldMiniMap.module.css';

export function FieldMiniMap({ field }: { field: Field }) {
  const ring = field.geometry.coordinates[0];
  const lngs = ring.map(([lng]) => lng);
  const lats = ring.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const padX = (maxLng - minLng || 0.01) * 0.25;
  const padY = (maxLat - minLat || 0.01) * 0.25;
  const width = 320;
  const height = 160;

  const project = ([lng, lat]: [number, number]): string => {
    const x = ((lng - (minLng - padX)) / (maxLng - minLng + padX * 2)) * width;
    const y = (1 - (lat - (minLat - padY)) / (maxLat - minLat + padY * 2)) * height;
    return `${x},${y}`;
  };

  const points = ring.map(project).join(' ');
  const color = field.color ?? FIELD_STATUS_COLOR[field.status];

  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg className={styles.svg} viewBox={`0 0 ${width} ${height}`}>
        <rect width={width} height={height} fill="#d7e3d1" />
        <polygon points={points} fill={color} fillOpacity="0.45" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );
}
