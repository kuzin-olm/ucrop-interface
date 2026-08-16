import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { useStartPlan, useStopPlan, usePlans } from '../hooks/usePlans';
import { filterPlans, hasActivePlanFilters } from '../lib/filterPlans';
import type {
  CalculationPlan,
  PeriodFilter,
  PlanAuthor,
  PlanFilters as PlanFiltersState,
  PlanScope,
  PlanStatus,
} from '../model/types';
import { PlanDeleteDialog } from './PlanDeleteDialog';
import { PlanDetailDrawer } from './PlanDetailDrawer';
import { PlanFilters } from './PlanFilters';
import { PlanScopeToggle } from './PlanScopeToggle';
import { PlanWizard } from './PlanWizard';
import { PlansEmptyState } from './PlansEmptyState';
import { PlansErrorState } from './PlansErrorState';
import { PlansSkeleton } from './PlansSkeleton';
import { PlansTable } from './PlansTable';
import styles from './PlansScreen.module.css';

const STATUSES = new Set<PlanStatus>(['draft', 'calculating', 'completed', 'error']);
const PERIODS = new Set<PeriodFilter>(['all', '7d', '30d', 'year']);

function readStatus(value: string | null): PlanFiltersState['status'] {
  if (value && STATUSES.has(value as PlanStatus)) return value as PlanStatus;
  return 'all';
}

function readPeriod(value: string | null): PeriodFilter {
  if (value && PERIODS.has(value as PeriodFilter)) return value as PeriodFilter;
  return 'all';
}

function readScope(value: string | null): PlanScope {
  return value === 'mine' ? 'mine' : 'all';
}

export function PlansScreen() {
  const { notify } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = usePlans();
  const startPlan = useStartPlan();
  const stopPlan = useStopPlan();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<CalculationPlan | null>(null);
  const [presetFieldIds, setPresetFieldIds] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<CalculationPlan | null>(null);

  const filters = useMemo<PlanFiltersState>(
    () => ({
      query: searchParams.get('q') ?? '',
      status: readStatus(searchParams.get('status')),
      author: searchParams.get('author') ?? 'all',
      period: readPeriod(searchParams.get('period')),
      scope: readScope(searchParams.get('scope')),
    }),
    [searchParams],
  );

  const plans = data ?? [];
  const visible = useMemo(
    () => filterPlans(plans, filters, user?.id),
    [plans, filters, user?.id],
  );
  const ownCount = useMemo(
    () => (user ? plans.filter((plan) => plan.createdBy.id === user.id).length : 0),
    [plans, user],
  );
  const selected = plans.find((plan) => plan.id === selectedId) ?? null;
  const filtersActive = hasActivePlanFilters(filters);
  const mineEmpty = filters.scope === 'mine' && ownCount === 0 && !filtersActive;

  const authors = useMemo(() => {
    const map = new Map<string, PlanAuthor>();
    plans.forEach((plan) => map.set(plan.createdBy.id, plan.createdBy));
    return Array.from(map.values());
  }, [plans]);

  useEffect(() => {
    const fieldId = searchParams.get('fieldId');
    if (!fieldId) return;
    setEditing(null);
    setPresetFieldIds([fieldId]);
    setWizardOpen(true);
    const params = new URLSearchParams(searchParams);
    params.delete('fieldId');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const writeFilters = (next: PlanFiltersState) => {
    const params = new URLSearchParams(searchParams);
    if (next.query) params.set('q', next.query);
    else params.delete('q');
    if (next.status !== 'all') params.set('status', next.status);
    else params.delete('status');
    if (next.author !== 'all') params.set('author', next.author);
    else params.delete('author');
    if (next.period !== 'all') params.set('period', next.period);
    else params.delete('period');
    if (next.scope === 'mine') params.set('scope', 'mine');
    else params.delete('scope');
    setSearchParams(params, { replace: true });
  };

  const writeScope = (scope: PlanScope) => {
    const params = new URLSearchParams(searchParams);
    if (scope === 'mine') {
      params.set('scope', 'mine');
      params.delete('author');
    } else {
      params.delete('scope');
    }
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.delete('status');
    params.delete('author');
    params.delete('period');
    setSearchParams(params, { replace: true });
  };

  const openCreate = () => {
    setEditing(null);
    setPresetFieldIds([]);
    setWizardOpen(true);
  };

  const openResult = (plan: CalculationPlan) => {
    navigate(`/plans/${plan.id}/results`);
  };

  const openEdit = (plan: CalculationPlan) => {
    setSelectedId(null);
    setEditing(plan);
    setPresetFieldIds([]);
    setWizardOpen(true);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Планы расчёта</h1>
        <div className={styles.actions}>
          {user ? <PlanScopeToggle value={filters.scope} onChange={writeScope} /> : null}
          <Button icon={<Plus size={16} aria-hidden="true" />} onClick={openCreate}>
            Создать новый план
          </Button>
        </div>
      </header>

      {!isLoading && !isError && plans.length > 0 ? (
        <PlanFilters
          value={filters}
          authors={authors}
          canReset={filtersActive}
          showAuthor={filters.scope === 'all'}
          onChange={writeFilters}
          onReset={resetFilters}
        />
      ) : null}

      {isLoading ? <PlansSkeleton /> : null}
      {isError ? <PlansErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && plans.length === 0 ? (
        <PlansEmptyState
          title="Пока нет планов расчёта"
          text="Создайте первый план оптимизации"
          actionLabel="Создать новый план"
          onAction={openCreate}
          withPlus
        />
      ) : null}

      {!isLoading && !isError && plans.length > 0 && visible.length === 0 && mineEmpty ? (
        <PlansEmptyState
          title="У вас пока нет планов"
          text="Создайте план или откройте все планы организации."
          actionLabel="Создать новый план"
          onAction={openCreate}
          withPlus
        />
      ) : null}

      {!isLoading && !isError && plans.length > 0 && visible.length === 0 && !mineEmpty ? (
        <PlansEmptyState
          title="По выбранным фильтрам ничего не найдено"
          text="Сбросьте фильтры или измените условия поиска."
          actionLabel="Сбросить фильтры"
          onAction={resetFilters}
        />
      ) : null}

      {!isLoading && !isError && visible.length > 0 ? (
        <PlansTable
          plans={visible}
          selectedId={selectedId}
          onOpen={(plan) => setSelectedId(plan.id)}
          onResult={openResult}
        />
      ) : null}

      <PlanWizard
        open={wizardOpen}
        plan={editing}
        presetFieldIds={presetFieldIds}
        onClose={() => {
          setWizardOpen(false);
          setEditing(null);
          setPresetFieldIds([]);
        }}
        onCreated={(name) => {
          setWizardOpen(false);
          setEditing(null);
          setPresetFieldIds([]);
          notify(`План «${name}» запущен`);
        }}
      />

      <PlanDeleteDialog
        plan={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={(name) => {
          setToDelete(null);
          setSelectedId(null);
          notify(`План «${name}» удалён`);
        }}
      />

      <PlanDetailDrawer
        plan={selected}
        onClose={() => setSelectedId(null)}
        pendingAction={startPlan.isPending || stopPlan.isPending}
        onStart={(plan) => {
          void startPlan.mutateAsync(plan.id).then(() => notify(`Расчёт «${plan.name}» запущен`));
        }}
        onStop={(plan) => {
          void stopPlan.mutateAsync(plan.id).then(() => notify(`Расчёт «${plan.name}» остановлен`));
        }}
        onEdit={openEdit}
        onResult={openResult}
        onDelete={(plan) => {
          setSelectedId(null);
          setToDelete(plan);
        }}
      />
    </section>
  );
}
