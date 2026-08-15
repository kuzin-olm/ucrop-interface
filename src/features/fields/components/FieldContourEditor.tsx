import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { formatHa } from '@/shared/lib/format';
import { loadYandexMaps, type YandexGeoObject, type YandexMap, type YandexMapsApi } from '@/shared/lib/loadYandexMaps';
import { latLngsToPolygon, polygonAreaHa, polygonToLatLngs } from '../lib/geometry';
import type { Field, FieldPolygon } from '../model/types';
import styles from './FieldContourEditor.module.css';

export type ContourMode = 'idle' | 'drawing' | 'editing';

type FieldContourEditorProps = {
  initialGeometry: FieldPolygon | null;
  neighbors: Field[];
  onChange: (geometry: FieldPolygon | null) => void;
  onModeChange: (mode: ContourMode) => void;
};

const EDITOR_EVENTS = ['vertexadd', 'vertexdragend', 'vertexremove', 'edgedragend', 'drawingstop'];

function readGeometry(polygon: YandexGeoObject): FieldPolygon | null {
  const coordinates = polygon.geometry?.getCoordinates();
  const ring = coordinates?.[0];
  if (!ring) return null;
  return latLngsToPolygon(ring);
}

export function FieldContourEditor({
  initialGeometry,
  neighbors,
  onChange,
  onModeChange,
}: FieldContourEditorProps) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);
  const polygonRef = useRef<YandexGeoObject | null>(null);
  const apiRef = useRef<YandexMapsApi | null>(null);
  const onChangeRef = useRef(onChange);
  const [mode, setMode] = useState<ContourMode>('idle');
  const [hasContour, setHasContour] = useState(Boolean(initialGeometry));
  const [areaHa, setAreaHa] = useState(initialGeometry ? polygonAreaHa(initialGeometry) : 0);
  const [error, setError] = useState<string | null>(null);

  onChangeRef.current = onChange;

  const setEditorMode = (next: ContourMode) => {
    setMode(next);
    onModeChange(next);
  };

  const publish = (geometry: FieldPolygon | null) => {
    setHasContour(Boolean(geometry));
    setAreaHa(geometry ? polygonAreaHa(geometry) : 0);
    onChangeRef.current(geometry);
  };

  useEffect(() => {
    const node = mapNodeRef.current;
    if (!node) return;
    let cancelled = false;

    const syncFromPolygon = () => {
      if (cancelled) return;
      const polygon = polygonRef.current;
      if (!polygon) return;
      publish(readGeometry(polygon));
    };

    void loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !mapNodeRef.current) return;
        apiRef.current = ymaps;

        const map = new ymaps.Map(
          mapNodeRef.current,
          {
            center: [45.135, 39.05],
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
          position: { right: 10, top: 10 },
        });
        mapRef.current = map;

        neighbors.forEach((field) => {
          const neighbor = new ymaps.Polygon(
            [polygonToLatLngs(field.geometry)],
            { hintContent: field.name },
            {
              fillColor: '#90A4AE55',
              strokeColor: '#90A4AE',
              strokeWidth: 1,
              interactivityModel: 'default#silent',
              hasBalloon: false,
            },
          );
          map.geoObjects.add(neighbor);
        });

        const working = new ymaps.Polygon(
          initialGeometry ? [polygonToLatLngs(initialGeometry)] : [],
          {},
          {
            fillColor: '#2E7D326B',
            strokeColor: '#2E7D32',
            strokeWidth: 2,
            editorDrawingCursor: 'crosshair',
            editorMaxPoints: 32,
            openBalloonOnClick: false,
            hasBalloon: false,
          },
        );
        map.geoObjects.add(working);
        polygonRef.current = working;
        working.editor?.events.add(EDITOR_EVENTS, syncFromPolygon);

        const bounds = map.geoObjects.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 24 });
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Не удалось загрузить карту');
        }
      });

    return () => {
      cancelled = true;
      const polygon = polygonRef.current;
      polygon?.editor?.stopDrawing();
      polygon?.editor?.stopEditing();
      mapRef.current?.destroy();
      mapRef.current = null;
      polygonRef.current = null;
    };
    // Карта живёт, пока открыта модалка; соседи и исходный контур берутся на mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDrawing = () => {
    const polygon = polygonRef.current;
    if (!polygon?.editor || !polygon.geometry) return;
    polygon.editor.stopEditing();
    polygon.geometry.setCoordinates([]);
    publish(null);
    polygon.editor.startDrawing();
    setEditorMode('drawing');
  };

  const startEditing = () => {
    const polygon = polygonRef.current;
    if (!polygon?.editor) return;
    polygon.editor.stopDrawing();
    polygon.editor.startEditing();
    setEditorMode('editing');
  };

  const finish = () => {
    const polygon = polygonRef.current;
    polygon?.editor?.stopDrawing();
    polygon?.editor?.stopEditing();
    if (polygon) publish(readGeometry(polygon));
    setEditorMode('idle');
  };

  const clearContour = () => {
    const polygon = polygonRef.current;
    polygon?.editor?.stopDrawing();
    polygon?.editor?.stopEditing();
    polygon?.geometry?.setCoordinates([]);
    publish(null);
    setEditorMode('idle');
  };

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h3 className={styles.title}>Контур поля</h3>
        <span className={hasContour ? `${styles.status} ${styles.ready}` : styles.status}>
          {hasContour ? `Задан · ≈ ${formatHa(areaHa)} га` : 'Не задан'}
        </span>
      </div>

      <div className={styles.toolbar}>
        {mode === 'idle' ? (
          <>
            <Button type="button" size="sm" variant={hasContour ? 'secondary' : 'primary'} onClick={startDrawing}>
              {hasContour ? 'Нарисовать заново' : 'Нарисовать контур'}
            </Button>
            {hasContour ? (
              <Button type="button" size="sm" variant="secondary" onClick={startEditing}>
                Изменить вершины
              </Button>
            ) : null}
            {hasContour ? (
              <Button type="button" size="sm" variant="ghost" onClick={clearContour}>
                Очистить
              </Button>
            ) : null}
          </>
        ) : (
          <Button type="button" size="sm" onClick={finish}>
            Завершить
          </Button>
        )}
      </div>

      <div className={styles.mapHost}>
        <div ref={mapNodeRef} className={styles.map} role="application" aria-label="Редактор контура поля" />
      </div>

      {error ? (
        <p className={styles.error}>{error}. Поле можно сохранить без контура — он будет построен автоматически.</p>
      ) : (
        <p className={styles.hint}>
          {mode === 'drawing'
            ? 'Кликайте по карте, чтобы поставить вершины. Двойной клик замыкает контур.'
            : mode === 'editing'
              ? 'Перетаскивайте вершины и рёбра. Нажмите «Завершить», когда контур готов.'
              : hasContour
                ? 'Контур сохранится вместе с полем и появится на общей карте.'
                : 'Без контура при сохранении будет построен служебный прямоугольник.'}
        </p>
      )}
    </section>
  );
}
