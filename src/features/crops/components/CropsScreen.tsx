import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { useCrops } from '../hooks/useCrops';
import { filterCrops } from '../lib/filterCrops';
import type { Crop, CropFilter } from '../model/types';
import { CropCard } from './CropCard';
import { CropDeleteDialog } from './CropDeleteDialog';
import { CropDetailDrawer } from './CropDetailDrawer';
import { CropFilters } from './CropFilters';
import { CropFormModal } from './CropFormModal';
import { CropsEmptyState } from './CropsEmptyState';
import { CropsErrorState } from './CropsErrorState';
import { CropsSkeleton } from './CropsSkeleton';
import styles from './CropsScreen.module.css';

const FILTERS = new Set<CropFilter>(['all', 'grain', 'oilseed', 'legume', 'other']);

function readFilter(value: string | null): CropFilter {
  if (value && FILTERS.has(value as CropFilter)) {
    return value as CropFilter;
  }
  return 'all';
}

export function CropsScreen() {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const category = readFilter(searchParams.get('category'));
  const { data, isLoading, isError, refetch } = useCrops();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [cropToDelete, setCropToDelete] = useState<Crop | null>(null);

  const crops = data ?? [];
  const visibleCrops = useMemo(() => filterCrops(crops, category, query), [crops, category, query]);

  const setCategory = (next: CropFilter) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') {
      params.delete('category');
    } else {
      params.set('category', next);
    }
    setSearchParams(params, { replace: true });
  };

  const openCreate = () => {
    setEditingCrop(null);
    setIsModalOpen(true);
  };

  const openEdit = (crop: Crop) => {
    setSelectedCrop(null);
    setEditingCrop(crop);
    setIsModalOpen(true);
  };

  const openDelete = (crop: Crop) => {
    setSelectedCrop(null);
    setCropToDelete(crop);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Культуры организации</h1>
        <Button icon={<Plus size={16} aria-hidden="true" />} onClick={openCreate}>
          Добавить культуру
        </Button>
      </header>

      <CropFilters value={category} onChange={setCategory} />

      {isLoading ? <CropsSkeleton /> : null}

      {isError ? <CropsErrorState onRetry={() => void refetch()} /> : null}

      {!isLoading && !isError && crops.length === 0 ? (
        <CropsEmptyState
          title="Пока нет культур"
          text="Добавьте первую культуру, чтобы использовать её в планах оптимизации"
          actionLabel="Добавить культуру"
          onAction={openCreate}
        />
      ) : null}

      {!isLoading && !isError && crops.length > 0 && visibleCrops.length === 0 ? (
        <CropsEmptyState
          title="Ничего не найдено"
          text="Измените фильтр или поисковый запрос — в этой выборке культур нет."
        />
      ) : null}

      {!isLoading && !isError && visibleCrops.length > 0 ? (
        <div className={styles.grid}>
          {visibleCrops.map((crop) => (
            <CropCard key={crop.id} crop={crop} onOpen={setSelectedCrop} />
          ))}
        </div>
      ) : null}

      <CropFormModal
        open={isModalOpen}
        crop={editingCrop}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCrop(null);
        }}
        onSaved={(mode) => {
          setIsModalOpen(false);
          setEditingCrop(null);
          notify(mode === 'create' ? 'Культура добавлена' : 'Культура сохранена');
        }}
      />

      <CropDeleteDialog
        crop={cropToDelete}
        onClose={() => setCropToDelete(null)}
        onDeleted={(name) => {
          setCropToDelete(null);
          notify(`Культура «${name}» удалена`);
        }}
      />

      <CropDetailDrawer
        crop={selectedCrop}
        onClose={() => setSelectedCrop(null)}
        onEdit={openEdit}
        onDelete={openDelete}
      />
    </section>
  );
}
