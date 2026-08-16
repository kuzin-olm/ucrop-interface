import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { useMaterials } from '../hooks/useMaterials';
import { filterMaterials } from '../lib/filterMaterials';
import type { Material, MaterialFilter } from '../model/types';
import { MaterialDeleteDialog } from './MaterialDeleteDialog';
import { MaterialDetailDrawer } from './MaterialDetailDrawer';
import { MaterialFilters } from './MaterialFilters';
import { MaterialFormModal } from './MaterialFormModal';
import { MaterialsEmptyState } from './MaterialsEmptyState';
import { MaterialsErrorState } from './MaterialsErrorState';
import { MaterialsSkeleton } from './MaterialsSkeleton';
import { MaterialsTable } from './MaterialsTable';
import styles from './MaterialsScreen.module.css';

const CATEGORIES = new Set<MaterialFilter>(['all', 'seeds', 'fertilizer', 'ppp', 'fuel']);

function readCategory(value: string | null): MaterialFilter {
  if (value && CATEGORIES.has(value as MaterialFilter)) return value as MaterialFilter;
  return 'all';
}

export function MaterialsScreen() {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = useMaterials();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Material | null>(null);
  const [editing, setEditing] = useState<Material | null>(null);
  const [toDelete, setToDelete] = useState<Material | null>(null);

  const query = searchParams.get('q') ?? '';
  const category = readCategory(searchParams.get('category'));
  const materials = data ?? [];
  const visible = useMemo(() => filterMaterials(materials, category, query), [materials, category, query]);

  const setCategory = (next: MaterialFilter) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('category');
    else params.set('category', next);
    setSearchParams(params, { replace: true });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (material: Material) => {
    setSelected(null);
    setEditing(material);
    setModalOpen(true);
  };

  const openDelete = (material: Material) => {
    setSelected(null);
    setToDelete(material);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Материалы</h1>
        <Button icon={<Plus size={16} aria-hidden="true" />} onClick={openCreate}>
          Добавить материал
        </Button>
      </header>

      {!isLoading && !isError ? <MaterialFilters value={category} onChange={setCategory} /> : null}

      {isLoading ? <MaterialsSkeleton /> : null}
      {isError ? <MaterialsErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && materials.length === 0 ? (
        <MaterialsEmptyState
          title="Пока нет материалов"
          text="Добавьте семена, удобрения, СЗР или ГСМ"
          actionLabel="Добавить материал"
          onAction={openCreate}
          withPlus
        />
      ) : null}

      {!isLoading && !isError && materials.length > 0 && visible.length === 0 ? (
        <MaterialsEmptyState
          title="По выбранным фильтрам ничего не найдено"
          text="Сбросьте фильтры или измените условия поиска."
        />
      ) : null}

      {!isLoading && !isError && visible.length > 0 ? (
        <MaterialsTable materials={visible} selectedId={selected?.id ?? null} onOpen={setSelected} />
      ) : null}

      <MaterialFormModal
        open={modalOpen}
        material={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={(mode) => {
          setModalOpen(false);
          setEditing(null);
          notify(mode === 'create' ? 'Материал добавлен' : 'Материал обновлён');
        }}
      />

      <MaterialDeleteDialog
        material={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={(name) => {
          setToDelete(null);
          notify(`Материал «${name}» удалён`);
        }}
      />

      <MaterialDetailDrawer
        material={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={openDelete}
      />
    </section>
  );
}
