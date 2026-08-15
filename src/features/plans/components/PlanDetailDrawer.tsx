import { Button } from '@/shared/ui/Button';
import { Drawer } from '@/shared/ui/Drawer';
import { formatArea, formatClock, formatMoney } from '@/shared/lib/format';
import { PLAN_GOAL_LABEL } from '../model/labels';
import type { CalculationPlan } from '../model/types';
import { PlanStatusBadge } from './PlanStatusBadge';
import styles from './PlanDetailDrawer.module.css';

type PlanDetailDrawerProps = {
  plan: CalculationPlan | null;
  onClose: () => void;
  onStart: (plan: CalculationPlan) => void;
  onStop: (plan: CalculationPlan) => void;
  onEdit: (plan: CalculationPlan) => void;
  onDelete: (plan: CalculationPlan) => void;
  onResult: (plan: CalculationPlan) => void;
  pendingAction?: boolean;
};

export function PlanDetailDrawer({
  plan,
  onClose,
  onStart,
  onStop,
  onEdit,
  onDelete,
  onResult,
  pendingAction = false,
}: PlanDetailDrawerProps) {
  const lastLog = plan?.logs[plan.logs.length - 1];

  return (
    <Drawer
      title={plan?.name ?? 'План'}
      open={Boolean(plan)}
      onClose={onClose}
      footer={
        plan ? (
          <>
            {plan.status === 'completed' ? (
              <Button onClick={() => onResult(plan)}>Смотреть результаты</Button>
            ) : null}
            {plan.status === 'draft' || plan.status === 'error' ? (
              <Button onClick={() => onStart(plan)} disabled={pendingAction}>
                Запустить
              </Button>
            ) : null}
            {plan.status === 'calculating' ? (
              <Button variant="secondary" onClick={() => onStop(plan)} disabled={pendingAction}>
                Остановить
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => onEdit(plan)}
              disabled={plan.status === 'calculating' || pendingAction}
            >
              Редактировать
            </Button>
            <Button variant="danger" onClick={() => onDelete(plan)} disabled={pendingAction}>
              Удалить
            </Button>
          </>
        ) : null
      }
    >
      {plan ? (
        <>
          <div className={styles.meta}>
            <PlanStatusBadge status={plan.status} />
          </div>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Параметры</h4>
            <div className={styles.row}>
              <span className={styles.label}>Цель</span>
              <span className={styles.value}>{PLAN_GOAL_LABEL[plan.goal]}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Поля</span>
              <span className={styles.value}>
                {plan.fieldsCount} • {formatArea(plan.totalArea)}
              </span>
            </div>
            <div className={styles.chips}>
              {plan.crops.map((crop) => (
                <span key={crop} className={styles.chip}>
                  {crop}
                </span>
              ))}
            </div>
            {plan.constraints.budgetLimit != null ? (
              <div className={styles.row}>
                <span className={styles.label}>Лимит бюджета</span>
                <span className={styles.value}>{formatMoney(plan.constraints.budgetLimit)}</span>
              </div>
            ) : null}
            {plan.constraints.marginDeviationPercent != null ? (
              <div className={styles.row}>
                <span className={styles.label}>Отклонение маржи</span>
                <span className={styles.value}>{plan.constraints.marginDeviationPercent}%</span>
              </div>
            ) : null}
            {plan.constraints.minAreaPerCrop != null || plan.constraints.maxAreaPerCrop != null ? (
              <div className={styles.row}>
                <span className={styles.label}>Площадь на культуру</span>
                <span className={styles.value}>
                  {plan.constraints.minAreaPerCrop ?? '—'} / {plan.constraints.maxAreaPerCrop ?? '—'} га
                </span>
              </div>
            ) : null}
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Лог процесса</h4>
            {plan.logs.length === 0 ? (
              <p className={styles.note}>Сообщений пока нет. Запустите расчёт, чтобы увидеть ход выполнения.</p>
            ) : (
              <div className={styles.log}>
                {plan.logs.map((entry, index) => {
                  const isLast = index === plan.logs.length - 1;
                  return (
                    <div key={`${entry.timestamp}-${entry.message}`} className={styles.logRow}>
                      <span className={styles.time}>{formatClock(entry.timestamp)}</span>
                      <span
                        className={
                          isLast && plan.status === 'completed'
                            ? styles.lastOk
                            : isLast && plan.status === 'error'
                              ? styles.lastErr
                              : undefined
                        }
                      >
                        {entry.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {plan.status === 'calculating' && lastLog ? (
              <p className={styles.note}>Идёт расчёт… новые сообщения появляются автоматически.</p>
            ) : null}
          </section>
        </>
      ) : null}
    </Drawer>
  );
}
