import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { useEmployees } from '../hooks/useEmployees';
import { filterEmployees, hasActiveEmployeeFilters } from '../lib/filterEmployees';
import type { Employee, EmployeeFilters as EmployeeFiltersState, EmployeeRole, EmployeeStatus } from '../model/types';
import { EditEmployeeModal } from './EditEmployeeModal';
import { EmployeeFilters } from './EmployeeFilters';
import { EmployeesEmptyState } from './EmployeesEmptyState';
import { EmployeesErrorState } from './EmployeesErrorState';
import { EmployeesSkeleton } from './EmployeesSkeleton';
import { EmployeesTable } from './EmployeesTable';
import { InviteEmployeeModal } from './InviteEmployeeModal';
import styles from './EmployeesScreen.module.css';

const ROLES = new Set<EmployeeRole>(['admin', 'agronomist', 'analyst']);
const STATUSES = new Set<EmployeeStatus>(['active', 'inactive']);

function readRole(value: string | null): EmployeeFiltersState['role'] {
  if (value && ROLES.has(value as EmployeeRole)) return value as EmployeeRole;
  return 'all';
}

function readStatus(value: string | null): EmployeeFiltersState['status'] {
  if (value && STATUSES.has(value as EmployeeStatus)) return value as EmployeeStatus;
  return 'all';
}

export function EmployeesScreen() {
  const { notify } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = useEmployees();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const filters = useMemo<EmployeeFiltersState>(
    () => ({
      query: searchParams.get('q') ?? '',
      role: readRole(searchParams.get('role')),
      status: readStatus(searchParams.get('status')),
    }),
    [searchParams],
  );

  const employees = data ?? [];
  const visible = useMemo(() => filterEmployees(employees, filters), [employees, filters]);
  const filtersActive = hasActiveEmployeeFilters(filters);

  const writeFilters = (next: EmployeeFiltersState) => {
    const params = new URLSearchParams(searchParams);
    if (next.query) params.set('q', next.query);
    else params.delete('q');
    if (next.role !== 'all') params.set('role', next.role);
    else params.delete('role');
    if (next.status !== 'all') params.set('status', next.status);
    else params.delete('status');
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.delete('role');
    params.delete('status');
    setSearchParams(params, { replace: true });
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Сотрудники</h1>
        <Button icon={<Plus size={16} aria-hidden="true" />} onClick={() => setInviteOpen(true)}>
          Пригласить сотрудника
        </Button>
      </header>

      {!isLoading && !isError && employees.length > 0 ? (
        <EmployeeFilters value={filters} canReset={filtersActive} onChange={writeFilters} onReset={resetFilters} />
      ) : null}

      {isLoading ? <EmployeesSkeleton /> : null}
      {isError ? <EmployeesErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && employees.length === 0 ? (
        <EmployeesEmptyState
          title="Пока нет сотрудников"
          text="Пригласите первого сотрудника"
          actionLabel="Пригласить сотрудника"
          onAction={() => setInviteOpen(true)}
          withPlus
        />
      ) : null}

      {!isLoading && !isError && employees.length > 0 && visible.length === 0 ? (
        <EmployeesEmptyState
          title="По выбранным фильтрам ничего не найдено"
          text="Сбросьте фильтры или измените условия поиска."
          actionLabel="Сбросить фильтры"
          onAction={resetFilters}
        />
      ) : null}

      {!isLoading && !isError && visible.length > 0 ? (
        <EmployeesTable employees={visible} selectedId={editing?.id ?? null} onEdit={setEditing} />
      ) : null}

      <InviteEmployeeModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onCreated={() => {
          setInviteOpen(false);
          notify('Приглашение создано');
        }}
      />

      <EditEmployeeModal
        employee={editing}
        currentUserId={user?.id}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          notify('Сотрудник обновлён');
        }}
      />
    </section>
  );
}
