import { cn } from '@/shared/lib/cn';
import { formatMoney } from '@/shared/lib/format';
import { MATERIAL_UNIT_LABEL } from '../model/labels';
import type { Material } from '../model/types';
import { MaterialCategoryBadge, MaterialStatusBadge } from './MaterialBadges';
import styles from './MaterialsTable.module.css';

type MaterialsTableProps = {
  materials: Material[];
  selectedId: string | null;
  onOpen: (material: Material) => void;
};

export function MaterialsTable({ materials, selectedId, onOpen }: MaterialsTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Название материала</th>
            <th>Категория</th>
            <th>Ед. изм.</th>
            <th>Цена за ед.</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr
              key={material.id}
              tabIndex={0}
              className={cn(material.id === selectedId && styles.selected)}
              onClick={() => onOpen(material)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(material);
                }
              }}
            >
              <td>
                <div className={styles.name}>{material.name}</div>
                {material.note ? <div className={styles.note}>{material.note}</div> : null}
              </td>
              <td>
                <MaterialCategoryBadge category={material.category} />
              </td>
              <td>{MATERIAL_UNIT_LABEL[material.unit]}</td>
              <td className={styles.price}>{formatMoney(material.pricePerUnit)}</td>
              <td>
                <MaterialStatusBadge status={material.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
