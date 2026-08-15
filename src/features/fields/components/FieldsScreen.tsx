import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { formatArea } from '@/shared/lib/format';
import { useCrops } from '@/features/crops/hooks/useCrops';
import { useFields } from '../hooks/useFields';
import { filterFields, hasActiveFilters } from '../lib/filterFields';
import { pluralizeFields } from '../lib/pluralize';
import type { AreaFilter, Field, FieldFilters as FieldFiltersState } from '../model/types';
import { FieldDeleteDialog } from './FieldDeleteDialog';
import { FieldDetailDrawer } from './FieldDetailDrawer';
import { FieldFilters } from './FieldFilters';
import { FieldFormModal } from './FieldFormModal';
import { FieldsEmptyState } from './FieldsEmptyState';
import { FieldsErrorState } from './FieldsErrorState';
import { FieldsSkeleton } from './FieldsSkeleton';
import { FieldsTable } from './FieldsTable';
import styles from './FieldsScreen.module.css';

const FieldsMap = lazy(() => import('./FieldsMap').then((module) => ({ default: module.FieldsMap })));

const AREA_FILTERS = new Set<AreaFilter>(['all', 'lt50', 'mid', 'gt100']);

function readArea(value: string | null): AreaFilter {
  if (value && AREA_FILTERS.has(value as AreaFilter)) {
    return value as AreaFilter;
  }
  return 'all';
}

export function FieldsScreen() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = useFields();
  const { data: crops = [] } = useCrops();
  const [selected, setSelected] = useState<Field | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);

  const filters = useMemo<FieldFiltersState>(
    () => ({
      query: searchParams.get('q') ?? '',
      soil: searchParams.get('soil') ?? 'all',
      previousCrop: searchParams.get('previousCrop') ?? 'all',
      area: readArea(searchParams.get('area')),
    }),
    [searchParams],
  );

  const fields = data ?? [];
  const visible = useMemo(() => filterFields(fields, filters), [fields, filters]);
  const filtersActive = hasActiveFilters(filters);
  const totalArea = visible.reduce((sum, field) => sum + field.area, 0);

  const soils = useMemo(() => {
    return Array.from(new Set(fields.map((field) => field.soilType))).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [fields]);

  const cropOptions = useMemo(() => {
    const fromFields = fields.map((field) => field.previousCrop).filter((name): name is string => Boolean(name));
    const fromCatalog = crops.map((crop) => crop.name);
    return Array.from(new Set([...fromCatalog, ...fromFields])).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [fields, crops]);

  const writeFilters = (next: FieldFiltersState) => {
    const params = new URLSearchParams(searchParams);
    if (next.query) params.set('q', next.query);
    else params.delete('q');
    if (next.soil !== 'all') params.set('soil', next.soil);
    else params.delete('soil');
    if (next.previousCrop !== 'all') params.set('previousCrop', next.previousCrop);
    else params.delete('previousCrop');
    if (next.area !== 'all') params.set('area', next.area);
    else params.delete('area');
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.delete('soil');
    params.delete('previousCrop');
    params.delete('area');
    setSearchParams(params, { replace: true });
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (field: Field) => {
    setSelected(null);
    setEditing(field);
    setFormOpen(true);
  };

  const openDelete = (field: Field) => {
    setSelected(null);
    setFieldToDelete(field);
  };

  const goToPlan = (field: Field, toast: string) => {
    setSelected(null);
    notify(toast);
    navigate(`/plans?fieldId=${encodeURIComponent(field.id)}`);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Поля организации</h1>
          {!isLoading && !isError ? (
            <p className={styles.subtitle}>
              {pluralizeFields(visible.length)} • {formatArea(totalArea)}
            </p>
          ) : null}
        </div>
        <Button icon={<Plus size={16} aria-hidden="true" />} onClick={openCreate}>
          Добавить поле
        </Button>
      </header>

      {!isLoading && !isError && fields.length > 0 ? (
        <FieldFilters
          value={filters}
          soils={soils}
          crops={cropOptions}
          canReset={filtersActive}
          onChange={writeFilters}
          onReset={resetFilters}
        />
      ) : null}

      {isLoading ? <FieldsSkeleton /> : null}
      {isError ? <FieldsErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && fields.length === 0 ? (
        <FieldsEmptyState
          title="Пока нет полей"
          text="Добавьте первое поле, чтобы начать планирование посевов"
          actionLabel="Добавить поле"
          onAction={openCreate}
          withPlus
        />
      ) : null}

      {!isLoading && !isError && fields.length > 0 && visible.length === 0 ? (
        <FieldsEmptyState
          title="По выбранным фильтрам ничего не найдено"
          text="Сбросьте фильтры или измените условия поиска."
          actionLabel="Сбросить фильтры"
          onAction={resetFilters}
        />
      ) : null}

      {!isLoading && !isError && visible.length > 0 ? (
        <>
          <Suspense fallback={<div className={styles.mapFallback} aria-hidden="true" />}>
            <FieldsMap fields={visible} selectedId={selected?.id ?? null} onSelect={setSelected} />
          </Suspense>
          <FieldsTable
            fields={visible}
            selectedId={selected?.id ?? null}
            onOpen={setSelected}
            onEdit={openEdit}
            onOptimize={(field) => goToPlan(field, `Создаём план для «${field.name}»`)}
            onDelete={openDelete}
          />
        </>
      ) : null}

      <FieldFormModal
        open={formOpen}
        field={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={(mode) => {
          setFormOpen(false);
          setEditing(null);
          notify(mode === 'create' ? 'Поле добавлено' : 'Поле сохранено');
        }}
      />

      <FieldDeleteDialog
        field={fieldToDelete}
        onClose={() => setFieldToDelete(null)}
        onDeleted={(name) => {
          setFieldToDelete(null);
          notify(`Поле «${name}» удалено`);
        }}
      />

      <FieldDetailDrawer
        field={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onOptimize={(field) => goToPlan(field, `Создаём план для «${field.name}»`)}
        onAddToPlan={(field) => goToPlan(field, `Поле «${field.name}» будет добавлено в план`)}
        onDelete={openDelete}
      />
    </section>
  );
}
