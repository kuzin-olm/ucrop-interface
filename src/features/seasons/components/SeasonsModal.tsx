import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { TextInput } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { useCreateSeason, useDeleteSeason, useRenameSeason } from '../hooks/useSeasons';
import type { Season } from '../model/types';
import styles from './SeasonsModal.module.css';

type SeasonsModalProps = {
  open: boolean;
  seasons: Season[];
  currentId: string;
  onClose: () => void;
  onDeletedCurrent: (nextId: string) => void;
  onCreated: (id: string) => void;
};

export function SeasonsModal({
  open,
  seasons,
  currentId,
  onClose,
  onDeletedCurrent,
  onCreated,
}: SeasonsModalProps) {
  const createSeason = useCreateSeason();
  const renameSeason = useRenameSeason();
  const deleteSeason = useDeleteSeason();
  const [draftName, setDraftName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirm, setConfirm] = useState<Season | null>(null);
  const [error, setError] = useState('');

  const reset = () => {
    setDraftName('');
    setEditingId(null);
    setEditingName('');
    setConfirm(null);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    try {
      const created = await createSeason.mutateAsync(draftName);
      setDraftName('');
      setError('');
      onCreated(created.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать сезон');
    }
  };

  const handleRename = async () => {
    if (!editingId) return;
    try {
      await renameSeason.mutateAsync({ id: editingId, name: editingName });
      setEditingId(null);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить название');
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      const next = seasons.find((season) => season.id !== confirm.id);
      await deleteSeason.mutateAsync(confirm.id);
      if (confirm.id === currentId && next) {
        onDeletedCurrent(next.id);
      }
      setConfirm(null);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось удалить сезон');
    }
  };

  return (
    <Modal title={confirm ? 'Удалить сезон' : 'Сезоны'} open={open} onClose={handleClose}>
      {confirm ? (
        <div className={styles.confirm}>
          <p className={styles.confirmText}>
            Удалить сезон «{confirm.name}»? Данные этого сезона перестанут отображаться. Это действие нельзя
            отменить.
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={deleteSeason.isPending}>
              Отмена
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()} disabled={deleteSeason.isPending}>
              {deleteSeason.isPending ? 'Удаляем…' : 'Удалить'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {seasons.map((season) => (
              <div key={season.id} className={styles.row}>
                {editingId === season.id ? (
                  <TextInput
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void handleRename();
                      if (event.key === 'Escape') setEditingId(null);
                    }}
                    aria-label="Название сезона"
                    autoFocus
                  />
                ) : (
                  <span className={styles.name}>
                    {season.name}
                    {season.id === currentId ? ' · текущий' : ''}
                  </span>
                )}
                {editingId === season.id ? (
                  <>
                    <button type="button" className={styles.iconButton} onClick={() => void handleRename()} aria-label="Сохранить">
                      <Check size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => setEditingId(null)}
                      aria-label="Отменить"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => {
                        setEditingId(season.id);
                        setEditingName(season.name);
                        setError('');
                      }}
                      aria-label={`Переименовать ${season.name}`}
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => {
                        setConfirm(season);
                        setError('');
                      }}
                      disabled={seasons.length <= 1}
                      aria-label={`Удалить ${season.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className={styles.create}>
            <TextInput
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleCreate();
              }}
              placeholder="Новый сезон"
              aria-label="Название нового сезона"
            />
            <Button
              icon={<Plus size={16} aria-hidden="true" />}
              onClick={() => void handleCreate()}
              disabled={createSeason.isPending || !draftName.trim()}
            >
              Добавить
            </Button>
          </div>
        </>
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
    </Modal>
  );
}
