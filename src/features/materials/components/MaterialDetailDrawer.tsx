import { Package } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Drawer } from '@/shared/ui/Drawer';
import { formatMoney } from '@/shared/lib/format';
import { MATERIAL_UNIT_LABEL } from '../model/labels';
import type { Material } from '../model/types';
import { MaterialCategoryBadge, MaterialStatusBadge } from './MaterialBadges';
import styles from './MaterialDetailDrawer.module.css';

type MaterialDetailDrawerProps = {
  material: Material | null;
  onClose: () => void;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
};

export function MaterialDetailDrawer({ material, onClose, onEdit, onDelete }: MaterialDetailDrawerProps) {
  return (
    <Drawer title="Карточка материала" open={Boolean(material)} onClose={onClose}>
      {material ? (
        <>
          <div className={styles.hero}>
            <div className={styles.iconWrap}>
              <Package size={28} aria-hidden="true" />
            </div>
            <div className={styles.heroText}>
              <h3 className={styles.name}>{material.name}</h3>
              <MaterialStatusBadge status={material.status} />
            </div>
          </div>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Параметры</h4>
            <div className={styles.row}>
              <span className={styles.label}>Категория</span>
              <span className={styles.value}>
                <MaterialCategoryBadge category={material.category} />
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Единица измерения</span>
              <span className={styles.value}>{MATERIAL_UNIT_LABEL[material.unit]}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Цена за единицу</span>
              <span className={styles.value}>{formatMoney(material.pricePerUnit)}</span>
            </div>
            {material.note ? (
              <div className={styles.row}>
                <span className={styles.label}>Примечание</span>
                <span className={styles.value}>{material.note}</span>
              </div>
            ) : null}
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>В планах</h4>
            <p className={styles.note}>Нормы внесения и связь с культурами появятся позже.</p>
          </section>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => onEdit(material)}>
              Редактировать
            </Button>
            <Button variant="ghost" onClick={() => onDelete(material)}>
              Удалить материал
            </Button>
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
