import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useDeleteField } from '../hooks/useFields';
import type { Field } from '../model/types';
import styles from './FieldDeleteDialog.module.css';

type FieldDeleteDialogProps = {
  field: Field | null;
  onClose: () => void;
  onDeleted: (name: string) => void;
};

export function FieldDeleteDialog({ field, onClose, onDeleted }: FieldDeleteDialogProps) {
  const deleteField = useDeleteField();

  const handleDelete = async () => {
    if (!field) return;
    await deleteField.mutateAsync(field.id);
    onDeleted(field.name);
  };

  return (
    <Modal title="Удалить поле" open={Boolean(field)} onClose={onClose}>
      <p className={styles.text}>
        Поле «{field?.name}» будет удалено из каталога и пропадёт с карты. Это действие нельзя отменить.
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={deleteField.isPending}>
          Отмена
        </Button>
        <Button variant="danger" onClick={() => void handleDelete()} disabled={deleteField.isPending}>
          {deleteField.isPending ? 'Удаляем…' : 'Удалить'}
        </Button>
      </div>
    </Modal>
  );
}
