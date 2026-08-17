import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Receipt } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/Toast';
import { formatMoney } from '@/shared/lib/format';
import { useOrganizationCabinet } from '../hooks/useOrganizationCabinet';
import { PAYMENT_STATUS_LABEL, PLAN_DESCRIPTION, PLAN_LABEL } from '../model/labels';
import type { PaymentStatus } from '../model/types';
import { EditOrganizationModal } from './EditOrganizationModal';
import { OrganizationTabs, type OrganizationTab } from './OrganizationTabs';
import { TariffsModal } from './TariffsModal';
import styles from './OrganizationScreen.module.css';

function readTab(value: string | null): OrganizationTab {
  return value === 'payments' ? 'payments' : 'main';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function OrganizationScreen() {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { organization, subscription, payments, isLoading, isError, refetch, updateOrganization } =
    useOrganizationCabinet();
  const [editOpen, setEditOpen] = useState(false);
  const [tariffsOpen, setTariffsOpen] = useState(false);
  const tab = readTab(searchParams.get('tab'));
  const usageMeters = [
    { label: 'Планы', used: subscription.usage.plans, max: subscription.limits.maxPlans },
    { label: 'Поля', used: subscription.usage.fields, max: subscription.limits.maxFields },
    { label: 'Сотрудники', used: subscription.usage.employees, max: subscription.limits.maxEmployees },
    {
      label: 'Одновременные расчёты',
      used: subscription.usage.concurrentCalculations,
      max: subscription.limits.maxConcurrentCalculations,
    },
  ];

  const setTab = (next: OrganizationTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'main') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  if (isLoading) {
    return (
      <section className={styles.page} aria-busy="true" aria-label="Загрузка организации">
        <h1 className={styles.title}>Организация</h1>
        <div className={styles.skeletons}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      </section>
    );
  }

  if (isError || !organization) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Организация</h1>
        <div className={styles.empty}>
          <Building2 size={48} aria-hidden="true" />
          <h2>Не удалось загрузить данные организации</h2>
          <p>Проверьте соединение и попробуйте ещё раз.</p>
          <Button variant="secondary" onClick={refetch}>
            Повторить
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Организация</h1>
      </header>

      <OrganizationTabs value={tab} onChange={setTab} />

      {tab === 'main' ? (
        <div className={styles.stack}>
          <article className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Информация об организации</h2>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                Редактировать
              </Button>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Название</dt>
                <dd>{organization.name}</dd>
              </div>
              <div>
                <dt>ИНН</dt>
                <dd>{organization.inn || '—'}</dd>
              </div>
              <div>
                <dt>Регион</dt>
                <dd>{organization.region || '—'}</dd>
              </div>
            </dl>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Текущий тариф</h2>
              <Button variant="secondary" size="sm" onClick={() => setTariffsOpen(true)}>
                Смотреть тарифы
              </Button>
            </div>
            <div className={styles.planBadge}>{PLAN_LABEL[subscription.plan]}</div>
            <p className={styles.planLead}>{PLAN_DESCRIPTION[subscription.plan]}</p>
            <div className={styles.meters}>
              {usageMeters.map((item) => {
                const ratio = item.max === 0 ? 0 : Math.min(1, item.used / item.max);
                return (
                  <div key={item.label} className={styles.meter}>
                    <div className={styles.meterHead}>
                      <span>{item.label}</span>
                      <span>
                        {item.used} из {item.max}
                      </span>
                    </div>
                    <div
                      className={styles.bar}
                      role="meter"
                      aria-label={`${item.label}: ${item.used} из ${item.max}`}
                      aria-valuemin={0}
                      aria-valuemax={item.max}
                      aria-valuenow={item.used}
                    >
                      <div className={styles.fill} style={{ width: `${Math.round(ratio * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      ) : null}

      {tab === 'payments' ? (
        payments.length === 0 ? (
          <div className={styles.empty}>
            <Receipt size={48} aria-hidden="true" />
            <h2>Пока нет платежей</h2>
            <p>При переходе на платный тариф история платежей появится здесь.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Описание</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Документ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.date)}</td>
                    <td>{payment.description}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>
                      <span className={styles[payment.status as PaymentStatus]}>
                        {PAYMENT_STATUS_LABEL[payment.status]}
                      </span>
                    </td>
                    <td>
                      {payment.invoiceUrl ? (
                        <a
                          className={styles.doc}
                          href={payment.invoiceUrl}
                          onClick={(event) => {
                            if (payment.invoiceUrl === '#') event.preventDefault();
                          }}
                        >
                          Скачать
                        </a>
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      <EditOrganizationModal
        organization={editOpen ? organization : null}
        pending={updateOrganization.isPending}
        onClose={() => setEditOpen(false)}
        onSave={async (input) => {
          await updateOrganization.mutateAsync(input);
          setEditOpen(false);
          notify('Данные организации сохранены');
        }}
      />

      <TariffsModal open={tariffsOpen} currentPlan={subscription.plan} onClose={() => setTariffsOpen(false)} />
    </section>
  );
}
