import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

export function AuthLayout({ title, lead, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link className={styles.brand} to="/">
          <div className={styles.mark}>
            <Sprout size={20} aria-hidden="true" />
          </div>
          <div>
            <div className={styles.name}>CropOptimize</div>
            <div className={styles.hint}>Оптимизация севооборота</div>
          </div>
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
        {children}
      </div>
    </div>
  );
}
