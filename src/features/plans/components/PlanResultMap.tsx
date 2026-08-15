import { useEffect, useMemo, useRef } from 'react';
import { formatArea } from '@/shared/lib/format';
import { loadYandexMaps, type YandexMap } from '@/shared/lib/loadYandexMaps';
import { polygonCentroid, polygonToLatLngs } from '@/features/fields/lib/geometry';
import type { FieldRecommendation } from '../model/resultTypes';
import styles from './PlanResultMap.module.css';

type PlanResultMapProps = {
  recommendations: FieldRecommendation[];
};

export function PlanResultMap({ recommendations }: PlanResultMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);

  const legend = useMemo(() => {
    const byCrop = new Map<string, { color: string; area: number }>();
    recommendations.forEach((item) => {
      const current = byCrop.get(item.recommendedCrop) ?? { color: item.color, area: 0 };
      current.area += item.area;
      byCrop.set(item.recommendedCrop, current);
    });
    return Array.from(byCrop.entries()).map(([crop, value]) => ({ crop, ...value }));
  }, [recommendations]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || recommendations.length === 0) return;
    let cancelled = false;

    void loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;
        const map = new ymaps.Map(
          containerRef.current,
          { center: [45.135, 39.05], zoom: 13, type: 'yandex#hybrid', controls: ['zoomControl'] },
          { suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true },
        );
        map.controls.get('zoomControl')?.options.set({
          size: 'small',
          position: { left: 10, top: 10 },
        });
        mapRef.current = map;

        recommendations.forEach((item) => {
          const polygon = new ymaps.Polygon(
            [polygonToLatLngs(item.geometry)],
            {
              hintContent: `${item.fieldName} · ${formatArea(item.area)} · ${item.recommendedCrop}`,
              iconCaption: `${item.fieldName} ${formatArea(item.area)}`,
            },
            {
              fillColor: `${item.color}8C`,
              strokeColor: item.color,
              strokeWidth: 2,
              hasBalloon: false,
              openBalloonOnClick: false,
            },
          );
          const caption = new ymaps.Placemark(
            polygonCentroid(item.geometry),
            { iconCaption: `${item.fieldName} ${formatArea(item.area)}` },
            {
              iconLayout: 'default#image',
              iconImageHref:
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
              iconImageSize: [1, 1],
              hasBalloon: false,
            },
          );
          map.geoObjects.add(polygon);
          map.geoObjects.add(caption);
        });

        const bounds = map.geoObjects.getBounds();
        if (bounds) map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 28 });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [recommendations]);

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.map} role="application" aria-label="Карта рекомендаций по полям" />
      <div className={styles.legend} aria-label="Легенда культур">
        <div className={styles.legendTitle}>Культуры</div>
        {legend.map((item) => (
          <div key={item.crop} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: item.color }} />
            <span>{item.crop}</span>
            <span>{formatArea(item.area)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
