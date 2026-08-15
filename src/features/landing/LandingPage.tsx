import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sprout, TrendingUp, Wallet, X } from 'lucide-react';
import { useAuth } from '@/app/auth';
import styles from './LandingPage.module.css';

const MODULES = [
  'Поля',
  'Культуры',
  'Планы расчёта',
  'Карта контуров',
  'ИИ-сводка',
  'Дашборд',
  'Сезоны',
  'Организация',
];

const NAV = [
  { href: '#product', label: 'Кабинет' },
  { href: '#features', label: 'Возможности' },
  { href: '#flow', label: 'Процесс' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryTo = user ? '/dashboard' : '/register';
  const primaryLabel = user ? 'В кабинет' : 'Начать работу';

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll');
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const hashId = window.location.hash.slice(1);
    if (hashId) {
      requestAnimationFrame(() => {
        document.getElementById(hashId)?.scrollIntoView();
      });
    }
    return () => {
      document.documentElement.classList.remove('landing-scroll');
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <img className={styles.glow} src="/landing/aerial.jpg" alt="" />
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.noise} />
      </div>

      <header className={scrolled ? `${styles.navbar} ${styles.navbarOn}` : styles.navbar}>
        <div className={styles.container}>
          <div className={styles.navRow}>
            <div className={styles.brand}>
              <span className={styles.mark}>
                <Sprout size={18} aria-hidden="true" />
              </span>
              CropOptimize
            </div>
            <nav className={styles.links} aria-label="Разделы лендинга">
              {NAV.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className={styles.navActions}>
              {user ? null : (
                <Link className={styles.ghost} to="/login">
                  Войти
                </Link>
              )}
              <Link className={`${styles.cta} ${styles.ctaSm} ${styles.glowBtn}`} to={primaryTo}>
                {user ? 'В кабинет' : 'Создать аккаунт'}
              </Link>
              <button
                className={styles.burger}
                type="button"
                aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className={styles.mobileMenu}>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          {user ? null : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Войти
            </Link>
          )}
          <Link className={`${styles.cta} ${styles.glowBtn}`} to={primaryTo} onClick={() => setMenuOpen(false)}>
            {primaryLabel}
          </Link>
        </div>
      ) : null}

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <p className={styles.badge}>
              <span className={styles.dot} />
              Платформа для агрохолдингов
            </p>
            <h1 className={styles.h1}>
              Поля считают
              <br />
              свою <span>маржу</span>
            </h1>
            <p className={styles.lead}>
              CropOptimize собирает культуры, контуры полей и планы расчёта в один кабинет. Агроном видит, что сеять,
              где сеять и какая от этого доходность.
            </p>
            <div className={styles.heroActions}>
              <Link className={`${styles.cta} ${styles.ctaXl} ${styles.glowBtn}`} to={primaryTo}>
                {primaryLabel}
              </Link>
              <a className={styles.glass} href="#product">
                Смотреть кабинет
              </a>
            </div>

            <article className={`${styles.float} ${styles.float1}`}>
              <span className={styles.floatIcon}>
                <TrendingUp size={20} />
              </span>
              <div>
                <div className={styles.floatLabel}>Прогноз маржи</div>
                <div className={styles.floatValue}>+28 450 ₽/га</div>
              </div>
            </article>
            <article className={`${styles.float} ${styles.float2}`}>
              <span className={styles.floatIcon}>
                <Wallet size={20} />
              </span>
              <div>
                <div className={styles.floatLabel}>Полей в обороте</div>
                <div className={styles.floatValue}>48</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className={styles.marquee}>
        <p className={styles.marqueeLabel}>Работает со всем контуром хозяйства</p>
        <div className={styles.trackWrap}>
          <div className={styles.track}>
            {[...MODULES, ...MODULES].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.section} id="product">
        <div className={styles.container}>
          <div className={styles.centerHead}>
            <h2 className={styles.h2}>
              Кабинет агронома, в который <span>хочется вернуться</span>
            </h2>
            <p className={styles.sub}>
              Поля с картой, каталог культур, мастер плана и результаты с ИИ-сводкой. Без перестройки интерфейса под
              каждую задачу — только расширение платформы.
            </p>
          </div>
          <div className={styles.fan} aria-hidden="true">
            <ScreenFrame className={`${styles.screen} ${styles.screenLeft}`} title="Поля · 2026">
              <FieldsMock />
            </ScreenFrame>
            <ScreenFrame className={`${styles.screen} ${styles.screenRight}`} title="Результаты · Юг-2026">
              <ResultsMock />
            </ScreenFrame>
            <ScreenFrame className={`${styles.screen} ${styles.screenCenter}`} title="Dashboard · Агрохолдинг Юг">
              <DashboardMock />
            </ScreenFrame>
          </div>
        </div>
      </section>

      <section className={styles.section} id="features">
        <div className={styles.container}>
          <h2 className={styles.h2}>
            Оптимизация, какой она <span>должна быть</span>
          </h2>
          <div className={styles.bento}>
            <article className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.cardCopy}>
                <span className={styles.tag}>Поля</span>
                <h3>Контуры и почва на одной карте</h3>
                <p>Спутник, статусы, pH/NPK и предшественник. Клик по полигону сразу открывает карточку поля.</p>
              </div>
              <div className={styles.miniStack}>
                <div className={styles.pill}>
                  Поле 3 · 72,4 га <span className={styles.ok}>Активно</span>
                </div>
                <div className={styles.pill}>
                  Участок Север-2 <span>Чернозём</span>
                </div>
              </div>
            </article>
            <article className={styles.card}>
              <span className={styles.tag}>Планы</span>
              <h3>Расчёт, который видно</h3>
              <p>Четыре шага мастера, живой лог и кнопка «Результат» только когда план завершён.</p>
              <div className={styles.miniStack}>
                <div className={styles.pill}>
                  Оптимизация Юг-2026 <span className={styles.ok}>В расчёте</span>
                </div>
                <div className={styles.pill}>
                  Севооборот Север <span>Завершён</span>
                </div>
              </div>
            </article>
            <article className={styles.card}>
              <span className={styles.tag}>Результаты</span>
              <h3>Маржа по каждому полю</h3>
              <p>Карта рекомендаций, три KPI и ИИ-сводка: где потенциал, где концентрация площади, какое поле слабое.</p>
              <div className={styles.kpiRow}>
                <div>
                  <small>Маржа</small>
                  <strong className={styles.ok}>+28 450 ₽/га</strong>
                </div>
                <div>
                  <small>Площадь</small>
                  <strong>1 240 га</strong>
                </div>
              </div>
            </article>
            <article className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.cardCopy}>
                <span className={styles.tag}>Команда</span>
                <h3>Организация и сезоны</h3>
                <p>
                  Каждый сотрудник видит свою организацию. Сезон в шапке переключает культуры, поля, планы и дашборд
                  целиком.
                </p>
              </div>
              <div className={styles.miniStack}>
                <div className={styles.pill}>
                  Агрохолдинг Юг <span className={styles.ok}>2026</span>
                </div>
                <div className={styles.pill}>
                  Анна · агроном <span>Свой контур</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.studio}>
            <img className={styles.photo} src="/landing/portrait.jpg" alt="Агроном с планшетом в поле на закате" />
            <div>
              <h2 className={styles.h2}>
                Кабинет, который <span>едет в поле</span>
              </h2>
              <p className={styles.studioLead}>
                Не нужно собирать сезон по таблицам. Контуры, культуры и результат расчёта остаются в одном месте — на
                компьютере в офисе и на планшете у края поля.
              </p>
              <ul className={styles.checks}>
                <li>Добавляйте поля и рисуйте контур прямо на карте</li>
                <li>Запускайте оптимизацию с выбранными культурами и ограничениями</li>
                <li>Смотрите маржу по каждому полю и короткие выводы по плану</li>
              </ul>
              <Link className={`${styles.cta} ${styles.glowBtn}`} to={primaryTo}>
                {primaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="flow">
        <div className={styles.container}>
          <h2 className={styles.h2}>
            Путь вашего <span>сезона</span>
          </h2>
          <div className={styles.steps}>
            <article className={styles.step}>
              <span className={styles.num}>01</span>
              <h3>Поля и культуры</h3>
              <p>Заводите контуры, почву и каталог культур, которые хозяйство уже сеет или планирует.</p>
            </article>
            <article className={styles.step}>
              <span className={styles.num}>02</span>
              <h3>План расчёта</h3>
              <p>Выбираете цель, поля, культуры и ограничения: бюджет, маржа, площадь на культуру.</p>
            </article>
            <article className={styles.step}>
              <span className={styles.num}>03</span>
              <h3>Оптимизация</h3>
              <p>Система считает распределение. Статус и лог видны в кабинете в реальном времени.</p>
            </article>
            <article className={styles.step}>
              <span className={styles.num}>04</span>
              <h3>Результаты</h3>
              <p>Карта, маржа ₽/га и короткие выводы. Сразу видно, хороший получился план или нет.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section} id="faq">
        <div className={styles.container}>
          <h2 className={styles.h2}>Частые вопросы</h2>
          <div className={styles.faq}>
            <details>
              <summary>Для кого платформа?</summary>
              <p>
                Для агрономов и администраторов организации: холдинга, хозяйства или управляющей компании, у которых
                несколько полей, культур и сезонов.
              </p>
            </details>
            <details>
              <summary>Нужно ли что-то устанавливать?</summary>
              <p>Нет. Это веб-кабинет: вход по email и паролю, данные организации не смешиваются с чужими.</p>
            </details>
            <details>
              <summary>Что считается в плане?</summary>
              <p>
                Вы задаёте поля, культуры и ограничения. Система предлагает распределение и прогноз маржи. Письма на
                почту не отправляются — email нужен только как логин.
              </p>
            </details>
            <details>
              <summary>Можно ли вести несколько сезонов?</summary>
              <p>Да. Сезон выбирается в шапке кабинета и переключает все представления: культуры, поля, планы и дашборд.</p>
            </details>
          </div>
        </div>
      </section>

      <section className={styles.bottom}>
        <div className={styles.container}>
          <h2 className={styles.h2}>
            Соберите сезон, который <span>считает деньги</span>
          </h2>
          <Link className={`${styles.cta} ${styles.ctaXl} ${styles.glowBtn}`} to={primaryTo}>
            {primaryLabel}
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerRow}>
            <span>CropOptimize</span>
            <span>Кабинет оптимизации севооборота</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScreenFrame({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <article className={className}>
      <div className={styles.chrome}>
        <i />
        <i />
        <i />
        <em>{title}</em>
      </div>
      {children}
    </article>
  );
}

function DashboardMock() {
  return (
    <div className={styles.dash}>
      <div className={styles.kpiGrid}>
        <div>
          <small>Маржа</small>
          <b>+28 450 ₽/га</b>
        </div>
        <div>
          <small>Площадь</small>
          <b>1 240 га</b>
        </div>
        <div>
          <small>Планов</small>
          <b>3</b>
        </div>
      </div>
      <div className={styles.dashSplit}>
        <div className={styles.donut} />
        <ul>
          <li>
            <span>Пшеница</span>
            <em>42%</em>
          </li>
          <li>
            <span>Подсолнечник</span>
            <em>31%</em>
          </li>
          <li>
            <span>Кукуруза</span>
            <em>27%</em>
          </li>
        </ul>
      </div>
    </div>
  );
}

function FieldsMock() {
  return (
    <div className={styles.mapMock}>
      <svg viewBox="0 0 280 160" aria-hidden="true">
        <polygon points="18,28 92,18 118,86 24,104" fill="#8fbf5a" />
        <polygon points="108,22 188,16 206,90 122,98" fill="#c4a35a" />
        <polygon points="20,112 130,96 148,148 18,150" fill="#6b8f3a" />
        <polygon points="140,102 214,88 248,146 156,150" fill="#d7b46a" />
      </svg>
      <div className={styles.mapCard}>
        Поле 3 · 72,4 га
        <span>Чернозём</span>
      </div>
    </div>
  );
}

function ResultsMock() {
  return (
    <table className={styles.resultTable}>
      <thead>
        <tr>
          <th>Поле</th>
          <th>Культура</th>
          <th>Маржа</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Поле 3</td>
          <td>Пшеница</td>
          <td className={styles.ok}>+31 200</td>
        </tr>
        <tr>
          <td>Север-2</td>
          <td>Подсолнечник</td>
          <td className={styles.ok}>+26 840</td>
        </tr>
        <tr>
          <td>Юг-1</td>
          <td>Кукуруза</td>
          <td className={styles.ok}>+22 110</td>
        </tr>
      </tbody>
    </table>
  );
}
