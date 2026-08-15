import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, SelectInput, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { formatHa } from '@/shared/lib/format';
import { useCrops } from '@/features/crops/hooks/useCrops';
import { useCreateField, useFields, useUpdateField } from '../hooks/useFields';
import { polygonAreaHa } from '../lib/geometry';
import { FIELD_SOIL_OPTIONS, FIELD_STATUS_LABEL } from '../model/labels';
import type { CreateFieldInput, Field as FieldModel, FieldPolygon, FieldStatus } from '../model/types';
import { FieldContourEditor, type ContourMode } from './FieldContourEditor';
import styles from './FieldFormModal.module.css';

type FieldFormModalProps = {
  open: boolean;
  field: FieldModel | null;
  onClose: () => void;
  onSaved: (mode: 'create' | 'edit') => void;
};

type FormState = {
  name: string;
  area: string;
  soilType: string;
  previousCrop: string;
  status: FieldStatus;
  ph: string;
  n: string;
  p: string;
  k: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  area: '',
  soilType: FIELD_SOIL_OPTIONS[0],
  previousCrop: '',
  status: 'active',
  ph: '',
  n: '',
  p: '',
  k: '',
};

function toForm(field: FieldModel | null): FormState {
  if (!field) return INITIAL_FORM;
  return {
    name: field.name,
    area: String(field.area),
    soilType: field.soilType,
    previousCrop: field.previousCrop ?? '',
    status: field.status,
    ph: String(field.indicators.ph),
    n: String(field.indicators.n),
    p: String(field.indicators.p),
    k: String(field.indicators.k),
  };
}

export function FieldFormModal({ open, field, onClose, onSaved }: FieldFormModalProps) {
  const { data: crops = [] } = useCrops();
  const { data: allFields = [], isFetched: fieldsReady } = useFields();
  const createField = useCreateField();
  const updateField = useUpdateField();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<{ name?: string; area?: string; soilType?: string }>({});
  const [contour, setContour] = useState<FieldPolygon | null>(null);
  const [contourMode, setContourMode] = useState<ContourMode>('idle');
  const [areaLocked, setAreaLocked] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toForm(field));
      setErrors({});
      setContour(field?.geometry ?? null);
      setContourMode('idle');
      setAreaLocked(Boolean(field));
    }
  }, [open, field]);

  const pending = createField.isPending || updateField.isPending;
  const isEdit = Boolean(field);
  const contourArea = contour ? polygonAreaHa(contour) : 0;
  const neighbors = useMemo(
    () => allFields.filter((item) => item.id !== field?.id),
    [allFields, field?.id],
  );

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setContour(null);
    setContourMode('idle');
    onClose();
  };

  const applyContourArea = () => {
    if (contourArea <= 0) return;
    setForm((current) => ({ ...current, area: contourArea.toFixed(1) }));
    setErrors((current) => ({ ...current, area: undefined }));
  };

  const handleContourChange = (geometry: FieldPolygon | null) => {
    setContour(geometry);
    if (!areaLocked && geometry) {
      const nextArea = polygonAreaHa(geometry);
      if (nextArea > 0) {
        setForm((current) => ({ ...current, area: nextArea.toFixed(1) }));
        setErrors((current) => ({ ...current, area: undefined }));
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const area = Number(form.area);
    const nextErrors: typeof errors = {};

    if (!name) nextErrors.name = 'Укажите название поля';
    if (!form.area || Number.isNaN(area) || area <= 0) nextErrors.area = 'Укажите площадь больше 0';
    if (!form.soilType) nextErrors.soilType = 'Выберите тип почвы';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: CreateFieldInput = {
      name,
      area,
      soilType: form.soilType,
      previousCrop: form.previousCrop || null,
      status: form.status,
      indicators: {
        ph: Number(form.ph) || 0,
        n: Number(form.n) || 0,
        p: Number(form.p) || 0,
        k: Number(form.k) || 0,
      },
      geometry: contour ?? undefined,
    };

    if (field) {
      await updateField.mutateAsync({
        id: field.id,
        ...payload,
        geometry: contour ?? field.geometry,
      });
      onSaved('edit');
    } else {
      await createField.mutateAsync(payload);
      onSaved('create');
    }
    setForm(INITIAL_FORM);
    setContour(null);
  };

  return (
    <Modal
      title={isEdit ? 'Редактировать поле' : 'Добавить поле'}
      open={open}
      onClose={handleClose}
      size="lg"
      closeOnEscape={contourMode === 'idle'}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <Field label="Название поля" htmlFor="field-name" required error={errors.name}>
            <TextInput
              id="field-name"
              value={form.name}
              invalid={Boolean(errors.name)}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="Например, Поле 3"
              autoFocus
            />
          </Field>

          <div className={styles.row}>
            <Field label="Площадь (га)" htmlFor="field-area" required error={errors.area}>
              <TextInput
                id="field-area"
                type="number"
                min="0"
                step="0.1"
                value={form.area}
                invalid={Boolean(errors.area)}
                onChange={(event) => {
                  setAreaLocked(true);
                  setForm((current) => ({ ...current, area: event.target.value }));
                  setErrors((current) => ({ ...current, area: undefined }));
                }}
                placeholder="72.4"
              />
            </Field>
            <Field label="Тип почвы" htmlFor="field-soil" required error={errors.soilType}>
              <SelectInput
                id="field-soil"
                value={form.soilType}
                invalid={Boolean(errors.soilType)}
                onChange={(event) => setForm((current) => ({ ...current, soilType: event.target.value }))}
              >
                {FIELD_SOIL_OPTIONS.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          {contour && contourArea > 0 ? (
            <div className={styles.areaHint}>
              <span>По контуру ≈ {formatHa(contourArea)} га</span>
              <Button type="button" size="sm" variant="ghost" onClick={applyContourArea}>
                Подставить площадь
              </Button>
            </div>
          ) : null}

          <div className={styles.row}>
            <Field label="Предшествующая культура" htmlFor="field-crop">
              <SelectInput
                id="field-crop"
                value={form.previousCrop}
                onChange={(event) => setForm((current) => ({ ...current, previousCrop: event.target.value }))}
              >
                <option value="">Нет</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.name}>
                    {crop.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Статус" htmlFor="field-status" required>
              <SelectInput
                id="field-status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as FieldStatus }))
                }
              >
                {(Object.keys(FIELD_STATUS_LABEL) as FieldStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {FIELD_STATUS_LABEL[status]}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <div className={styles.row}>
            <Field label="pH" htmlFor="field-ph">
              <TextInput
                id="field-ph"
                type="number"
                min="0"
                step="0.1"
                value={form.ph}
                onChange={(event) => setForm((current) => ({ ...current, ph: event.target.value }))}
                placeholder="6.4"
              />
            </Field>
            <Field label="N, мг/кг" htmlFor="field-n">
              <TextInput
                id="field-n"
                type="number"
                min="0"
                value={form.n}
                onChange={(event) => setForm((current) => ({ ...current, n: event.target.value }))}
                placeholder="18"
              />
            </Field>
          </div>

          <div className={styles.row}>
            <Field label="P, мг/кг" htmlFor="field-p">
              <TextInput
                id="field-p"
                type="number"
                min="0"
                value={form.p}
                onChange={(event) => setForm((current) => ({ ...current, p: event.target.value }))}
                placeholder="24"
              />
            </Field>
            <Field label="K, мг/кг" htmlFor="field-k">
              <TextInput
                id="field-k"
                type="number"
                min="0"
                value={form.k}
                onChange={(event) => setForm((current) => ({ ...current, k: event.target.value }))}
                placeholder="198"
              />
            </Field>
          </div>
        </div>

        {open && fieldsReady ? (
          <FieldContourEditor
            key={field?.id ?? 'create'}
            initialGeometry={field?.geometry ?? null}
            neighbors={neighbors}
            onChange={handleContourChange}
            onModeChange={setContourMode}
          />
        ) : null}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={handleClose} disabled={pending}>
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Добавить поле'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
