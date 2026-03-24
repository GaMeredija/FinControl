import { AppLayout } from '@/components/AppLayout';
import { AuthLayout } from '@/components/AuthLayout';
import {
  AppBootstrap,
  GuestOnly,
  RequireAuth,
} from '@/components/RouteGuards';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/context/ToastContext';
import { AccountsPage } from '@/pages/app/AccountsPage';
import { CategoriesPage } from '@/pages/app/CategoriesPage';
import { GoalsPage } from '@/pages/app/GoalsPage';
import { OverviewPage } from '@/pages/app/OverviewPage';
import { ReportsPage } from '@/pages/app/ReportsPage';
import { SettingsPage } from '@/pages/app/SettingsPage';
import { TransactionsPage } from '@/pages/app/TransactionsPage';
import { LandingPage } from '@/pages/auth/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';

export default function App() {
  const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AppProvider>
        <ToastProvider>
          <a href="#main-content" className="skip-link">
            Ir para o conteudo principal
          </a>
          <AppBootstrap>
            <Routes>
              <Route
                path="/"
                element={
                  <AuthLayout>
                    <LandingPage />
                  </AuthLayout>
                }
              />

              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <GuestOnly>
                      <LoginPage />
                    </GuestOnly>
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <GuestOnly>
                      <RegisterPage />
                    </GuestOnly>
                  </AuthLayout>
                }
              />

              <Route element={<RequireAuth />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<OverviewPage />} />
                  <Route path="accounts" element={<AccountsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppBootstrap>
        </ToastProvider>
      </AppProvider>
    </Router>
  );
}
