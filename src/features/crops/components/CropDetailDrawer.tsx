import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Drawer } from '@/shared/ui/Drawer';
import { formatSellPrice, formatSowingWindow, formatYield } from '@/shared/lib/format';
import { CATEGORY_LABEL, MARGIN_LABEL, STATUS_LABEL } from '../model/labels';
import type { Crop } from '../model/types';
import { CropIcon } from './CropIcon';
import { CropSparkline } from './CropSparkline';
import styles from './CropDetailDrawer.module.css';

type CropDetailDrawerProps = {
  crop: Crop | null;
  onClose: () => void;
  onEdit: (crop: Crop) => void;
  onDelete: (crop: Crop) => void;
};

export function CropDetailDrawer({ crop, onClose, onEdit, onDelete }: CropDetailDrawerProps) {
  const trend = crop?.lastSeasonResult.trend ?? [];
  const rising = trend.length > 1 ? trend[trend.length - 1] >= trend[0] : true;

  return (
    <Drawer title="Карточка культуры" open={Boolean(crop)} onClose={onClose}>
      {crop ? (
        <>
          <div className={styles.hero}>
            <div className={styles.iconWrap}>
              <CropIcon crop={crop} size={28} />
            </div>
            <div className={styles.heroText}>
              <h3 className={styles.name}>{crop.name}</h3>
              <Badge tone={crop.status}>{STATUS_LABEL[crop.status]}</Badge>
            </div>
          </div>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Параметры</h4>
            <div className={styles.row}>
              <span className={styles.label}>Категория</span>
              <span className={styles.value}>{CATEGORY_LABEL[crop.category]}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Урожайность (ср.)</span>
              <span className={styles.value}>{formatYield(crop.averageYield)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Сроки сева</span>
              <span className={styles.value}>
                {formatSowingWindow(crop.sowingWindow.start, crop.sowingWindow.end)}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Почва</span>
              <span className={styles.value}>{crop.preferredSoil}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Маржинальность</span>
              <span className={styles.value}>{MARGIN_LABEL[crop.marginPotential]}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Ожидаемая цена реализации</span>
              <span className={styles.value}>{formatSellPrice(crop.expectedSellPrice)}</span>
            </div>
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>История урожайности</h4>
            <CropSparkline values={trend} rising={rising} />
            <div className={styles.row}>
              <span className={styles.label}>Прошлый сезон</span>
              <span className={styles.value}>{formatYield(crop.lastSeasonResult.yield)}</span>
            </div>
            <p className={styles.note}>Полный график за 3–5 лет появится в design-crop-detail.</p>
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Поля</h4>
            <p className={styles.note}>Список полей, где использовалась культура, будет здесь.</p>
          </section>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => onEdit(crop)}>
              Редактировать
            </Button>
            <Button disabled>Использовать в новом плане</Button>
            <Button variant="ghost" onClick={() => onDelete(crop)}>
              Удалить культуру
            </Button>
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
