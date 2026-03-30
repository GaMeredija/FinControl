import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { strings } from '../content/strings';
import { getDefaultApiUrl } from '../lib/config';
import { readStorage, removeStorage, storageKeys, writeStorage } from '../lib/storage';
import { apiFetch, healthFetch } from '../services/api';
import type {
  Account,
  ApiEnvelope,
  AuthPayload,
  Category,
  Goal,
  ReportsPayload,
  Transaction,
  User,
} from '../types/api';

const emptyReports: ReportsPayload = {
  summary: null,
  recentTransactions: [],
  categoryExpenses: [],
  monthlySeries: [],
};

type ApiStatus = 'online' | 'offline' | 'unknown';

type AccountPayload = {
  name: string;
  type: Account['type'];
  initialBalance: number;
};

type CategoryPayload = {
  name: string;
  kind: Category['kind'];
  color: string;
};

type TransactionPayload = {
  description: string;
  kind: Transaction['kind'];
  amount: number;
  accountId: string;
  categoryId: string;
  transactionDate: string;
  notes: string;
};

type GoalPayload = {
  title: string;
  mode: Goal['mode'];
  targetAmount: number;
};

type AppContextValue = {
  apiUrl: string;
  setApiUrl: (value: string) => Promise<void>;
  token: string | null;
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  reports: ReportsPayload;
  busy: boolean;
  sessionReady: boolean;
  apiStatus: ApiStatus;
  dataProvider: string;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  syncAll: () => Promise<string>;
  checkHealth: () => Promise<boolean>;
  createAccount: (payload: AccountPayload) => Promise<string>;
  updateAccount: (accountId: string, payload: AccountPayload) => Promise<string>;
  inactivateAccount: (accountId: string) => Promise<string>;
  createCategory: (payload: CategoryPayload) => Promise<string>;
  updateCategory: (categoryId: string, payload: CategoryPayload) => Promise<string>;
  deleteCategory: (categoryId: string) => Promise<string>;
  createTransaction: (payload: TransactionPayload) => Promise<string>;
  updateTransaction: (transactionId: string, payload: TransactionPayload) => Promise<string>;
  deleteTransaction: (transactionId: string) => Promise<string>;
  createGoal: (payload: GoalPayload) => Promise<string>;
  updateGoal: (goalId: string, payload: GoalPayload) => Promise<string>;
  deleteGoal: (goalId: string) => Promise<string>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const apiUrlRef = useRef(getDefaultApiUrl());
  const tokenRef = useRef<string | null>(null);

  const [apiUrl, setApiUrlState] = useState(apiUrlRef.current);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reports, setReports] = useState<ReportsPayload>(emptyReports);
  const [busy, setBusy] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('unknown');
  const [dataProvider, setDataProvider] = useState('unknown');

  const clearWorkspace = useCallback(() => {
    setUser(null);
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setGoals([]);
    setReports(emptyReports);
  }, []);

  const persistToken = useCallback(async (nextToken: string | null) => {
    tokenRef.current = nextToken;
    setToken(nextToken);

    if (nextToken) {
      await writeStorage(storageKeys.token, nextToken);
    } else {
      await removeStorage(storageKeys.token);
    }
  }, []);

  const setApiUrl = useCallback(async (value: string) => {
    const normalized = value.trim();
    apiUrlRef.current = normalized;
    setApiUrlState(normalized);
    await writeStorage(storageKeys.apiUrl, normalized);
  }, []);

  const ensureAuthToken = useCallback(() => {
    const auth = tokenRef.current;

    if (!auth) {
      throw new Error(strings.feedback.sessionExpired);
    }

    return auth;
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await healthFetch(apiUrlRef.current);
      setApiStatus('online');
      setDataProvider(response.data?.dataProvider ?? 'unknown');
      return true;
    } catch {
      setApiStatus('offline');
      setDataProvider('unknown');
      return false;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const auth = tokenRef.current;

    if (!auth) {
      return false;
    }

    try {
      const response = await apiFetch<ApiEnvelope<User>>(apiUrlRef.current, '/auth/me', {
        method: 'GET',
        token: auth,
      });
      setUser(response.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    const auth = tokenRef.current;

    if (!auth) {
      setAccounts([]);
      return false;
    }

    try {
      const response = await apiFetch<ApiEnvelope<Account[]>>(apiUrlRef.current, '/accounts', {
        method: 'GET',
        token: auth,
      });
      setAccounts(response.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const auth = tokenRef.current;

    if (!auth) {
      setCategories([]);
      return false;
    }

    try {
      const response = await apiFetch<ApiEnvelope<Category[]>>(apiUrlRef.current, '/categories', {
        method: 'GET',
        token: auth,
      });
      setCategories(response.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    const auth = tokenRef.current;

    if (!auth) {
      setTransactions([]);
      return false;
    }

    try {
      const response = await apiFetch<ApiEnvelope<Transaction[]>>(
        apiUrlRef.current,
        '/transactions',
        {
          method: 'GET',
          token: auth,
        },
      );
      setTransactions(response.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    const auth = tokenRef.current;

    if (!auth) {
      setGoals([]);
      return false;
    }

    try {
      const response = await apiFetch<ApiEnvelope<Goal[]>>(apiUrlRef.current, '/goals', {
        method: 'GET',
        token: auth,
      });
      setGoals(response.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchReports = useCallback(async () => {
    const auth = tokenRef.current;

    if (!auth) {
      setReports(emptyReports);
      return false;
    }

    try {
      const response = await apiFetch<ApiEnvelope<ReportsPayload>>(
        apiUrlRef.current,
        '/reports/summary',
        {
          method: 'GET',
          token: auth,
        },
      );
      setReports(response.data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadWorkspace = useCallback(async () => {
    await Promise.all([
      fetchAccounts(),
      fetchCategories(),
      fetchTransactions(),
      fetchGoals(),
      fetchReports(),
    ]);
  }, [fetchAccounts, fetchCategories, fetchTransactions, fetchGoals, fetchReports]);

  const applySession = useCallback(
    async (payload: AuthPayload) => {
      await persistToken(payload.token);
      setUser(payload.user);
    },
    [persistToken],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setBusy(true);
      try {
        const response = await apiFetch<ApiEnvelope<AuthPayload>>(apiUrlRef.current, '/auth/login', {
          method: 'POST',
          jsonBody: { email, password },
        });
        await applySession(response.data);
        await checkHealth();
        await loadWorkspace();
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [applySession, checkHealth, loadWorkspace],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setBusy(true);
      try {
        const response = await apiFetch<ApiEnvelope<AuthPayload>>(apiUrlRef.current, '/auth/register', {
          method: 'POST',
          jsonBody: { name, email, password },
        });
        await applySession(response.data);
        await checkHealth();
        await loadWorkspace();
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [applySession, checkHealth, loadWorkspace],
  );

  const logout = useCallback(async () => {
    await persistToken(null);
    clearWorkspace();
  }, [clearWorkspace, persistToken]);

  const syncAll = useCallback(async () => {
    setBusy(true);

    try {
      await checkHealth();
      const hasProfile = await fetchProfile();

      if (!hasProfile) {
        await logout();
        throw new Error(strings.feedback.sessionExpired);
      }

      await loadWorkspace();
      return strings.settings.syncSuccess;
    } finally {
      setBusy(false);
    }
  }, [checkHealth, fetchProfile, loadWorkspace, logout]);

  const createAccount = useCallback(
    async (payload: AccountPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Account>>(apiUrlRef.current, '/accounts', {
          method: 'POST',
          token: ensureAuthToken(),
          jsonBody: payload,
        });
        await Promise.all([fetchAccounts(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchAccounts, fetchReports],
  );

  const updateAccount = useCallback(
    async (accountId: string, payload: AccountPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Account>>(
          apiUrlRef.current,
          `/accounts/${accountId}`,
          {
            method: 'PUT',
            token: ensureAuthToken(),
            jsonBody: payload,
          },
        );
        await Promise.all([fetchAccounts(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchAccounts, fetchReports],
  );

  const inactivateAccount = useCallback(
    async (accountId: string) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Account>>(
          apiUrlRef.current,
          `/accounts/${accountId}/inactivate`,
          {
            method: 'PATCH',
            token: ensureAuthToken(),
          },
        );
        await Promise.all([fetchAccounts(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchAccounts, fetchReports],
  );

  const createCategory = useCallback(
    async (payload: CategoryPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Category>>(apiUrlRef.current, '/categories', {
          method: 'POST',
          token: ensureAuthToken(),
          jsonBody: payload,
        });
        await Promise.all([fetchCategories(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchCategories, fetchReports],
  );

  const updateCategory = useCallback(
    async (categoryId: string, payload: CategoryPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Category>>(
          apiUrlRef.current,
          `/categories/${categoryId}`,
          {
            method: 'PUT',
            token: ensureAuthToken(),
            jsonBody: payload,
          },
        );
        await Promise.all([fetchCategories(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchCategories, fetchReports],
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Category>>(
          apiUrlRef.current,
          `/categories/${categoryId}`,
          {
            method: 'DELETE',
            token: ensureAuthToken(),
          },
        );
        await Promise.all([fetchCategories(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchCategories, fetchReports],
  );

  const createTransaction = useCallback(
    async (payload: TransactionPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Transaction>>(apiUrlRef.current, '/transactions', {
          method: 'POST',
          token: ensureAuthToken(),
          jsonBody: payload,
        });
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchTransactions, fetchAccounts, fetchReports],
  );

  const updateTransaction = useCallback(
    async (transactionId: string, payload: TransactionPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Transaction>>(
          apiUrlRef.current,
          `/transactions/${transactionId}`,
          {
            method: 'PUT',
            token: ensureAuthToken(),
            jsonBody: payload,
          },
        );
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchTransactions, fetchAccounts, fetchReports],
  );

  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Transaction>>(
          apiUrlRef.current,
          `/transactions/${transactionId}`,
          {
            method: 'DELETE',
            token: ensureAuthToken(),
          },
        );
        await Promise.all([fetchTransactions(), fetchAccounts(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchTransactions, fetchAccounts, fetchReports],
  );

  const createGoal = useCallback(
    async (payload: GoalPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Goal>>(apiUrlRef.current, '/goals', {
          method: 'POST',
          token: ensureAuthToken(),
          jsonBody: payload,
        });
        await Promise.all([fetchGoals(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchGoals, fetchReports],
  );

  const updateGoal = useCallback(
    async (goalId: string, payload: GoalPayload) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Goal>>(
          apiUrlRef.current,
          `/goals/${goalId}`,
          {
            method: 'PUT',
            token: ensureAuthToken(),
            jsonBody: payload,
          },
        );
        await Promise.all([fetchGoals(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchGoals, fetchReports],
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      setBusy(true);

      try {
        const response = await apiFetch<ApiEnvelope<Goal>>(
          apiUrlRef.current,
          `/goals/${goalId}`,
          {
            method: 'DELETE',
            token: ensureAuthToken(),
          },
        );
        await Promise.all([fetchGoals(), fetchReports()]);
        return response.message;
      } finally {
        setBusy(false);
      }
    },
    [ensureAuthToken, fetchGoals, fetchReports],
  );

  const restoreSession = useCallback(async () => {
    const [storedApiUrl, storedToken] = await Promise.all([
      readStorage(storageKeys.apiUrl),
      readStorage(storageKeys.token),
    ]);

    const nextApiUrl = storedApiUrl?.trim() || getDefaultApiUrl();
    apiUrlRef.current = nextApiUrl;
    setApiUrlState(nextApiUrl);

    if (!storedToken) {
      await checkHealth();
      return;
    }

    tokenRef.current = storedToken;
    setToken(storedToken);
    setBusy(true);

    try {
      await checkHealth();
      const ok = await fetchProfile();

      if (!ok) {
        await logout();
        return;
      }

      await loadWorkspace();
    } finally {
      setBusy(false);
    }
  }, [checkHealth, fetchProfile, loadWorkspace, logout]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await restoreSession();
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [restoreSession]);

  const value = useMemo<AppContextValue>(
    () => ({
      apiUrl,
      setApiUrl,
      token,
      user,
      accounts,
      categories,
      transactions,
      goals,
      reports,
      busy,
      sessionReady,
      apiStatus,
      dataProvider,
      login,
      register,
      logout,
      syncAll,
      checkHealth,
      createAccount,
      updateAccount,
      inactivateAccount,
      createCategory,
      updateCategory,
      deleteCategory,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      createGoal,
      updateGoal,
      deleteGoal,
    }),
    [
      apiUrl,
      setApiUrl,
      token,
      user,
      accounts,
      categories,
      transactions,
      goals,
      reports,
      busy,
      sessionReady,
      apiStatus,
      dataProvider,
      login,
      register,
      logout,
      syncAll,
      checkHealth,
      createAccount,
      updateAccount,
      inactivateAccount,
      createCategory,
      updateCategory,
      deleteCategory,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      createGoal,
      updateGoal,
      deleteGoal,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider.');
  }

  return context;
}
