import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, SelectInput, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { useInviteEmployee } from '../hooks/useEmployees';
import { buildInviteUrl, createInviteToken, inviteExpiresAt } from '../lib/inviteUrl';
import { EMPLOYEE_ROLE_LABEL, EMPLOYEE_ROLES, EMPLOYEE_STATUS_LABEL } from '../model/labels';
import type { EmployeeRole, EmployeeStatus } from '../model/types';
import styles from './EmployeeForm.module.css';

type InviteEmployeeModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type FormState = {
  fullName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
};

const INITIAL: FormState = {
  fullName: '',
  email: '',
  role: 'agronomist',
  status: 'active',
};

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function InviteEmployeeModal({ open, onClose, onCreated }: InviteEmployeeModalProps) {
  const invite = useInviteEmployee();
  const [form, setForm] = useState(INITIAL);
  const [token, setToken] = useState('');
  const [linkVisible, setLinkVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(INITIAL);
    setToken(createInviteToken());
    setLinkVisible(false);
    setError('');
  }, [open]);

  const inviteUrl = useMemo(() => (token ? buildInviteUrl(token) : ''), [token]);
  const canGenerate = form.fullName.trim().length > 0 && form.email.includes('@');

  const handleClose = () => {
    setForm(INITIAL);
    setError('');
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canGenerate) {
      setError('Укажите ФИО и корректный email');
      return;
    }
    try {
      await invite.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        inviteToken: token,
        inviteExpiresAt: inviteExpiresAt(),
      });
      await copyText(inviteUrl);
      onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать приглашение');
    }
  };

  return (
    <Modal title="Пригласить сотрудника" open={open} onClose={handleClose}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <Field label="ФИО" htmlFor="invite-name" required>
          <TextInput
            id="invite-name"
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            placeholder="Иван Петров"
          />
        </Field>
        <Field label="Email" htmlFor="invite-email" required>
          <TextInput
            id="invite-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="ivan@agro.local"
          />
        </Field>
        <div className={styles.row}>
          <Field label="Роль" htmlFor="invite-role" required>
            <SelectInput
              id="invite-role"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as EmployeeRole })}
            >
              {EMPLOYEE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {EMPLOYEE_ROLE_LABEL[role]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Статус" htmlFor="invite-status">
            <SelectInput
              id="invite-status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as EmployeeStatus })}
            >
              <option value="active">{EMPLOYEE_STATUS_LABEL.active}</option>
              <option value="inactive">{EMPLOYEE_STATUS_LABEL.inactive}</option>
            </SelectInput>
          </Field>
        </div>

        <div className={styles.invite}>
          {linkVisible ? (
            <>
              <div className={styles.inviteLabel}>Ссылка-приглашение</div>
              <div className={styles.linkRow}>
                <TextInput className={styles.link} readOnly value={inviteUrl} />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void copyText(inviteUrl);
                  }}
                >
                  Копировать
                </Button>
              </div>
              <p className={styles.inviteHint}>Ссылка одноразовая. Сотрудник перейдёт по ней и задаст пароль.</p>
            </>
          ) : (
            <>
              <p className={styles.inviteHint}>Ссылка одноразовая. Сотрудник перейдёт по ней и задаст пароль.</p>
              <Button type="button" variant="secondary" disabled={!canGenerate} onClick={() => setLinkVisible(true)}>
                Сгенерировать ссылку
              </Button>
            </>
          )}
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={invite.isPending}>
            Отправить приглашение
          </Button>
        </div>
      </form>
    </Modal>
  );
}
