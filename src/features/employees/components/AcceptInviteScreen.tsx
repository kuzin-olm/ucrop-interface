import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import styles from '@/features/auth/components/AuthLayout.module.css';
import { Button } from '@/shared/ui/Button';
import { Field, TextInput } from '@/shared/ui/Field';
import { employeeRepository } from '../api/employeeRepository';
import { EMPLOYEE_ROLE_LABEL } from '../model/labels';
import { parseEmployeeRole } from '../lib/roles';

export function AcceptInviteScreen() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { acceptInvite } = useAuth();
  const invite = useMemo(() => (token ? employeeRepository.getInvite(token) : null), [token]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  if (!invite) {
    return (
      <AuthLayout title="Ссылка недействительна" lead="Приглашение уже использовано или срок действия истёк.">
        <p className={styles.footer}>
          <Link to="/login">Перейти ко входу</Link>
        </p>
      </AuthLayout>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 4) {
      setError('Пароль должен быть не короче 4 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      acceptInvite(token, password);
      navigate('/dashboard', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось принять приглашение');
    }
  };

  return (
    <AuthLayout
      title="Приглашение в организацию"
      lead={`${invite.user.name} · ${invite.user.email}. Задайте пароль для входа в «${invite.organization.name}» (${EMPLOYEE_ROLE_LABEL[parseEmployeeRole(invite.user.role)]}).`}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Пароль" htmlFor="invite-password" required>
          <TextInput
            id="invite-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
          />
        </Field>
        <Field label="Повтор пароля" htmlFor="invite-password-confirm" required>
          <TextInput
            id="invite-password-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setError('');
            }}
          />
        </Field>
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button type="submit">Сохранить и войти</Button>
      </form>
    </AuthLayout>
  );
}
