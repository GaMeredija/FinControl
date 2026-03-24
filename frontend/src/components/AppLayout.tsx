import { useApp } from '@/context/AppContext';
import { useFocusRouteTitle } from '@/hooks/useFocusMain';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getPageSubtitle, routeTitles } from '@/lib/pageMeta';
import { appNav } from '@/lib/nav';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

export function AppLayout() {
  const { user, apiStatus, logout, theme, setTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const titleRef = useFocusRouteTitle();

  const metaTitle = routeTitles[location.pathname] ?? 'Painel';
  usePageTitle(metaTitle);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="fc-shell">
      <div
        className={`fc-overlay${menuOpen ? ' is-visible' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={`fc-sidebar${menuOpen ? ' is-open' : ''}`}
        id="app-sidebar"
        aria-label="Navegação principal"
      >
        <div className="fc-sidebar__brand">
          <strong>FINCONTROL</strong>
          <p>Gestão financeira pessoal</p>
        </div>

        <div className="fc-sidebar__user">
          <strong>{user?.name ?? 'Utilizador'}</strong>
          <span>{user?.email}</span>
        </div>

        <nav className="fc-nav" aria-label="Módulos">
          {appNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={Boolean(item.end)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="fc-sidebar__footer">
          <span
            className={`fc-pill fc-pill--${
              apiStatus === 'online' ? 'ok' : apiStatus === 'offline' ? 'off' : 'unk'
            }`}
          >
            API {apiStatus === 'online' ? 'online' : apiStatus === 'offline' ? 'offline' : '…'}
          </span>
          <button
            type="button"
            className="fc-btn fc-btn--ghost"
            style={{ color: 'var(--fc-sidebar-text)', borderColor: 'rgba(255,255,255,0.2)' }}
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="fc-main">
        <header className="fc-main__header">
          <div>
            <button
              type="button"
              className="fc-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="app-sidebar"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="fc-sr-only">Abrir menu</span>
              <span aria-hidden>☰</span>
            </button>
            <p className="fc-kicker">Área de trabalho</p>
            <h1 tabIndex={-1} ref={titleRef}>
              {metaTitle}
            </h1>
            <p className="fc-page-lead">{getPageSubtitle(location.pathname)}</p>
          </div>
          <div className="fc-theme-toggle" role="group" aria-label="Tema">
            <button
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Claro
            </button>
            <button
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Escuro
            </button>
          </div>
        </header>

        <main id="main-content" className="fc-main__body" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
