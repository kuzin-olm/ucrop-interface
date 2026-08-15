import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { CropIcon } from '@/features/crops/components/CropIcon';
import { formatSignedPerHa, formatYield } from '@/shared/lib/format';
import type { FieldRecommendation } from '../model/resultTypes';
import styles from './PlanResultTable.module.css';

const PAGE_SIZE = 8;

export function PlanResultTable({ recommendations }: { recommendations: FieldRecommendation[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? recommendations : recommendations.slice(0, PAGE_SIZE);

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>Рекомендации по полям</h2>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Поле</th>
              <th>Рекомендованная культура</th>
              <th>Прогноз урожайности (т/га)</th>
              <th>Прогноз маржи (₽/га)</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.fieldId}>
                <td>
                  <span className={styles.field}>
                    <span className={styles.dot} style={{ background: item.color }} aria-hidden="true" />
                    {item.fieldName}
                  </span>
                </td>
                <td>
                  <span className={styles.crop}>
                    <CropIcon crop={{ name: item.recommendedCrop }} size={18} />
                    {item.recommendedCrop}
                  </span>
                </td>
                <td>{formatYield(item.predictedYield)}</td>
                <td className={styles.margin}>{formatSignedPerHa(item.predictedMarginPerHa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {recommendations.length > PAGE_SIZE ? (
        <div className={styles.more}>
          <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Свернуть' : 'Показать все'}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
