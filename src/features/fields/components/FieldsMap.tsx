import { useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { formatArea } from '@/shared/lib/format';
import { loadYandexMaps, type YandexMap, type YandexMapsApi } from '@/shared/lib/loadYandexMaps';
import { polygonCentroid, polygonToLatLngs } from '../lib/geometry';
import { FIELD_STATUS_COLOR, FIELD_STATUS_LABEL } from '../model/labels';
import type { Field, FieldStatus } from '../model/types';
import styles from './FieldsMap.module.css';

type FieldsMapProps = {
  fields: Field[];
  selectedId: string | null;
  onSelect: (field: Field) => void;
};

const STATUS_ORDER: FieldStatus[] = ['active', 'planned', 'in_progress', 'inactive'];

function withAlpha(hex: string, alphaHex: string): string {
  return `${hex}${alphaHex}`;
}

function drawFields(
  ymaps: YandexMapsApi,
  map: YandexMap,
  fields: Field[],
  selectedId: string | null,
  onSelect: (field: Field) => void,
): void {
  map.geoObjects.removeAll();

  fields.forEach((field) => {
    const selected = field.id === selectedId;
    const color = field.color ?? FIELD_STATUS_COLOR[field.status];
    const ring = polygonToLatLngs(field.geometry);
    const label = `${field.name} ${formatArea(field.area)}`;

    const polygon = new ymaps.Polygon(
      [ring],
      {
        hintContent: `${field.name} · ${formatArea(field.area)}`,
      },
      {
        fillColor: withAlpha(color, selected ? '8C' : '6B'),
        strokeColor: selected ? '#FFFFFF' : color,
        strokeWidth: selected ? 3 : 2,
        openBalloonOnClick: false,
      },
    );

    const caption = new ymaps.Placemark(
      polygonCentroid(field.geometry),
      { iconCaption: label },
      {
        iconLayout: 'default#image',
        iconImageHref:
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        iconImageSize: [1, 1],
        iconImageOffset: [0, 0],
        iconCaptionMaxWidth: 180,
        hasBalloon: false,
      },
    );

    polygon.events.add('click', () => onSelect(field));
    caption.events.add('click', () => onSelect(field));
    map.geoObjects.add(polygon);
    map.geoObjects.add(caption);
  });
}

function fitToFields(map: YandexMap): void {
  const bounds = map.geoObjects.getBounds();
  if (!bounds) return;
  map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 28 });
}

export function FieldsMap({ fields, selectedId, onSelect }: FieldsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);
  const apiRef = useRef<YandexMapsApi | null>(null);
  const onSelectRef = useRef(onSelect);
  const fieldsRef = useRef(fields);
  const selectedIdRef = useRef(selectedId);
  const [error, setError] = useState<string | null>(null);
  const fieldIds = fields.map((field) => field.id).join(',');

  onSelectRef.current = onSelect;
  fieldsRef.current = fields;
  selectedIdRef.current = selectedId;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    void loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;
        apiRef.current = ymaps;
        const currentFields = fieldsRef.current;
        const first = currentFields[0] ? polygonCentroid(currentFields[0].geometry) : [45.135, 39.05];
        const map = new ymaps.Map(
          containerRef.current,
          {
            center: first,
            zoom: 13,
            type: 'yandex#hybrid',
            controls: ['zoomControl'],
          },
          {
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
          },
        );
        map.controls.get('zoomControl')?.options.set({
          size: 'small',
          position: { left: 10, top: 10 },
        });
        mapRef.current = map;
        drawFields(ymaps, map, currentFields, selectedIdRef.current, (field) => onSelectRef.current(field));
        fitToFields(map);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Не удалось загрузить карту Яндекс');
        }
      });

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const ymaps = apiRef.current;
    if (!map || !ymaps) return;
    drawFields(ymaps, map, fields, selectedId, (field) => onSelectRef.current(field));
  }, [fields, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || fields.length === 0) return;
    fitToFields(map);
  }, [fieldIds, fields.length]);

  const handleFit = () => {
    if (mapRef.current) fitToFields(mapRef.current);
  };

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.map} role="application" aria-label="Карта полей" />

      {error ? (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <p className={styles.errorHint}>
            Укажите ключ в <code>VITE_YANDEX_MAPS_API_KEY</code> (кабинет разработчика Яндекса).
          </p>
        </div>
      ) : null}

      <button type="button" className={styles.fit} onClick={handleFit} aria-label="Показать все поля">
        <Maximize2 size={16} aria-hidden="true" />
      </button>

      <div className={styles.legend} aria-label="Легенда статусов полей">
        {STATUS_ORDER.map((status) => (
          <div key={status} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: FIELD_STATUS_COLOR[status] }} />
            {FIELD_STATUS_LABEL[status]}
          </div>
        ))}
      </div>
    </div>
  );
}
