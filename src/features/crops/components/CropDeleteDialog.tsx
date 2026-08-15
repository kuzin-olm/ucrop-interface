import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useDeleteCrop } from '../hooks/useCrops';
import type { Crop } from '../model/types';
import styles from './AddCropModal.module.css';

type CropDeleteDialogProps = {
  crop: Crop | null;
  onClose: () => void;
  onDeleted: (name: string) => void;
};

export function CropDeleteDialog({ crop, onClose, onDeleted }: CropDeleteDialogProps) {
  const deleteCrop = useDeleteCrop();

  const handleDelete = async () => {
    if (!crop) return;
    await deleteCrop.mutateAsync(crop.id);
    onDeleted(crop.name);
  };

  return (
    <Modal title="Удалить культуру" open={Boolean(crop)} onClose={onClose}>
      <p className={styles.text}>
        Культура «{crop?.name}» будет удалена из каталога. Поля, где она указана как предшественник, не
        изменятся.
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={deleteCrop.isPending}>
          Отмена
        </Button>
        <Button variant="danger" onClick={() => void handleDelete()} disabled={deleteCrop.isPending}>
          {deleteCrop.isPending ? 'Удаляем…' : 'Удалить'}
        </Button>
      </div>
    </Modal>
  );
}
