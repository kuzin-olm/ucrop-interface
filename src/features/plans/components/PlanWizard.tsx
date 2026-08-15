import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { formatArea, formatMoney } from '@/shared/lib/format';
import { useCrops } from '@/features/crops/hooks/useCrops';
import { useFields } from '@/features/fields/hooks/useFields';
import { useCreatePlan, useStartPlan, useUpdatePlan } from '../hooks/usePlans';
import { PLAN_GOAL_LABEL, UPCOMING_GOALS } from '../model/labels';
import type { CalculationPlan, CreatePlanInput } from '../model/types';
import { PlanFieldsPicker } from './PlanFieldsPicker';
import styles from './PlanWizard.module.css';

type WizardDraft = {
  name: string;
  description: string;
  fieldIds: string[];
  crops: string[];
  budgetLimit: string;
  marginDeviationPercent: string;
  minAreaPerCrop: string;
  maxAreaPerCrop: string;
};

const EMPTY: WizardDraft = {
  name: '',
  description: '',
  fieldIds: [],
  crops: [],
  budgetLimit: '',
  marginDeviationPercent: '',
  minAreaPerCrop: '',
  maxAreaPerCrop: '',
};

const STEP_LABELS = ['Название и цель', 'Поля', 'Культуры', 'Подтверждение'];

function fromPlan(plan: CalculationPlan): WizardDraft {
  return {
    name: plan.name,
    description: plan.description ?? '',
    fieldIds: plan.fieldIds,
    crops: plan.crops,
    budgetLimit: plan.constraints.budgetLimit != null ? String(plan.constraints.budgetLimit) : '',
    marginDeviationPercent:
      plan.constraints.marginDeviationPercent != null ? String(plan.constraints.marginDeviationPercent) : '',
    minAreaPerCrop: plan.constraints.minAreaPerCrop != null ? String(plan.constraints.minAreaPerCrop) : '',
    maxAreaPerCrop: plan.constraints.maxAreaPerCrop != null ? String(plan.constraints.maxAreaPerCrop) : '',
  };
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

type PlanWizardProps = {
  open: boolean;
  plan: CalculationPlan | null;
  presetFieldIds?: string[];
  onClose: () => void;
  onCreated: (name: string) => void;
};

export function PlanWizard({ open, plan, presetFieldIds = [], onClose, onCreated }: PlanWizardProps) {
  const { data: fields = [] } = useFields();
  const { data: crops = [] } = useCrops();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const startPlan = useStartPlan();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<WizardDraft>(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (plan) {
      setDraft(fromPlan(plan));
    } else {
      setDraft({ ...EMPTY, fieldIds: presetFieldIds });
    }
    setStep(1);
    setError('');
  }, [open, plan, presetFieldIds]);

  const selectedFields = useMemo(
    () => fields.filter((field) => draft.fieldIds.includes(field.id)),
    [fields, draft.fieldIds],
  );
  const totalArea = selectedFields.reduce((sum, field) => sum + field.area, 0);
  const pending = createPlan.isPending || updatePlan.isPending || startPlan.isPending;

  const goNext = () => {
    if (step === 1 && !draft.name.trim()) {
      setError('Укажите название плана');
      return;
    }
    if (step === 2 && draft.fieldIds.length === 0) {
      setError('Выберите хотя бы одно поле');
      return;
    }
    if (step === 3 && draft.crops.length === 0) {
      setError('Выберите хотя бы одну культуру');
      return;
    }
    setError('');
    setStep((current) => Math.min(4, current + 1));
  };

  const buildPayload = (): CreatePlanInput => ({
    name: draft.name.trim(),
    description: draft.description.trim() || undefined,
    goal: 'maximize_margin',
    fieldIds: draft.fieldIds,
    fieldsCount: selectedFields.length,
    totalArea,
    crops: draft.crops,
    constraints: {
      budgetLimit: toNumber(draft.budgetLimit),
      marginDeviationPercent: toNumber(draft.marginDeviationPercent),
      minAreaPerCrop: toNumber(draft.minAreaPerCrop),
      maxAreaPerCrop: toNumber(draft.maxAreaPerCrop),
    },
    start: true,
  });

  const handleLaunch = async () => {
    const payload = buildPayload();
    if (plan) {
      await updatePlan.mutateAsync({
        id: plan.id,
        name: payload.name,
        description: payload.description,
        fieldIds: payload.fieldIds,
        fieldsCount: payload.fieldsCount,
        totalArea: payload.totalArea,
        crops: payload.crops,
        constraints: payload.constraints,
      });
      await startPlan.mutateAsync(plan.id);
    } else {
      await createPlan.mutateAsync(payload);
    }
    onCreated(payload.name);
  };

  const toggleCrop = (name: string) => {
    setDraft((current) => ({
      ...current,
      crops: current.crops.includes(name)
        ? current.crops.filter((item) => item !== name)
        : [...current.crops, name],
    }));
  };

  return (
    <Modal
      title={plan ? 'Редактировать план' : 'Создать новый план'}
      open={open}
      onClose={onClose}
      size="xl"
    >
      <div className={styles.wizard}>
        <div className={styles.steps} role="tablist" aria-label="Шаги мастера">
          {STEP_LABELS.map((label, index) => {
            const number = index + 1;
            const clickable = step === 4 || number < step;
            return (
              <button
                key={label}
                type="button"
                className={`${styles.step} ${number === step ? styles.stepCurrent : ''} ${number < step ? styles.stepDone : ''} ${clickable ? styles.stepClickable : ''}`}
                onClick={() => {
                  if (clickable) {
                    setError('');
                    setStep(number);
                  }
                }}
                disabled={!clickable && number !== step}
              >
                {number}. {label}
              </button>
            );
          })}
        </div>

        <div className={styles.body}>
          {step === 1 ? (
            <>
              <Field label="Название плана" htmlFor="plan-name" required error={error && !draft.name.trim() ? error : undefined}>
                <TextInput
                  id="plan-name"
                  value={draft.name}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, name: event.target.value }));
                    setError('');
                  }}
                  placeholder="Например, Оптимизация Юг-2026"
                  autoFocus
                />
              </Field>
              <Field label="Описание" htmlFor="plan-description">
                <TextInput
                  id="plan-description"
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Коротко, зачем этот расчёт"
                />
              </Field>
              <div>
                <p className={styles.blockTitle}>Цель плана</p>
                <div className={styles.goalGrid}>
                  <button type="button" className={`${styles.goal} ${styles.goalActive}`}>
                    <span>{PLAN_GOAL_LABEL.maximize_margin}</span>
                  </button>
                  {UPCOMING_GOALS.map((goal) => (
                    <button key={goal.id} type="button" className={`${styles.goal} ${styles.goalDisabled}`} disabled>
                      <span>{goal.label}</span>
                      <span className={styles.soon}>Скоро</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <PlanFieldsPicker
              fields={fields}
              selectedIds={draft.fieldIds}
              onChange={(fieldIds) => {
                setDraft((current) => ({ ...current, fieldIds }));
                setError('');
              }}
            />
          ) : null}

          {step === 3 ? (
            <>
              <div>
                <p className={styles.blockTitle}>Культуры</p>
                <div className={styles.chips}>
                  {crops.map((crop) => (
                    <button
                      key={crop.id}
                      type="button"
                      className={`${styles.chip} ${draft.crops.includes(crop.name) ? styles.chipOn : ''}`}
                      onClick={() => {
                        toggleCrop(crop.name);
                        setError('');
                      }}
                    >
                      {crop.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.cards}>
                <label className={styles.card}>
                  <span className={styles.cardTitle}>Лимит бюджета, ₽</span>
                  <TextInput
                    type="number"
                    min="0"
                    value={draft.budgetLimit}
                    onChange={(event) => setDraft((current) => ({ ...current, budgetLimit: event.target.value }))}
                    placeholder="18000000"
                  />
                </label>
                <label className={styles.card}>
                  <span className={styles.cardTitle}>Отклонение маржи, %</span>
                  <TextInput
                    type="number"
                    min="0"
                    step="0.1"
                    value={draft.marginDeviationPercent}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, marginDeviationPercent: event.target.value }))
                    }
                    placeholder="12"
                  />
                </label>
                <label className={styles.card}>
                  <span className={styles.cardTitle}>Площадь на культуру, га</span>
                  <div className={styles.navRight}>
                    <TextInput
                      type="number"
                      min="0"
                      value={draft.minAreaPerCrop}
                      onChange={(event) => setDraft((current) => ({ ...current, minAreaPerCrop: event.target.value }))}
                      placeholder="мин"
                    />
                    <TextInput
                      type="number"
                      min="0"
                      value={draft.maxAreaPerCrop}
                      onChange={(event) => setDraft((current) => ({ ...current, maxAreaPerCrop: event.target.value }))}
                      placeholder="макс"
                    />
                  </div>
                </label>
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <div className={styles.summary}>
              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h3 className={styles.blockTitle}>Название и цель</h3>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setStep(1)}>
                    Изменить
                  </Button>
                </div>
                <div className={styles.row}>
                  <span>{draft.name}</span>
                </div>
                {draft.description ? <p className={styles.muted}>{draft.description}</p> : null}
                <p className={styles.muted}>{PLAN_GOAL_LABEL.maximize_margin}</p>
              </section>
              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h3 className={styles.blockTitle}>Поля</h3>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setStep(2)}>
                    Изменить
                  </Button>
                </div>
                <div className={styles.row}>
                  <span>
                    {selectedFields.length} полей • {formatArea(totalArea)}
                  </span>
                </div>
                <p className={styles.muted}>{selectedFields.map((field) => field.name).join(', ')}</p>
              </section>
              <section className={styles.block}>
                <div className={styles.blockHead}>
                  <h3 className={styles.blockTitle}>Культуры и ограничения</h3>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setStep(3)}>
                    Изменить
                  </Button>
                </div>
                <p>{draft.crops.join(', ')}</p>
                <p className={styles.muted}>
                  Бюджет: {draft.budgetLimit ? formatMoney(Number(draft.budgetLimit)) : 'не задан'}
                </p>
                <p className={styles.muted}>
                  Отклонение маржи: {draft.marginDeviationPercent ? `${draft.marginDeviationPercent}%` : 'не задано'}
                </p>
                <p className={styles.muted}>
                  Площадь на культуру: {draft.minAreaPerCrop || '—'} / {draft.maxAreaPerCrop || '—'} га
                </p>
              </section>
            </div>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
        </div>

        <div className={styles.nav}>
          <Button type="button" variant="ghost" onClick={step === 1 ? onClose : () => setStep((current) => current - 1)}>
            {step === 1 ? 'Отмена' : 'Назад'}
          </Button>
          <div className={styles.navRight}>
            {step < 4 ? (
              <Button type="button" onClick={goNext}>
                Далее
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleLaunch()} disabled={pending}>
                {pending ? 'Запускаем…' : 'Запустить расчёт'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
