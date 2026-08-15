import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatHa } from '@/shared/lib/format';
import { formatIndicators } from '../lib/indicators';
import { FIELD_STATUS_COLOR } from '../model/labels';
import type { Field } from '../model/types';
import { FieldStatusBadge } from './FieldStatusBadge';
import styles from './FieldsTable.module.css';

type FieldsTableProps = {
  fields: Field[];
  selectedId: string | null;
  onOpen: (field: Field) => void;
  onEdit: (field: Field) => void;
  onOptimize: (field: Field) => void;
  onDelete: (field: Field) => void;
};

export function FieldsTable({ fields, selectedId, onOpen, onEdit, onOptimize, onDelete }: FieldsTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuId) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuId(null);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuId]);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Поле</th>
            <th>Площадь (га)</th>
            <th>Тип почвы</th>
            <th>Предшествующая культура</th>
            <th>Статус</th>
            <th>Показатели (pH / NPK)</th>
            <th>
              <span className="sr-only">Действия</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr
              key={field.id}
              tabIndex={0}
              className={cn(field.id === selectedId && styles.selected)}
              onClick={() => onOpen(field)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(field);
                }
              }}
            >
              <td>
                <span className={styles.nameCell}>
                  <span
                    className={styles.dot}
                    style={{ background: field.color ?? FIELD_STATUS_COLOR[field.status] }}
                    aria-hidden="true"
                  />
                  {field.name}
                </span>
              </td>
              <td>{formatHa(field.area)}</td>
              <td>{field.soilType}</td>
              <td className={field.previousCrop ? undefined : styles.muted}>{field.previousCrop ?? '—'}</td>
              <td>
                <FieldStatusBadge status={field.status} />
              </td>
              <td className={styles.indicators}>{formatIndicators(field.indicators)}</td>
              <td className={styles.actions}>
                <div ref={menuId === field.id ? menuRef : undefined}>
                  <button
                    type="button"
                    className={styles.menuButton}
                    aria-label={`Действия для ${field.name}`}
                    aria-expanded={menuId === field.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuId((current) => (current === field.id ? null : field.id));
                    }}
                  >
                    <MoreHorizontal size={18} aria-hidden="true" />
                  </button>
                  {menuId === field.id ? (
                    <div className={styles.menu} role="menu">
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuId(null);
                          onOpen(field);
                        }}
                      >
                        Открыть
                      </button>
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuId(null);
                          onEdit(field);
                        }}
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuId(null);
                          onOptimize(field);
                        }}
                      >
                        Оптимизировать
                      </button>
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuId(null);
                          onDelete(field);
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
