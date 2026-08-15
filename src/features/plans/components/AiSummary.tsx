import { AlertTriangle, Layers3, PieChart, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAiSummary } from '../hooks/useAiSummary';
import type { AiSummaryCard, AiSummaryType, PlanResult } from '../model/resultTypes';
import styles from './AiSummary.module.css';

const ICONS: Record<AiSummaryType, typeof TrendingUp> = {
  margin: TrendingUp,
  rotation: Layers3,
  risk: AlertTriangle,
  distribution: PieChart,
  confidence: Sparkles,
};

function Card({ card }: { card: AiSummaryCard }) {
  const Icon = ICONS[card.type];
  return (
    <article className={styles.card}>
      <div className={cn(styles.mark, styles[card.severity])}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <h3 className={styles.cardTitle}>{card.title}</h3>
      <p className={styles.cardText}>{card.description}</p>
    </article>
  );
}

export function AiSummary({ result }: { result: PlanResult }) {
  const { data, isLoading, isError } = useAiSummary(result);
  const count = data?.cards.length ?? 3;

  if (isError) return null;

  return (
    <section className={styles.block} aria-label="ИИ Сводка">
      <header className={styles.head}>
        <div className={styles.titleRow}>
          <Sparkles className={styles.icon} size={20} aria-hidden="true" />
          <h2 className={styles.title}>ИИ Сводка</h2>
        </div>
        <p className={styles.hint}>Сгенерировано на основе результатов расчёта</p>
      </header>

      {isLoading || !data ? (
        <div className={cn(styles.grid, styles.grid3)} aria-busy="true" aria-label="Генерация сводки">
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : (
        <div
          className={cn(
            styles.grid,
            count === 3 && styles.grid3,
            count === 2 && styles.grid2,
          )}
        >
          {data.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}
