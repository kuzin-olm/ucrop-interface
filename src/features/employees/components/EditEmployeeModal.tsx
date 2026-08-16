import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Field, SelectInput, TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { useUpdateEmployee } from '../hooks/useEmployees';
import { EMPLOYEE_ROLE_LABEL, EMPLOYEE_ROLES, EMPLOYEE_STATUS_LABEL } from '../model/labels';
import type { Employee, EmployeeRole, EmployeeStatus } from '../model/types';
import styles from './EmployeeForm.module.css';

type EditEmployeeModalProps = {
  employee: Employee | null;
  currentUserId?: string;
  onClose: () => void;
  onSaved: () => void;
};

export function EditEmployeeModal({ employee, currentUserId, onClose, onSaved }: EditEmployeeModalProps) {
  const update = useUpdateEmployee();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<EmployeeRole>('agronomist');
  const [status, setStatus] = useState<EmployeeStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employee) return;
    setFullName(employee.fullName);
    setRole(employee.role);
    setStatus(employee.status);
    setError('');
  }, [employee]);

  const isSelf = employee?.id === currentUserId;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!employee) return;
    if (!fullName.trim()) {
      setError('Укажите ФИО');
      return;
    }
    if (isSelf && status === 'inactive') {
      setError('Нельзя отключить свой доступ');
      return;
    }
    try {
      await update.mutateAsync({
        id: employee.id,
        fullName: fullName.trim(),
        role,
        status,
      });
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить');
    }
  };

  return (
    <Modal title="Редактировать сотрудника" open={Boolean(employee)} onClose={onClose}>
      {employee ? (
        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <Field label="ФИО" htmlFor="edit-name" required>
            <TextInput id="edit-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </Field>
          <Field label="Email" htmlFor="edit-email">
            <div id="edit-email" className={styles.readonly}>
              {employee.email}
            </div>
          </Field>
          <div className={styles.row}>
            <Field label="Роль" htmlFor="edit-role" required>
              <SelectInput
                id="edit-role"
                value={role}
                onChange={(event) => setRole(event.target.value as EmployeeRole)}
              >
                {EMPLOYEE_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {EMPLOYEE_ROLE_LABEL[item]}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Статус" htmlFor="edit-status">
              <SelectInput
                id="edit-status"
                value={status}
                disabled={isSelf}
                onChange={(event) => setStatus(event.target.value as EmployeeStatus)}
              >
                <option value="active">{EMPLOYEE_STATUS_LABEL.active}</option>
                <option value="inactive">{EMPLOYEE_STATUS_LABEL.inactive}</option>
              </SelectInput>
            </Field>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={update.isPending}>
              Сохранить
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}
