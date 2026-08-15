import { useEffect, useMemo, useRef, useState } from 'react';
import { formatArea } from '@/shared/lib/format';
import { loadYandexMaps, type YandexMap } from '@/shared/lib/loadYandexMaps';
import { polygonToLatLngs } from '@/features/fields/lib/geometry';
import type { Field } from '@/features/fields/model/types';
import { cn } from '@/shared/lib/cn';
import styles from './PlanFieldsPicker.module.css';

type PlanFieldsPickerProps = {
  fields: Field[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function PlanFieldsPicker({ fields, selectedIds, onChange }: PlanFieldsPickerProps) {
  const [query, setQuery] = useState('');
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);
  const selectedRef = useRef(selectedIds);
  const onChangeRef = useRef(onChange);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return fields;
    return fields.filter((field) => field.name.toLowerCase().includes(normalized));
  }, [fields, query]);

  selectedRef.current = selectedIds;
  onChangeRef.current = onChange;

  const selectedFields = fields.filter((field) => selectedIds.includes(field.id));
  const selectedArea = selectedFields.reduce((sum, field) => sum + field.area, 0);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  useEffect(() => {
    const node = mapNodeRef.current;
    if (!node || fields.length === 0) return;
    let cancelled = false;

    void loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !mapNodeRef.current) return;
        const map = new ymaps.Map(
          mapNodeRef.current,
          { center: [45.135, 39.05], zoom: 13, type: 'yandex#hybrid', controls: ['zoomControl'] },
          { suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true },
        );
        map.controls.get('zoomControl')?.options.set({ size: 'small', position: { right: 10, top: 10 } });
        mapRef.current = map;

        const draw = () => {
          map.geoObjects.removeAll();
          fields.forEach((field) => {
            const selected = selectedRef.current.includes(field.id);
            const polygon = new ymaps.Polygon(
              [polygonToLatLngs(field.geometry)],
              { hintContent: `${field.name} · ${formatArea(field.area)}` },
              {
                fillColor: selected ? '#2E7D328C' : '#90A4AE55',
                strokeColor: selected ? '#2E7D32' : '#90A4AE',
                strokeWidth: selected ? 2 : 1,
                hasBalloon: false,
                openBalloonOnClick: false,
              },
            );
            polygon.events.add('click', () => {
              const current = selectedRef.current;
              onChangeRef.current(
                current.includes(field.id) ? current.filter((id) => id !== field.id) : [...current, field.id],
              );
            });
            map.geoObjects.add(polygon);
          });
        };

        draw();
        const bounds = map.geoObjects.getBounds();
        if (bounds) map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });
        mapNodeRef.current.dataset.ready = '1';
        (map as YandexMap & { __redraw?: () => void }).__redraw = draw;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [fields]);

  useEffect(() => {
    const map = mapRef.current as (YandexMap & { __redraw?: () => void }) | null;
    map?.__redraw?.();
  }, [selectedIds]);

  return (
    <div>
      <p className={styles.counter}>
        Выбрано: {selectedFields.length} {selectedFields.length === 1 ? 'поле' : 'полей'} • {formatArea(selectedArea)}
      </p>
      <div className={styles.picker}>
        <div className={styles.listPane}>
          <input
            className={styles.search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск поля..."
            aria-label="Поиск поля"
          />
          <div className={styles.list}>
            {visible.map((field) => {
              const checked = selectedIds.includes(field.id);
              return (
                <label key={field.id} className={cn(styles.item, checked && styles.checked)}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(field.id)} />
                  <span>
                    <span className={styles.name}>{field.name}</span>
                    <span className={styles.meta}>
                      {formatArea(field.area)} · {field.soilType}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <div className={styles.mapHost}>
          <div ref={mapNodeRef} className={styles.map} role="application" aria-label="Карта выбора полей" />
        </div>
      </div>
    </div>
  );
}
