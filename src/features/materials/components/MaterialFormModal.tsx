import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, SelectInput, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { useCreateMaterial, useUpdateMaterial } from '../hooks/useMaterials';
import {
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_LABEL,
  MATERIAL_STATUS_LABEL,
  MATERIAL_UNIT_LABEL,
  MATERIAL_UNITS,
} from '../model/labels';
import type { Material, MaterialCategory, MaterialStatus, MaterialUnit } from '../model/types';
import styles from './MaterialFormModal.module.css';

type MaterialFormModalProps = {
  open: boolean;
  material: Material | null;
  onClose: () => void;
  onSaved: (mode: 'create' | 'edit') => void;
};

type FormState = {
  name: string;
  note: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  pricePerUnit: string;
  status: MaterialStatus;
};

const INITIAL: FormState = {
  name: '',
  note: '',
  category: 'seeds',
  unit: 'kg',
  pricePerUnit: '',
  status: 'active',
};

function toForm(material: Material | null): FormState {
  if (!material) return INITIAL;
  return {
    name: material.name,
    note: material.note ?? '',
    category: material.category,
    unit: material.unit,
    pricePerUnit: String(material.pricePerUnit),
    status: material.status,
  };
}

export function MaterialFormModal({ open, material, onClose, onSaved }: MaterialFormModalProps) {
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const pending = createMaterial.isPending || updateMaterial.isPending;
  const isEdit = Boolean(material);

  useEffect(() => {
    if (!open) return;
    setForm(toForm(material));
    setError('');
  }, [open, material]);

  const handleClose = () => {
    setForm(INITIAL);
    setError('');
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const price = Number(form.pricePerUnit.replace(',', '.'));
    if (!name) {
      setError('Укажите название материала');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Укажите цену за единицу');
      return;
    }

    const payload = {
      name,
      note: form.note.trim() || undefined,
      category: form.category,
      unit: form.unit,
      pricePerUnit: price,
      status: form.status,
    };

    try {
      if (material) {
        await updateMaterial.mutateAsync({ id: material.id, ...payload });
        onSaved('edit');
      } else {
        await createMaterial.mutateAsync(payload);
        onSaved('create');
      }
      setForm(INITIAL);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить');
    }
  };

  return (
    <Modal title={isEdit ? 'Редактировать материал' : 'Добавить материал'} open={open} onClose={handleClose}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <Field label="Название" htmlFor="material-name" required>
          <TextInput
            id="material-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Например, Аммиачная селитра"
            autoFocus
          />
        </Field>
        <Field label="Примечание" htmlFor="material-note">
          <TextInput
            id="material-note"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="Марка, сорт или состав"
          />
        </Field>
        <div className={styles.row}>
          <Field label="Категория" htmlFor="material-category" required>
            <SelectInput
              id="material-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value as MaterialCategory }))
              }
            >
              {MATERIAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {MATERIAL_CATEGORY_LABEL[category]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Единица измерения" htmlFor="material-unit" required>
            <SelectInput
              id="material-unit"
              value={form.unit}
              onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value as MaterialUnit }))}
            >
              {MATERIAL_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {MATERIAL_UNIT_LABEL[unit]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <div className={styles.row}>
          <Field label="Цена за единицу, ₽" htmlFor="material-price" required>
            <TextInput
              id="material-price"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerUnit}
              onChange={(event) => setForm((current) => ({ ...current, pricePerUnit: event.target.value }))}
              placeholder="890"
            />
          </Field>
          <Field label="Статус" htmlFor="material-status">
            <SelectInput
              id="material-status"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as MaterialStatus }))
              }
            >
              <option value="active">{MATERIAL_STATUS_LABEL.active}</option>
              <option value="inactive">{MATERIAL_STATUS_LABEL.inactive}</option>
            </SelectInput>
          </Field>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={pending}>
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
