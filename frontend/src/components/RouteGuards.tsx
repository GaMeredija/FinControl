import { useApp } from '@/context/AppContext';
import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { sessionReady } = useApp();

  if (!sessionReady) {
    return (
      <div className="fc-app-loading" role="status" aria-live="polite">
        <span className="fc-sr-only">A carregar a aplicação</span>
        <div className="fc-spinner" aria-hidden />
      </div>
    );
  }

  return children;
}

export function RequireAuth() {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/** Visitante: redireciona se ja autenticado (usa children em rotas planas). */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useApp();

  if (user) {
    return <Navigate to="/app/overview" replace />;
  }

  return children;
}

export function HomeRedirect() {
  const { user } = useApp();

  if (user) {
    return <Navigate to="/app/overview" replace />;
  }

  return <Navigate to="/login" replace />;
}
