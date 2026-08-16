import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useSeason } from '@/app/season';
import { Button } from '@/shared/ui/Button';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { PlansErrorState } from '@/features/plans/components/PlansErrorState';
import { buildDashboard } from '../lib/buildDashboard';
import { StatusDonut } from './StatusDonut';
import { TeamActivity } from './TeamActivity';
import styles from './DashboardScreen.module.css';

export function DashboardScreen() {
  const { seasonName } = useSeason();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = usePlans();
  const employees = useEmployees();

  const dashboard = useMemo(
    () =>
      buildDashboard(
        data ?? [],
        seasonName,
        (employees.data ?? [])
          .filter((employee) => employee.status === 'active')
          .map((employee) => ({ id: employee.id, name: employee.fullName })),
      ),
    [data, employees.data, seasonName],
  );

  if (isLoading || employees.isLoading) {
    return (
      <section className={styles.page} aria-busy="true" aria-label="Загрузка дашборда">
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <span className={styles.season}>Сезон {seasonName}</span>
        </header>
        <div className={styles.grid}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      </section>
    );
  }

  if (isError) {
    return <PlansErrorState title="Не удалось загрузить данные дашборда" onRetry={() => void refetch()} />;
  }

  if (dashboard.plansByStatus.total === 0) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <span className={styles.season}>Сезон {seasonName}</span>
        </header>
        <div className={styles.empty}>
          <LayoutDashboard size={48} aria-hidden="true" />
          <h2>Создайте первый план оптимизации</h2>
          <p>В сезоне {seasonName} планов ещё нет — сводка появится после первого расчёта.</p>
          <Button onClick={() => navigate('/plans')}>К планам расчёта</Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.season}>Сезон {seasonName}</span>
      </header>
      <div className={styles.grid}>
        <StatusDonut data={dashboard.plansByStatus} />
        <TeamActivity rows={dashboard.teamActivity} />
      </div>
    </section>
  );
}
