import { getCurrentGoalSnapshot, getCurrentMonthMetrics, getMonthlySeries, getRecentTransactions, getTopCategoryExpenses } from '@/lib/finance';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';
import { storageKeys } from '@/lib/storageKeys';
import type { Account, ApiEnvelope, AuthPayload, Category, Goal, ReportsPayload, Transaction, User } from '@/types/api';

export const demoApiUrl = 'https://demo.fincontrol.local';

type DemoUserRecord = User & {
  password: string;
};

type DemoDatabase = {
  users: DemoUserRecord[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
};

type DemoRequest = RequestInit & {
  token?: string | null;
  jsonBody?: unknown;
};

function nowIso() {
  return new Date().toISOString();
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `demo-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function sanitizeUser(user: DemoUserRecord): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function demoTokenFor(userId: string) {
  return `demo-token:${userId}`;
}

function readTokenUserId(token?: string | null) {
  if (!token?.startsWith('demo-token:')) {
    return null;
  }

  return token.slice('demo-token:'.length) || null;
}

function getMonthDate(offset = 0) {
  return new Date(new Date().getFullYear(), new Date().getMonth() + offset, 8);
}

function buildSeedDatabase(): DemoDatabase {
  const timestamp = nowIso();
  const userId = createId();
  const accountId = createId();
  const salaryCategoryId = createId();
  const foodCategoryId = createId();
  const transportCategoryId = createId();
  const leisureCategoryId = createId();
  const currentMonth = currentDate();
  const previousMonth = getMonthDate(-1).toISOString().slice(0, 10);

  return {
    users: [
      {
        id: userId,
        name: 'Demo FinControl',
        email: 'demo@fincontrol.app',
        password: '123456',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    accounts: [
      {
        id: accountId,
        userId,
        name: 'Conta principal',
        type: 'checking',
        initialBalance: 2500,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    categories: [
      {
        id: salaryCategoryId,
        userId,
        name: 'Salario',
        kind: 'income',
        color: '#0d8f6e',
        isDefault: true,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: foodCategoryId,
        userId,
        name: 'Alimentacao',
        kind: 'expense',
        color: '#d97706',
        isDefault: true,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: transportCategoryId,
        userId,
        name: 'Transporte',
        kind: 'expense',
        color: '#2563eb',
        isDefault: true,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: leisureCategoryId,
        userId,
        name: 'Lazer',
        kind: 'expense',
        color: '#9333ea',
        isDefault: true,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    transactions: [
      {
        id: createId(),
        userId,
        accountId,
        categoryId: salaryCategoryId,
        description: 'Salario mensal',
        kind: 'income',
        amount: 4200,
        transactionDate: currentMonth,
        notes: 'Exemplo para demonstracao',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: createId(),
        userId,
        accountId,
        categoryId: foodCategoryId,
        description: 'Mercado',
        kind: 'expense',
        amount: 380,
        transactionDate: currentMonth,
        notes: 'Compra do mes',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: createId(),
        userId,
        accountId,
        categoryId: transportCategoryId,
        description: 'Combustivel',
        kind: 'expense',
        amount: 220,
        transactionDate: currentMonth,
        notes: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: createId(),
        userId,
        accountId,
        categoryId: leisureCategoryId,
        description: 'Cinema',
        kind: 'expense',
        amount: 75,
        transactionDate: previousMonth,
        notes: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    goals: [
      {
        id: createId(),
        userId,
        title: 'Reserva de emergencia',
        mode: 'saving',
        targetAmount: 1000,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

function readDatabase(): DemoDatabase {
  const raw = safeGetItem(storageKeys.demoDb);
  if (!raw) {
    const seeded = buildSeedDatabase();
    safeSetItem(storageKeys.demoDb, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoDatabase>;
    if (
      Array.isArray(parsed.users)
      && Array.isArray(parsed.accounts)
      && Array.isArray(parsed.categories)
      && Array.isArray(parsed.transactions)
      && Array.isArray(parsed.goals)
    ) {
      return parsed as DemoDatabase;
    }
  } catch {
    // fallback para novo seed logo abaixo
  }

  const seeded = buildSeedDatabase();
  safeSetItem(storageKeys.demoDb, JSON.stringify(seeded));
  return seeded;
}

function writeDatabase(database: DemoDatabase) {
  safeSetItem(storageKeys.demoDb, JSON.stringify(database));
}

function getUserFromToken(database: DemoDatabase, token?: string | null) {
  const userId = readTokenUserId(token);
  if (!userId) {
    throw new Error('Sessao invalida.');
  }

  const user = database.users.find((item) => item.id === userId);
  if (!user) {
    throw new Error('Sessao invalida.');
  }

  return user;
}

function getUserScopedData(database: DemoDatabase, userId: string) {
  return {
    accounts: database.accounts.filter((item) => item.userId === userId),
    categories: database.categories.filter((item) => item.userId === userId),
    transactions: database.transactions.filter((item) => item.userId === userId),
    goals: database.goals.filter((item) => item.userId === userId),
  };
}

function getAccountBalance(account: Account, transactions: Transaction[]) {
  return transactions
    .filter((item) => item.accountId === account.id)
    .reduce((sum, item) => {
      const value = Number(item.amount);
      return item.kind === 'income' ? sum + value : sum - value;
    }, Number(account.initialBalance));
}

function seedWorkspaceForUser(database: DemoDatabase, userId: string) {
  const timestamp = nowIso();
  database.accounts.push({
    id: createId(),
    userId,
    name: 'Conta principal',
    type: 'checking',
    initialBalance: 0,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const defaults: Array<Pick<Category, 'name' | 'kind' | 'color'>> = [
    { name: 'Salario', kind: 'income', color: '#0d8f6e' },
    { name: 'Alimentacao', kind: 'expense', color: '#d97706' },
    { name: 'Transporte', kind: 'expense', color: '#2563eb' },
    { name: 'Lazer', kind: 'expense', color: '#9333ea' },
  ];

  for (const item of defaults) {
    database.categories.push({
      id: createId(),
      userId,
      name: item.name,
      kind: item.kind,
      color: item.color,
      isDefault: true,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

function buildReportsPayload(database: DemoDatabase, userId: string): ReportsPayload {
  const scoped = getUserScopedData(database, userId);
  const orderedAccounts = scoped.accounts.map((account) => ({
    ...account,
    currentBalance: roundCurrency(getAccountBalance(account, scoped.transactions)),
  }));
  const activeAccounts = orderedAccounts.filter((item) => item.isActive);
  const totalBalance = activeAccounts.reduce((sum, item) => sum + Number(item.currentBalance), 0);
  const month = getCurrentMonthMetrics(scoped.transactions);
  const goalSnapshot = getCurrentGoalSnapshot(
    [...scoped.goals].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    scoped.transactions,
  );

  return {
    summary: {
      totalBalance: roundCurrency(totalBalance),
      activeAccountsCount: activeAccounts.length,
      income: roundCurrency(month.income),
      expense: roundCurrency(month.expense),
      net: roundCurrency(month.net),
      goalSnapshot,
    },
    recentTransactions: getRecentTransactions(scoped.transactions).map((item) => ({
      id: item.id,
      description: item.description,
      kind: item.kind,
      amount: item.amount,
      createdAt: item.createdAt,
      categoryName: scoped.categories.find((category) => category.id === item.categoryId)?.name,
    })),
    categoryExpenses: getTopCategoryExpenses(scoped.transactions, scoped.categories).map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      value: roundCurrency(item.value),
    })),
    monthlySeries: getMonthlySeries(scoped.transactions).map((item) => ({
      ...item,
      income: roundCurrency(item.income),
      expense: roundCurrency(item.expense),
      net: roundCurrency(item.net),
      total: roundCurrency(item.total),
    })),
  };
}

function isAccountType(value: unknown): value is Account['type'] {
  return ['checking', 'savings', 'cash', 'credit_card', 'investment'].includes(String(value));
}

function isTransactionKind(value: unknown): value is Transaction['kind'] {
  return value === 'income' || value === 'expense';
}

function isGoalMode(value: unknown): value is Goal['mode'] {
  return value === 'saving' || value === 'limit';
}

function parseAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error('Informe um valor valido.');
  }

  return roundCurrency(amount);
}

function success<T>(data: T, message: string): ApiEnvelope<T> {
  return { data, message };
}

export function isDemoApiUrl(baseUrl: string) {
  const normalized = baseUrl.trim();
  if (!normalized) {
    return false;
  }

  if (normalized === demoApiUrl || normalized.startsWith('demo://')) {
    return true;
  }

  try {
    const url = new URL(normalized);
    return url.hostname === 'demo.fincontrol.local';
  } catch {
    return false;
  }
}

export async function demoApiFetch<T>(
  baseUrl: string,
  path: string,
  init: DemoRequest = {},
): Promise<T> {
  const method = String(init.method ?? 'GET').toUpperCase();
  const url = new URL(path, baseUrl);
  const database = readDatabase();

  if (method === 'GET' && url.pathname === '/health') {
    return {
      data: {
        status: 'ok',
        dataProvider: 'demo',
        timestamp: nowIso(),
      },
      message: 'API online.',
    } as T;
  }

  if (method === 'POST' && url.pathname === '/auth/register') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const name = String(payload.name ?? '').trim();
    const email = normalizeEmail(String(payload.email ?? ''));
    const password = String(payload.password ?? '');

    if (database.users.some((item) => normalizeEmail(item.email) === email)) {
      throw new Error('Este email ja esta em uso.');
    }

    const timestamp = nowIso();
    const user: DemoUserRecord = {
      id: createId(),
      name,
      email,
      password,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    database.users.push(user);
    seedWorkspaceForUser(database, user.id);
    writeDatabase(database);

    return success<AuthPayload>(
      { token: demoTokenFor(user.id), user: sanitizeUser(user) },
      'Conta criada com sucesso.',
    ) as T;
  }

  if (method === 'POST' && url.pathname === '/auth/login') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(String(payload.email ?? ''));
    const password = String(payload.password ?? '');
    const user = database.users.find((item) => normalizeEmail(item.email) === email);

    if (!user || user.password !== password) {
      throw new Error('Email ou senha invalidos.');
    }

    return success<AuthPayload>(
      { token: demoTokenFor(user.id), user: sanitizeUser(user) },
      'Login realizado com sucesso.',
    ) as T;
  }

  const sessionUser = getUserFromToken(database, init.token);
  const scoped = getUserScopedData(database, sessionUser.id);

  if (method === 'GET' && url.pathname === '/auth/me') {
    return success<User>(sanitizeUser(sessionUser), 'Perfil carregado com sucesso.') as T;
  }

  if (method === 'PATCH' && url.pathname === '/auth/profile') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const name = String(payload.name ?? '').trim();
    const email = normalizeEmail(String(payload.email ?? ''));
    const currentPassword = String(payload.currentPassword ?? '').trim();
    const newPassword = String(payload.newPassword ?? '').trim();
    const emailChanging = email !== normalizeEmail(sessionUser.email);
    const passwordChanging = Boolean(newPassword);

    if ((emailChanging || passwordChanging) && currentPassword !== sessionUser.password) {
      throw new Error('Senha atual invalida.');
    }

    const duplicated = database.users.find(
      (item) => normalizeEmail(item.email) === email && item.id !== sessionUser.id,
    );
    if (duplicated) {
      throw new Error('Este email ja esta em uso.');
    }

    sessionUser.name = name;
    sessionUser.email = email;
    sessionUser.updatedAt = nowIso();
    if (passwordChanging) {
      sessionUser.password = newPassword;
    }

    writeDatabase(database);

    return success<AuthPayload>(
      {
        token: demoTokenFor(sessionUser.id),
        user: sanitizeUser(sessionUser),
      },
      'Perfil atualizado com sucesso.',
    ) as T;
  }

  if (method === 'GET' && url.pathname === '/accounts') {
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    const typeLabels: Record<string, string> = {
      checking: 'Conta corrente',
      savings: 'Poupanca',
      cash: 'Dinheiro',
      credit_card: 'Cartao de credito',
      investment: 'Investimento',
    };

    const data = [...scoped.accounts]
      .filter((item) => (includeInactive ? true : item.isActive))
      .sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return left.isActive ? -1 : 1;
        }
        return right.createdAt.localeCompare(left.createdAt);
      })
      .map((item) => ({
        ...item,
        typeLabel: typeLabels[item.type] ?? item.type,
        currentBalance: roundCurrency(getAccountBalance(item, scoped.transactions)),
      }));

    return success(data, 'Contas carregadas com sucesso.') as T;
  }

  if (method === 'POST' && url.pathname === '/accounts') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    if (!isAccountType(payload.type)) {
      throw new Error('Tipo de conta invalido.');
    }

    const timestamp = nowIso();
    const account: Account = {
      id: createId(),
      userId: sessionUser.id,
      name: String(payload.name ?? '').trim(),
      type: payload.type,
      initialBalance: parseAmount(payload.initialBalance),
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    database.accounts.push(account);
    writeDatabase(database);
    return success(account, 'Conta criada com sucesso.') as T;
  }

  if (method === 'PUT' && url.pathname.startsWith('/accounts/')) {
    const accountId = url.pathname.split('/')[2];
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const account = database.accounts.find((item) => item.id === accountId && item.userId === sessionUser.id);
    if (!account) {
      throw new Error('Conta nao encontrada.');
    }
    if (!isAccountType(payload.type)) {
      throw new Error('Tipo de conta invalido.');
    }

    account.name = String(payload.name ?? '').trim();
    account.type = payload.type;
    account.initialBalance = parseAmount(payload.initialBalance);
    account.updatedAt = nowIso();
    writeDatabase(database);
    return success(account, 'Conta atualizada com sucesso.') as T;
  }

  if (method === 'PATCH' && url.pathname.endsWith('/inactivate')) {
    const accountId = url.pathname.split('/')[2];
    const account = database.accounts.find((item) => item.id === accountId && item.userId === sessionUser.id);
    if (!account) {
      throw new Error('Conta nao encontrada.');
    }

    account.isActive = false;
    account.updatedAt = nowIso();
    writeDatabase(database);
    return success(account, 'Conta inativada com sucesso.') as T;
  }

  if (method === 'GET' && url.pathname === '/categories') {
    const data = [...scoped.categories].sort((left, right) => left.name.localeCompare(right.name));
    return success(data, 'Categorias carregadas com sucesso.') as T;
  }

  if (method === 'POST' && url.pathname === '/categories') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const name = String(payload.name ?? '').trim();
    const kind = String(payload.kind ?? '');
    const color = String(payload.color ?? '#147a68');
    if (!isTransactionKind(kind)) {
      throw new Error('Tipo de categoria invalido.');
    }
    if (scoped.categories.some((item) => item.kind === kind && item.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Ja existe uma categoria com esse nome para este tipo.');
    }

    const timestamp = nowIso();
    const category: Category = {
      id: createId(),
      userId: sessionUser.id,
      name,
      kind,
      color,
      isDefault: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    database.categories.push(category);
    writeDatabase(database);
    return success(category, 'Categoria criada com sucesso.') as T;
  }

  if (method === 'PUT' && url.pathname.startsWith('/categories/')) {
    const categoryId = url.pathname.split('/')[2];
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const category = database.categories.find((item) => item.id === categoryId && item.userId === sessionUser.id);
    if (!category) {
      throw new Error('Categoria nao encontrada.');
    }
    const name = String(payload.name ?? '').trim();
    const kind = String(payload.kind ?? '');
    if (!isTransactionKind(kind)) {
      throw new Error('Tipo de categoria invalido.');
    }
    if (
      scoped.categories.some(
        (item) => item.id !== categoryId && item.kind === kind && item.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new Error('Ja existe uma categoria com esse nome para este tipo.');
    }

    category.name = name;
    category.kind = kind;
    category.color = String(payload.color ?? category.color);
    category.updatedAt = nowIso();
    writeDatabase(database);
    return success(category, 'Categoria atualizada com sucesso.') as T;
  }

  if (method === 'DELETE' && url.pathname.startsWith('/categories/')) {
    const categoryId = url.pathname.split('/')[2];
    const category = database.categories.find((item) => item.id === categoryId && item.userId === sessionUser.id);
    if (!category) {
      throw new Error('Categoria nao encontrada.');
    }
    if (scoped.transactions.some((item) => item.categoryId === categoryId)) {
      throw new Error('Nao e possivel remover categoria vinculada a lancamentos.');
    }

    database.categories = database.categories.filter((item) => item.id !== categoryId);
    writeDatabase(database);
    return success(category, 'Categoria removida com sucesso.') as T;
  }

  if (method === 'GET' && url.pathname === '/transactions') {
    const kind = url.searchParams.get('kind');
    const data = [...scoped.transactions]
      .filter((item) => (kind && kind !== 'all' ? item.kind === kind : true))
      .sort((left, right) => {
        if (left.transactionDate !== right.transactionDate) {
          return right.transactionDate.localeCompare(left.transactionDate);
        }
        return right.createdAt.localeCompare(left.createdAt);
      });
    return success(data, 'Lancamentos carregados com sucesso.') as T;
  }

  if (method === 'POST' && url.pathname === '/transactions') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const kind = String(payload.kind ?? '');
    const accountId = String(payload.accountId ?? '');
    const categoryId = String(payload.categoryId ?? '');
    if (!isTransactionKind(kind)) {
      throw new Error('Tipo de lancamento invalido.');
    }

    const account = scoped.accounts.find((item) => item.id === accountId);
    if (!account) {
      throw new Error('Conta nao encontrada.');
    }
    if (!account.isActive) {
      throw new Error('Nao e possivel usar uma conta inativa.');
    }

    const category = scoped.categories.find((item) => item.id === categoryId);
    if (!category) {
      throw new Error('Categoria nao encontrada.');
    }
    if (category.kind !== kind) {
      throw new Error('O tipo da categoria precisa combinar com o tipo do lancamento.');
    }

    const timestamp = nowIso();
    const transaction: Transaction = {
      id: createId(),
      userId: sessionUser.id,
      accountId,
      categoryId,
      description: String(payload.description ?? '').trim(),
      kind,
      amount: parseAmount(payload.amount),
      transactionDate: String(payload.transactionDate ?? currentDate()),
      notes: String(payload.notes ?? '').trim() || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    database.transactions.push(transaction);
    writeDatabase(database);
    return success(transaction, 'Lancamento criado com sucesso.') as T;
  }

  if (method === 'PUT' && url.pathname.startsWith('/transactions/')) {
    const transactionId = url.pathname.split('/')[2];
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const transaction = database.transactions.find((item) => item.id === transactionId && item.userId === sessionUser.id);
    if (!transaction) {
      throw new Error('Lancamento nao encontrado.');
    }

    const kind = String(payload.kind ?? '');
    const accountId = String(payload.accountId ?? '');
    const categoryId = String(payload.categoryId ?? '');
    if (!isTransactionKind(kind)) {
      throw new Error('Tipo de lancamento invalido.');
    }

    const account = scoped.accounts.find((item) => item.id === accountId);
    if (!account) {
      throw new Error('Conta nao encontrada.');
    }
    if (!account.isActive) {
      throw new Error('Nao e possivel usar uma conta inativa.');
    }

    const category = scoped.categories.find((item) => item.id === categoryId);
    if (!category) {
      throw new Error('Categoria nao encontrada.');
    }
    if (category.kind !== kind) {
      throw new Error('O tipo da categoria precisa combinar com o tipo do lancamento.');
    }

    transaction.accountId = accountId;
    transaction.categoryId = categoryId;
    transaction.description = String(payload.description ?? '').trim();
    transaction.kind = kind;
    transaction.amount = parseAmount(payload.amount);
    transaction.transactionDate = String(payload.transactionDate ?? currentDate());
    transaction.notes = String(payload.notes ?? '').trim() || null;
    transaction.updatedAt = nowIso();
    writeDatabase(database);
    return success(transaction, 'Lancamento atualizado com sucesso.') as T;
  }

  if (method === 'DELETE' && url.pathname.startsWith('/transactions/')) {
    const transactionId = url.pathname.split('/')[2];
    const transaction = database.transactions.find((item) => item.id === transactionId && item.userId === sessionUser.id);
    if (!transaction) {
      throw new Error('Lancamento nao encontrado.');
    }

    database.transactions = database.transactions.filter((item) => item.id !== transactionId);
    writeDatabase(database);
    return success(transaction, 'Lancamento removido com sucesso.') as T;
  }

  if (method === 'GET' && url.pathname === '/goals') {
    const data = [...scoped.goals].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    return success(data, 'Metas carregadas com sucesso.') as T;
  }

  if (method === 'POST' && url.pathname === '/goals') {
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const mode = String(payload.mode ?? '');
    if (!isGoalMode(mode)) {
      throw new Error('Modo de meta invalido.');
    }
    const timestamp = nowIso();
    const goal: Goal = {
      id: createId(),
      userId: sessionUser.id,
      title: String(payload.title ?? '').trim(),
      mode,
      targetAmount: parseAmount(payload.targetAmount),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    database.goals.push(goal);
    writeDatabase(database);
    return success(goal, 'Meta criada com sucesso.') as T;
  }

  if (method === 'PUT' && url.pathname.startsWith('/goals/')) {
    const goalId = url.pathname.split('/')[2];
    const payload = (init.jsonBody ?? {}) as Record<string, unknown>;
    const goal = database.goals.find((item) => item.id === goalId && item.userId === sessionUser.id);
    if (!goal) {
      throw new Error('Meta nao encontrada.');
    }
    const mode = String(payload.mode ?? '');
    if (!isGoalMode(mode)) {
      throw new Error('Modo de meta invalido.');
    }

    goal.title = String(payload.title ?? '').trim();
    goal.mode = mode;
    goal.targetAmount = parseAmount(payload.targetAmount);
    goal.updatedAt = nowIso();
    writeDatabase(database);
    return success(goal, 'Meta atualizada com sucesso.') as T;
  }

  if (method === 'DELETE' && url.pathname.startsWith('/goals/')) {
    const goalId = url.pathname.split('/')[2];
    const goal = database.goals.find((item) => item.id === goalId && item.userId === sessionUser.id);
    if (!goal) {
      throw new Error('Meta nao encontrada.');
    }

    database.goals = database.goals.filter((item) => item.id !== goalId);
    writeDatabase(database);
    return success(goal, 'Meta removida com sucesso.') as T;
  }

  if (method === 'GET' && url.pathname === '/reports/summary') {
    return success(buildReportsPayload(database, sessionUser.id), 'Relatorio carregado com sucesso.') as T;
  }

  throw new Error(`Rota demo nao implementada: ${method} ${url.pathname}`);
}
