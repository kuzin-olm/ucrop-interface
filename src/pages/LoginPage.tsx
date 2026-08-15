import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import styles from '@/features/auth/components/AuthLayout.module.css';
import { Button } from '@/shared/ui/Button';
import { Field, TextInput } from '@/shared/ui/Field';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      login(email, password);
      navigate(from, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось войти');
    }
  };

  return (
    <AuthLayout title="Вход" lead="Войдите в организацию, чтобы работать с полями, культурами и планами.">
      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Email" htmlFor="login-email" required>
          <TextInput
            id="login-email"
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
        <Field label="Пароль" htmlFor="login-password" required>
          <TextInput
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            placeholder="••••••••"
          />
        </Field>
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button type="submit">Войти</Button>
      </form>
      <p className={styles.footer}>
        Нет аккаунта? <Link to="/register">Зарегистрировать организацию</Link>
      </p>
      <p className={styles.demo}>
        Демо: <code>anna@agro.local</code> / <code>demo123</code>
      </p>
    </AuthLayout>
  );
}
