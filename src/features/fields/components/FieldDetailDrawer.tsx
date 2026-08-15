import { Button } from '@/shared/ui/Button';
import { Drawer } from '@/shared/ui/Drawer';
import { formatArea, formatPh, formatYield } from '@/shared/lib/format';
import type { Field } from '../model/types';
import { FieldMiniMap } from './FieldMiniMap';
import { FieldStatusBadge } from './FieldStatusBadge';
import styles from './FieldDetailDrawer.module.css';

type FieldDetailDrawerProps = {
  field: Field | null;
  onClose: () => void;
  onEdit: (field: Field) => void;
  onOptimize: (field: Field) => void;
  onAddToPlan: (field: Field) => void;
  onDelete: (field: Field) => void;
};

export function FieldDetailDrawer({
  field,
  onClose,
  onEdit,
  onOptimize,
  onAddToPlan,
  onDelete,
}: FieldDetailDrawerProps) {
  return (
    <Drawer title={field?.name ?? 'Поле'} open={Boolean(field)} onClose={onClose}>
      {field ? (
        <>
          <div className={styles.meta}>
            <span className={styles.area}>{formatArea(field.area)}</span>
            <FieldStatusBadge status={field.status} />
          </div>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Параметры</h4>
            <div className={styles.row}>
              <span className={styles.label}>Тип почвы</span>
              <span className={styles.value}>{field.soilType}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Предшествующая культура</span>
              <span className={styles.value}>{field.previousCrop ?? '—'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>pH</span>
              <span className={styles.value}>{formatPh(field.indicators.ph)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>N / P / K, мг/кг</span>
              <span className={styles.value}>
                {field.indicators.n} / {field.indicators.p} / {field.indicators.k}
              </span>
            </div>
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Контур поля</h4>
            <FieldMiniMap field={field} />
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>История посевов</h4>
            {field.history && field.history.length > 0 ? (
              <div className={styles.history}>
                {field.history.map((item) => (
                  <div key={`${item.year}-${item.crop}`} className={styles.historyRow}>
                    <span className={styles.historyYear}>{item.year}</span>
                    <span>{item.crop}</span>
                    <span className={styles.value}>{formatYield(item.yield)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.note}>История посевов пока не заполнена.</p>
            )}
          </section>

          <div className={styles.actions}>
            <Button onClick={() => onOptimize(field)}>Оптимизировать</Button>
            <Button variant="secondary" onClick={() => onEdit(field)}>
              Редактировать
            </Button>
            <Button variant="ghost" onClick={() => onAddToPlan(field)}>
              Добавить в существующий план
            </Button>
            <Button variant="ghost" onClick={() => onDelete(field)}>
              Удалить поле
            </Button>
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
