import { useApp } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme, apiUrl, setApiUrl, isDemoMode } = useApp();

  return (
    <div className="fc-auth">
      <header className="fc-auth__top">
        <Link to="/" className="fc-auth__brand" style={{ textDecoration: 'none' }}>
          FINCONTROL
        </Link>
        <div className="fc-auth__controls">
          <label className="fc-field" style={{ marginBottom: 0, minWidth: 220 }}>
            <span>URL da API</span>
            <input
              className="fc-input"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              autoComplete="off"
            />
          </label>
          {isDemoMode ? <span className="fc-auth__badge">Demo web</span> : null}
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
        </div>
      </header>
      <div className="fc-auth__main">{children}</div>
    </div>
  );
}
