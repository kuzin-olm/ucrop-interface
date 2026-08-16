import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useDeleteMaterial } from '../hooks/useMaterials';
import type { Material } from '../model/types';
import styles from './MaterialFormModal.module.css';

type MaterialDeleteDialogProps = {
  material: Material | null;
  onClose: () => void;
  onDeleted: (name: string) => void;
};

export function MaterialDeleteDialog({ material, onClose, onDeleted }: MaterialDeleteDialogProps) {
  const deleteMaterial = useDeleteMaterial();

  const handleDelete = async () => {
    if (!material) return;
    await deleteMaterial.mutateAsync(material.id);
    onDeleted(material.name);
  };

  return (
    <Modal title="Удалить материал" open={Boolean(material)} onClose={onClose}>
      <p className={styles.text}>
        Материал «{material?.name}» будет удалён из справочника. Планы, где он уже использован, не изменятся.
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={deleteMaterial.isPending}>
          Отмена
        </Button>
        <Button variant="danger" onClick={() => void handleDelete()} disabled={deleteMaterial.isPending}>
          {deleteMaterial.isPending ? 'Удаляем…' : 'Удалить'}
        </Button>
      </div>
    </Modal>
  );
}
