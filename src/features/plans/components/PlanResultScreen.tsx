import { lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatArea, formatSignedPerHa } from '@/shared/lib/format';
import { usePlanResult } from '../hooks/usePlanResult';
import { PlanStatusBadge } from './PlanStatusBadge';
import { PlansEmptyState } from './PlansEmptyState';
import { PlansErrorState } from './PlansErrorState';
import { AiSummary } from './AiSummary';
import { PlanResultTable } from './PlanResultTable';
import styles from './PlanResultScreen.module.css';

const PlanResultMap = lazy(() => import('./PlanResultMap').then((module) => ({ default: module.PlanResultMap })));

export function PlanResultScreen() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { plan, result, isLoading, isError, refetch } = usePlanResult(planId);

  if (isLoading) {
    return (
      <section className={styles.page} aria-busy="true" aria-label="Загрузка результатов">
        <div className={styles.kpis}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
        <div className={styles.split}>
          <div className={`${styles.skeleton} ${styles.mapSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.mapSkeleton}`} />
        </div>
      </section>
    );
  }

  if (isError) {
    return <PlansErrorState title="Не удалось загрузить результаты" onRetry={() => void refetch()} />;
  }

  if (!plan) {
    return (
      <PlansEmptyState
        title="План не найден"
        text="Вернитесь к списку планов и выберите завершённый расчёт."
        actionLabel="К планам расчёта"
        onAction={() => navigate('/plans')}
      />
    );
  }

  if (plan.status !== 'completed' || !result) {
    return (
      <PlansEmptyState
        title="Результаты ещё недоступны"
        text="Результаты появляются после завершения расчёта."
        actionLabel="К планам расчёта"
        onAction={() => navigate('/plans')}
      />
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{result.planName}</h1>
          <PlanStatusBadge status="completed" />
        </div>
        <p className={styles.subtitle}>План расчёта завершён • Результаты оптимизации</p>
      </header>

      <div className={styles.kpis}>
        <article className={styles.kpi}>
          <div className={styles.kpiValue}>{formatSignedPerHa(result.kpis.predictedMarginPerHa)}</div>
          <div className={styles.kpiLabel}>Прогнозная маржа</div>
          <div className={styles.kpiHint}>на 1 га</div>
        </article>
        <article className={styles.kpi}>
          <div className={styles.kpiValue}>{formatArea(result.kpis.totalArea)}</div>
          <div className={styles.kpiLabel}>Общая площадь</div>
          <div className={styles.kpiHint}>по {result.kpis.fieldsCount} полям</div>
        </article>
        <article className={styles.kpi}>
          <div className={styles.kpiValue}>{result.kpis.fieldsCount}</div>
          <div className={styles.kpiLabel}>Полей в плане</div>
          <div className={styles.kpiHint}>в обработке</div>
        </article>
      </div>

      <div className={styles.split}>
        <Suspense fallback={<div className={`${styles.skeleton} ${styles.mapSkeleton}`} />}>
          <PlanResultMap recommendations={result.fieldRecommendations} />
        </Suspense>
        <PlanResultTable recommendations={result.fieldRecommendations} />
      </div>

      <AiSummary result={result} />
    </section>
  );
}
