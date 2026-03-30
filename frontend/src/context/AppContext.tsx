import { demoApiUrl, isDemoApiUrl } from '@/api/demoApi';
import { apiFetch } from '@/api/fetcher';
import { safeGetItem, safeRemoveItem, safeSetItem } from '@/lib/safeStorage';
import { storageKeys } from '@/lib/storageKeys';
import type {
  Account,
  ApiEnvelope,
  AuthPayload,
  Category,
  Goal,
  HealthPayload,
  ReportsPayload,
  Transaction,
  User,
} from '@/types/api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const defaultReports: ReportsPayload = {
  summary: null,
  recentTransactions: [],
  categoryExpenses: [],
  monthlySeries: [],
};

type Theme = 'light' | 'dark';
type ApiStatus = 'online' | 'offline' | 'unknown';

export type AppContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  token: string | null;
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  reports: ReportsPayload;
  dataProvider: string;
  isDemoMode: boolean;
  apiStatus: ApiStatus;
  includeInactiveAccounts: boolean;
  setIncludeInactiveAccounts: (v: boolean) => void;
  busy: boolean;
  /** true após a primeira tentativa de restaurar a sessão (evita flash login/app) */
  sessionReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: (message?: string) => void;
  restoreSession: () => Promise<void>;
  checkHealth: () => Promise<boolean>;
  fetchProfile: (silent?: boolean) => Promise<boolean>;
  fetchAccounts: (opts?: { silent?: boolean; includeInactive?: boolean }) => Promise<boolean>;
  fetchCategories: (opts?: { silent?: boolean }) => Promise<boolean>;
  fetchTransactions: (opts?: { silent?: boolean }) => Promise<boolean>;
  fetchGoals: (opts?: { silent?: boolean }) => Promise<boolean>;
  fetchReports: (opts?: { silent?: boolean }) => Promise<boolean>;
  syncAll: () => Promise<void>;
  updateProfile: (payload: {
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
  }) => Promise<string>;
};

const AppContext = createContext<AppContextValue | null>(null);

function readStoredTheme(): Theme {
  const value = safeGetItem(storageKeys.theme);
  return value === 'dark' ? 'dark' : 'light';
}

function readStoredApiUrl(): string {
  const stored = safeGetItem(storageKeys.apiUrl)?.trim();
  if (stored) {
    return stored;
  }

  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  if (import.meta.env.PROD) {
    return demoApiUrl;
  }

  return 'http://localhost:3333';
}

function readStoredToken(): string | null {
  return safeGetItem(storageKeys.token);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(readStoredToken());
  const apiUrlRef = useRef(readStoredApiUrl());
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [apiUrl, setApiUrlState] = useState(() => apiUrlRef.current);
  const [token, setToken] = useState<string | null>(() => tokenRef.current);
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reports, setReports] = useState<ReportsPayload>(defaultReports);
  const [dataProvider, setDataProvider] = useState<string>('unknown');
  const [apiStatus, setApiStatus] = useState<ApiStatus>('unknown');
  const [includeInactiveAccounts, setIncludeInactiveAccounts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const isDemoMode = isDemoApiUrl(apiUrl);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    safeSetItem(storageKeys.theme, nextTheme);
  }, []);

  const setApiUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    apiUrlRef.current = trimmed;
    setApiUrlState(trimmed);
    safeSetItem(storageKeys.apiUrl, trimmed);
  }, []);

  const clearWorkspace = useCallback(() => {
    setUser(null);
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setGoals([]);
    setReports(defaultReports);
  }, []);

  const persistToken = useCallback((nextToken: string | null) => {
    tokenRef.current = nextToken;
    setToken(nextToken);
    if (nextToken) {
      safeSetItem(storageKeys.token, nextToken);
    } else {
      safeRemoveItem(storageKeys.token);
    }
  }, []);

  const logout = useCallback(
    (_message?: string) => {
      persistToken(null);
      clearWorkspace();
    },
    [clearWorkspace, persistToken],
  );

  const applySession = useCallback(
    (payload: AuthPayload) => {
      persistToken(payload.token);
      setUser(payload.user);
    },
    [persistToken],
  );

  const checkHealth = useCallback(async () => {
    try {
      const res = await apiFetch<HealthPayload>(apiUrlRef.current, '/health', {
        method: 'GET',
      });
      setApiStatus('online');
      setDataProvider(res.data?.dataProvider ?? 'unknown');
      return true;
    } catch {
      setApiStatus('offline');
      setDataProvider('unknown');
      return false;
    }
  }, []);

  const fetchProfile = useCallback(async (_silent = false) => {
    const auth = tokenRef.current;
    if (!auth) {
      return false;
    }
    try {
      const res = await apiFetch<ApiEnvelope<User>>(apiUrlRef.current, '/auth/me', {
        method: 'GET',
        token: auth,
      });
      setUser(res.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchAccounts = useCallback(
    async (opts?: { silent?: boolean; includeInactive?: boolean }) => {
      const auth = tokenRef.current;
      if (!auth) {
        setAccounts([]);
        return false;
      }
      const includeInactive = opts?.includeInactive ?? includeInactiveAccounts;
      const query = includeInactive ? '?includeInactive=true' : '';
      try {
        const res = await apiFetch<ApiEnvelope<Account[]>>(apiUrlRef.current, `/accounts${query}`, {
          method: 'GET',
          token: auth,
        });
        setAccounts(res.data);
        return true;
      } catch {
        return false;
      }
    },
    [includeInactiveAccounts],
  );

  const fetchCategories = useCallback(async (_opts?: { silent?: boolean }) => {
    const auth = tokenRef.current;
    if (!auth) {
      setCategories([]);
      return false;
    }
    try {
      const res = await apiFetch<ApiEnvelope<Category[]>>(apiUrlRef.current, '/categories', {
        method: 'GET',
        token: auth,
      });
      setCategories(res.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchTransactions = useCallback(async (_opts?: { silent?: boolean }) => {
    const auth = tokenRef.current;
    if (!auth) {
      setTransactions([]);
      return false;
    }
    try {
      const res = await apiFetch<ApiEnvelope<Transaction[]>>(apiUrlRef.current, '/transactions', {
        method: 'GET',
        token: auth,
      });
      setTransactions(res.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchGoals = useCallback(async (_opts?: { silent?: boolean }) => {
    const auth = tokenRef.current;
    if (!auth) {
      setGoals([]);
      return false;
    }
    try {
      const res = await apiFetch<ApiEnvelope<Goal[]>>(apiUrlRef.current, '/goals', {
        method: 'GET',
        token: auth,
      });
      setGoals(res.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchReports = useCallback(async (_opts?: { silent?: boolean }) => {
    const auth = tokenRef.current;
    if (!auth) {
      setReports(defaultReports);
      return false;
    }
    try {
      const res = await apiFetch<ApiEnvelope<ReportsPayload>>(
        apiUrlRef.current,
        '/reports/summary',
        {
          method: 'GET',
          token: auth,
        },
      );
      setReports(res.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadAllCollections = useCallback(async () => {
    await Promise.all([
      fetchAccounts({ silent: true }),
      fetchCategories({ silent: true }),
      fetchTransactions({ silent: true }),
      fetchGoals({ silent: true }),
      fetchReports({ silent: true }),
    ]);
  }, [fetchAccounts, fetchCategories, fetchTransactions, fetchGoals, fetchReports]);

  const login = useCallback(
    async (email: string, password: string) => {
      setBusy(true);
      try {
        const res = await apiFetch<ApiEnvelope<AuthPayload>>(
          apiUrlRef.current,
          '/auth/login',
          {
            method: 'POST',
            jsonBody: { email, password },
          },
        );
        applySession(res.data);
        await checkHealth();
        await loadAllCollections();
      } finally {
        setBusy(false);
      }
    },
    [applySession, checkHealth, loadAllCollections],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setBusy(true);
      try {
        const res = await apiFetch<ApiEnvelope<AuthPayload>>(
          apiUrlRef.current,
          '/auth/register',
          {
            method: 'POST',
            jsonBody: { name, email, password },
          },
        );
        applySession(res.data);
        await checkHealth();
        await loadAllCollections();
      } finally {
        setBusy(false);
      }
    },
    [applySession, checkHealth, loadAllCollections],
  );

  const syncAll = useCallback(async () => {
    if (!tokenRef.current) {
      await checkHealth();
      return;
    }
    setBusy(true);
    try {
      await checkHealth();
      const ok = await fetchProfile(true);
      if (ok) {
        await loadAllCollections();
      }
    } finally {
      setBusy(false);
    }
  }, [checkHealth, fetchProfile, loadAllCollections]);

  const updateProfile = useCallback(
    async (payload: {
      name: string;
      email: string;
      currentPassword: string;
      newPassword: string;
    }) => {
      const auth = tokenRef.current;
      if (!auth) {
        throw new Error('Sessão inválida.');
      }
      const res = await apiFetch<ApiEnvelope<AuthPayload>>(
        apiUrlRef.current,
        '/auth/profile',
        {
          method: 'PATCH',
          token: auth,
          jsonBody: payload,
        },
      );
      applySession(res.data);
      return res.message;
    },
    [applySession],
  );

  const restoreSession = useCallback(async () => {
    const storedToken = readStoredToken();
    const url = readStoredApiUrl();
    apiUrlRef.current = url;
    setApiUrlState(url);
    if (!storedToken) {
      persistToken(null);
      clearWorkspace();
      await apiFetch<HealthPayload>(url, '/health', { method: 'GET' })
        .then(() => {
          setApiStatus('online');
        })
        .catch(() => setApiStatus('offline'));
      return;
    }
    persistToken(storedToken);
    setBusy(true);
    try {
      await checkHealth();
      const ok = await fetchProfile(true);
      if (!ok) {
        logout();
        return;
      }
      await loadAllCollections();
    } finally {
      setBusy(false);
    }
  }, [checkHealth, fetchProfile, loadAllCollections, logout, clearWorkspace, persistToken]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error('FinControl: falha ao restaurar sessão', error);
      } finally {
        if (!cancelled) {
          setSessionReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap executado uma vez
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      setTheme,
      apiUrl,
      setApiUrl,
      token,
      user,
      accounts,
      categories,
      transactions,
      goals,
      reports,
      dataProvider,
      isDemoMode,
      apiStatus,
      includeInactiveAccounts,
      setIncludeInactiveAccounts,
      busy,
      sessionReady,
      login,
      register,
      logout,
      restoreSession,
      checkHealth,
      fetchProfile,
      fetchAccounts,
      fetchCategories,
      fetchTransactions,
      fetchGoals,
      fetchReports,
      syncAll,
      updateProfile,
    }),
    [
      theme,
      setTheme,
      apiUrl,
      setApiUrl,
      token,
      user,
      accounts,
      categories,
      transactions,
      goals,
      reports,
      dataProvider,
      isDemoMode,
      apiStatus,
      includeInactiveAccounts,
      busy,
      sessionReady,
      login,
      register,
      logout,
      restoreSession,
      checkHealth,
      fetchProfile,
      fetchAccounts,
      fetchCategories,
      fetchTransactions,
      fetchGoals,
      fetchReports,
      syncAll,
      updateProfile,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}
