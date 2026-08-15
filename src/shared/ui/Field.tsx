import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import styles from './Field.module.css';

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, required, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required ? <span className={styles.required}> *</span> : null}
      </label>
      {children}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, className, ...props }: InputProps) {
  return (
    <input className={cn(styles.control, invalid && styles.controlError, className)} {...props} />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function SelectInput({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select className={cn(styles.control, invalid && styles.controlError, className)} {...props}>
      {children}
    </select>
  );
}
