import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import type { Organization } from '@/features/auth/model/types';
import styles from './OrganizationForms.module.css';

type EditOrganizationModalProps = {
  organization: Organization | null;
  pending: boolean;
  onClose: () => void;
  onSave: (input: { name: string; inn?: string; region?: string }) => Promise<void>;
};

export function EditOrganizationModal({ organization, pending, onClose, onSave }: EditOrganizationModalProps) {
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organization) return;
    setName(organization.name);
    setInn(organization.inn ?? '');
    setRegion(organization.region ?? '');
    setError('');
  }, [organization]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Укажите название организации');
      return;
    }
    try {
      await onSave({
        name: name.trim(),
        inn: inn.trim() || undefined,
        region: region.trim() || undefined,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить');
    }
  };

  return (
    <Modal title="Редактировать организацию" open={Boolean(organization)} onClose={onClose}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <Field label="Название" htmlFor="org-name" required>
          <TextInput id="org-name" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="ИНН" htmlFor="org-inn">
          <TextInput
            id="org-inn"
            value={inn}
            onChange={(event) => setInn(event.target.value)}
            placeholder="Необязательно"
          />
        </Field>
        <Field label="Регион" htmlFor="org-region">
          <TextInput
            id="org-region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="Например, Краснодарский край"
          />
        </Field>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
