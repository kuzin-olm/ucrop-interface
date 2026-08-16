import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PlanScope } from '../model/types';
import styles from './PlanScopeToggle.module.css';

type PlanScopeToggleProps = {
  value: PlanScope;
  onChange: (value: PlanScope) => void;
};

const OPTIONS: Array<{ id: PlanScope; label: string }> = [
  { id: 'mine', label: 'Только мои' },
  { id: 'all', label: 'Показать все' },
];

export function PlanScopeToggle({ value, onChange }: PlanScopeToggleProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Partial<Record<PlanScope, HTMLButtonElement | null>>>({});
  const [thumb, setThumb] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const active = optionRefs.current[value];
    if (!group || !active) return;

    const next = { left: active.offsetLeft, width: active.offsetWidth };
    setThumb(next);
    setReady(true);

    const onResize = () => {
      const current = optionRefs.current[value];
      if (!current) return;
      setThumb({ left: current.offsetLeft, width: current.offsetWidth });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [value]);

  return (
    <div ref={groupRef} className={styles.group} role="radiogroup" aria-label="Чьи планы показать">
      <span
        className={cn(styles.thumb, ready && styles.ready)}
        style={{ width: thumb.width, transform: `translateX(${thumb.left}px)` }}
        aria-hidden="true"
      />
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          ref={(node) => {
            optionRefs.current[option.id] = node;
          }}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          className={cn(styles.option, value === option.id && styles.active)}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
