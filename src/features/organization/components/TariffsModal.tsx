import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { PLAN_DESCRIPTION, PLAN_LABEL } from '../model/labels';
import type { PlanId } from '../model/types';
import styles from './TariffsModal.module.css';

const CARDS: Array<{ id: PlanId; hint: string; points: string[] }> = [
  {
    id: 'free',
    hint: 'Текущий тариф',
    points: ['До 5 планов', 'До 12 полей', 'До 3 сотрудников', '1 одновременный расчёт'],
  },
  {
    id: 'pro',
    hint: '4 900 ₽ / месяц',
    points: ['До 40 планов', 'До 80 полей', 'До 20 сотрудников', '10 одновременных расчётов'],
  },
  {
    id: 'enterprise',
    hint: 'По договорённости',
    points: ['Несколько организаций', 'Расширенные роли', 'Одновременные расчёты по договорённости'],
  },
];

type TariffsModalProps = {
  open: boolean;
  currentPlan: PlanId;
  onClose: () => void;
};

export function TariffsModal({ open, currentPlan, onClose }: TariffsModalProps) {
  return (
    <Modal title="Тарифы" open={open} onClose={onClose} size="lg">
      <p className={styles.lead}>Спокойный обзор возможностей. Переход на платный тариф можно сделать позже.</p>
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <article key={card.id} className={styles.card} data-current={card.id === currentPlan || undefined}>
            <div className={styles.plan}>{PLAN_LABEL[card.id]}</div>
            <div className={styles.hint}>{card.hint}</div>
            <p className={styles.desc}>{PLAN_DESCRIPTION[card.id]}</p>
            <ul className={styles.points}>
              {card.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
}
