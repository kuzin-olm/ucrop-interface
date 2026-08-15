import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import styles from '@/features/auth/components/AuthLayout.module.css';
import { Button } from '@/shared/ui/Button';
import { Field, TextInput } from '@/shared/ui/Field';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      register({ name, organizationName, email, password });
      navigate('/dashboard', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось зарегистрироваться');
    }
  };

  return (
    <AuthLayout
      title="Регистрация"
      lead="Создайте организацию и первого сотрудника. Письма никуда не отправляются — email нужен только как логин."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Ваше имя" htmlFor="reg-name" required>
          <TextInput
            id="reg-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
            placeholder="Анна Соколова"
            autoComplete="name"
          />
        </Field>
        <Field label="Название организации" htmlFor="reg-org" required>
          <TextInput
            id="reg-org"
            value={organizationName}
            onChange={(event) => {
              setOrganizationName(event.target.value);
              setError('');
            }}
            placeholder="Агрохолдинг Юг"
          />
        </Field>
        <Field label="Email" htmlFor="reg-email" required>
          <TextInput
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            placeholder="anna@agro.local"
          />
        </Field>
        <Field label="Пароль" htmlFor="reg-password" required>
          <TextInput
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            placeholder="Не менее 4 символов"
          />
        </Field>
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button type="submit">Создать организацию</Button>
      </form>
      <p className={styles.footer}>
        Уже есть доступ? <Link to="/login">Войти</Link>
      </p>
    </AuthLayout>
  );
}
