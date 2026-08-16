import { Banknote, CalendarRange, Coins, Layers3, TrendingUp } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { formatSellPrice, formatSowingWindow, formatYield } from '@/shared/lib/format';
import { MARGIN_LABEL, STATUS_LABEL } from '../model/labels';
import type { Crop } from '../model/types';
import { CropIcon } from './CropIcon';
import { CropSparkline } from './CropSparkline';
import styles from './CropCard.module.css';

type CropCardProps = {
  crop: Crop;
  onOpen: (crop: Crop) => void;
};

export function CropCard({ crop, onOpen }: CropCardProps) {
  const trend = crop.lastSeasonResult.trend;
  const rising = trend[trend.length - 1] >= trend[0];

  return (
    <article
      className={styles.card}
      tabIndex={0}
      role="button"
      aria-label={`${crop.name}, ${STATUS_LABEL[crop.status]}`}
      onClick={() => onOpen(crop)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(crop);
        }
      }}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrap}>
            <CropIcon crop={crop} />
          </div>
          <h3 className={styles.title}>{crop.name}</h3>
        </div>
        <Badge tone={crop.status}>{STATUS_LABEL[crop.status]}</Badge>
      </div>

      <ul className={styles.params}>
        <li className={styles.param}>
          <TrendingUp size={16} className={styles.paramIcon} aria-hidden="true" />
          <span className={styles.paramLabel}>Урожайность (ср.)</span>
          <span className={styles.paramValue}>{formatYield(crop.averageYield)}</span>
        </li>
        <li className={styles.param}>
          <CalendarRange size={16} className={styles.paramIcon} aria-hidden="true" />
          <span className={styles.paramLabel}>Сроки сева</span>
          <span className={styles.paramValue}>
            {formatSowingWindow(crop.sowingWindow.start, crop.sowingWindow.end)}
          </span>
        </li>
        <li className={styles.param}>
          <Layers3 size={16} className={styles.paramIcon} aria-hidden="true" />
          <span className={styles.paramLabel}>Предпочтительная почва</span>
          <span className={styles.paramValue}>{crop.preferredSoil}</span>
        </li>
        <li className={styles.param}>
          <Coins size={16} className={styles.paramIcon} aria-hidden="true" />
          <span className={styles.paramLabel}>Маржинальность</span>
          <span className={`${styles.paramValue} ${styles[crop.marginPotential]}`}>
            {MARGIN_LABEL[crop.marginPotential]}
          </span>
        </li>
        <li className={styles.param}>
          <Banknote size={16} className={styles.paramIcon} aria-hidden="true" />
          <span className={styles.paramLabel}>Цена реализации</span>
          <span className={styles.paramValue}>{formatSellPrice(crop.expectedSellPrice)}</span>
        </li>
      </ul>

      <div className={styles.season}>
        <div className={styles.seasonMeta}>
          <span className={styles.seasonLabel}>Результат прошлого сезона</span>
          <span className={styles.seasonValue}>{formatYield(crop.lastSeasonResult.yield)}</span>
        </div>
        <CropSparkline values={trend} rising={rising} />
      </div>

      <span className={styles.more}>Подробнее</span>
    </article>
  );
}
