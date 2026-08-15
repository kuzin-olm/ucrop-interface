import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useDeletePlan } from '../hooks/usePlans';
import type { CalculationPlan } from '../model/types';
import styles from './PlanDeleteDialog.module.css';

type PlanDeleteDialogProps = {
  plan: CalculationPlan | null;
  onClose: () => void;
  onDeleted: (name: string) => void;
};

export function PlanDeleteDialog({ plan, onClose, onDeleted }: PlanDeleteDialogProps) {
  const deletePlan = useDeletePlan();

  const handleDelete = async () => {
    if (!plan) return;
    await deletePlan.mutateAsync(plan.id);
    onDeleted(plan.name);
  };

  return (
    <Modal title="Удалить план" open={Boolean(plan)} onClose={onClose}>
      <p className={styles.text}>
        План «{plan?.name}» будет удалён. Запущенный расчёт остановится. Это действие нельзя отменить.
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={deletePlan.isPending}>
          Отмена
        </Button>
        <Button variant="danger" onClick={() => void handleDelete()} disabled={deletePlan.isPending}>
          {deletePlan.isPending ? 'Удаляем…' : 'Удалить'}
        </Button>
      </div>
    </Modal>
  );
}
