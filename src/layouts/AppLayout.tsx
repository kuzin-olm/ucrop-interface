import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Menu, Search, Settings2, Sprout, X } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { useSeason } from '@/app/season';
import { SeasonsModal } from '@/features/seasons/components/SeasonsModal';
import { cn } from '@/shared/lib/cn';
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from './navigation';
import { ScrollToTop } from './ScrollToTop';
import styles from './AppLayout.module.css';

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(styles.link, isActive && styles.active)}
            onClick={onNavigate}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { seasonId, seasons, setSeasonId } = useSeason();
  const { user, organization, logout } = useAuth();
  const [seasonsOpen, setSeasonsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [userMenuOpen]);
  const initials = (user?.name ?? '??')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    setUserMenuOpen(false);
  }, [location.pathname]);
  const isFields = location.pathname === '/fields';
  const isCrops = location.pathname === '/crops';
  const isPlansList = location.pathname === '/plans';
  const isPlansSection = location.pathname.startsWith('/plans');
  const isEmployees = location.pathname === '/employees';
  const query = isFields || isCrops || isPlansList || isEmployees ? (searchParams.get('q') ?? '') : '';
  const searchPlaceholder = isFields
    ? 'Поиск полей...'
    : isPlansSection
      ? 'Поиск планов...'
      : isEmployees
        ? 'Поиск сотрудников...'
        : 'Поиск культур...';

  const handleSearch = (value: string) => {
    if (isPlansSection && !isPlansList) {
      navigate(value ? `/plans?q=${encodeURIComponent(value)}` : '/plans');
      return;
    }
    if (!isFields && !isCrops && !isPlansList && !isEmployees) {
      navigate(value ? `/crops?q=${encodeURIComponent(value)}` : '/crops');
      return;
    }

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.shell}>
      {isSidebarOpen ? <div className={styles.backdrop} onClick={closeSidebar} /> : null}

      <aside className={cn(styles.sidebar, isSidebarOpen && styles.sidebarOpen)}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <Sprout size={20} aria-hidden="true" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>CropOptimize</span>
            <span className={styles.brandHint}>{organization?.name ?? 'Организация'}</span>
          </div>
        </div>

        <NavList items={PRIMARY_NAV} onNavigate={closeSidebar} />
        <div className={styles.navBottom}>
          <NavList items={SECONDARY_NAV} onNavigate={closeSidebar} />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label={isSidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {isSidebarOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>

          <label className={styles.search}>
            <Search className={styles.searchIcon} size={16} aria-hidden="true" />
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </label>

          <div className={styles.topActions}>
            <div className={styles.seasonGroup}>
              <select
                className={styles.season}
                value={seasonId}
                onChange={(event) => setSeasonId(event.target.value)}
                aria-label="Сезон"
              >
                {seasons.map((item) => (
                  <option key={item.id} value={item.id}>
                    Сезон {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.seasonManage}
                onClick={() => setSeasonsOpen(true)}
                aria-label="Управление сезонами"
              >
                <Settings2 size={16} aria-hidden="true" />
              </button>
            </div>

            <button type="button" className={styles.notify} aria-label="Уведомления">
              <Bell size={18} aria-hidden="true" />
              <span className={styles.dot} />
            </button>

            <div className={styles.userWrap} ref={userMenuRef}>
              <button
                type="button"
                className={styles.user}
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <div className={styles.avatar} aria-hidden="true">
                  {initials}
                </div>
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={styles.userRole}>{user?.role}</span>
                </div>
              </button>
              {userMenuOpen ? (
                <div className={styles.userMenu}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                  >
                    Выйти
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main ref={contentRef} className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
        <ScrollToTop target={contentRef} />
      </div>

      <SeasonsModal
        open={seasonsOpen}
        seasons={seasons}
        currentId={seasonId}
        onClose={() => setSeasonsOpen(false)}
        onCreated={setSeasonId}
        onDeletedCurrent={setSeasonId}
      />
    </div>
  );
}
