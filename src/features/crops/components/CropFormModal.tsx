import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, SelectInput, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { useCreateCrop, useUpdateCrop } from '../hooks/useCrops';
import { CATEGORY_LABEL, MARGIN_LABEL, SOIL_OPTIONS, STATUS_LABEL } from '../model/labels';
import type { CreateCropInput, Crop, CropCategory, CropStatus, MarginPotential } from '../model/types';
import styles from './AddCropModal.module.css';

type CropFormModalProps = {
  open: boolean;
  crop: Crop | null;
  onClose: () => void;
  onSaved: (mode: 'create' | 'edit') => void;
};

type FormState = {
  name: string;
  category: CropCategory;
  status: CropStatus;
  averageYield: string;
  sowingStart: string;
  sowingEnd: string;
  preferredSoil: string;
  marginPotential: MarginPotential;
};

const INITIAL_FORM: FormState = {
  name: '',
  category: 'grain',
  status: 'planned',
  averageYield: '',
  sowingStart: '',
  sowingEnd: '',
  preferredSoil: SOIL_OPTIONS[0],
  marginPotential: 'medium',
};

function toForm(crop: Crop | null): FormState {
  if (!crop) return INITIAL_FORM;
  return {
    name: crop.name,
    category: crop.category,
    status: crop.status,
    averageYield: String(crop.averageYield),
    sowingStart: crop.sowingWindow.start === '—' ? '' : crop.sowingWindow.start,
    sowingEnd: crop.sowingWindow.end === '—' ? '' : crop.sowingWindow.end,
    preferredSoil: crop.preferredSoil,
    marginPotential: crop.marginPotential,
  };
}

export function CropFormModal({ open, crop, onClose, onSaved }: CropFormModalProps) {
  const createCrop = useCreateCrop();
  const updateCrop = useUpdateCrop();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(toForm(crop));
      setNameError('');
    }
  }, [open, crop]);

  const pending = createCrop.isPending || updateCrop.isPending;
  const isEdit = Boolean(crop);

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setNameError('');
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setNameError('Укажите название культуры');
      return;
    }

    const payload: CreateCropInput = {
      name,
      category: form.category,
      status: form.status,
      averageYield: Number(form.averageYield) || 0,
      sowingWindow: {
        start: form.sowingStart.trim() || '—',
        end: form.sowingEnd.trim() || '—',
      },
      preferredSoil: form.preferredSoil,
      marginPotential: form.marginPotential,
    };

    if (crop) {
      await updateCrop.mutateAsync({ id: crop.id, ...payload });
      onSaved('edit');
    } else {
      await createCrop.mutateAsync(payload);
      onSaved('create');
    }
    setForm(INITIAL_FORM);
  };

  return (
    <Modal title={isEdit ? 'Редактировать культуру' : 'Добавить культуру'} open={open} onClose={handleClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Название культуры" htmlFor="crop-name" required error={nameError}>
          <TextInput
            id="crop-name"
            value={form.name}
            invalid={Boolean(nameError)}
            onChange={(event) => {
              setForm((current) => ({ ...current, name: event.target.value }));
              setNameError('');
            }}
            placeholder="Например, Нут"
            autoFocus
          />
        </Field>

        <div className={styles.row}>
          <Field label="Категория" htmlFor="crop-category">
            <SelectInput
              id="crop-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as CropCategory,
                }))
              }
            >
              {(Object.keys(CATEGORY_LABEL) as CropCategory[]).map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABEL[category]}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Статус" htmlFor="crop-status">
            <SelectInput
              id="crop-status"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as CropStatus }))
              }
            >
              {(Object.keys(STATUS_LABEL) as CropStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <Field label="Средняя урожайность, т/га" htmlFor="crop-yield">
          <TextInput
            id="crop-yield"
            type="number"
            min="0"
            step="0.1"
            value={form.averageYield}
            onChange={(event) => setForm((current) => ({ ...current, averageYield: event.target.value }))}
            placeholder="2.5"
          />
        </Field>

        <div className={styles.row}>
          <Field label="Начало сева" htmlFor="crop-sowing-start">
            <TextInput
              id="crop-sowing-start"
              value={form.sowingStart}
              onChange={(event) => setForm((current) => ({ ...current, sowingStart: event.target.value }))}
              placeholder="25.04"
            />
          </Field>
          <Field label="Конец сева" htmlFor="crop-sowing-end">
            <TextInput
              id="crop-sowing-end"
              value={form.sowingEnd}
              onChange={(event) => setForm((current) => ({ ...current, sowingEnd: event.target.value }))}
              placeholder="15.05"
            />
          </Field>
        </div>

        <div className={styles.row}>
          <Field label="Предпочтительная почва" htmlFor="crop-soil">
            <SelectInput
              id="crop-soil"
              value={form.preferredSoil}
              onChange={(event) => setForm((current) => ({ ...current, preferredSoil: event.target.value }))}
            >
              {SOIL_OPTIONS.map((soil) => (
                <option key={soil} value={soil}>
                  {soil}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Маржинальность" htmlFor="crop-margin">
            <SelectInput
              id="crop-margin"
              value={form.marginPotential}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  marginPotential: event.target.value as MarginPotential,
                }))
              }
            >
              {(Object.keys(MARGIN_LABEL) as MarginPotential[]).map((margin) => (
                <option key={margin} value={margin}>
                  {MARGIN_LABEL[margin]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={handleClose} disabled={pending}>
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
