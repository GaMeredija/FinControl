import type { Account, Category, Goal, Transaction } from '@/types/api';
import { formatShortMonth } from '@/lib/format';

export function getCategoryById(
  categories: Category[],
  categoryId: string,
): Category | null {
  return categories.find((c) => c.id === categoryId) ?? null;
}

export function getCurrentMonthMetrics(transactions: Transaction[]) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter(
    (t) => t.transactionDate.slice(0, 7) === currentMonth,
  );

  const income = monthTx
    .filter((t) => t.kind === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = monthTx
    .filter((t) => t.kind === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  return {
    income,
    expense,
    net: income - expense,
    transactions: monthTx,
  };
}

export function getAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  const forAccount = transactions.filter((t) => t.accountId === account.id);
  return forAccount.reduce((sum, t) => {
    const value = Number(t.amount);
    return t.kind === 'income' ? sum + value : sum - value;
  }, Number(account.initialBalance));
}

export function getCurrentGoalSnapshot(goals: Goal[], transactions: Transaction[]) {
  if (!goals.length) {
    return null;
  }

  const monthMetrics = getCurrentMonthMetrics(transactions);
  const currentGoal = goals[0];

  if (currentGoal.mode === 'saving') {
    return {
      ...currentGoal,
      currentValue: Math.max(0, monthMetrics.net),
      label: 'Economia acumulada no mês',
    };
  }

  return {
    ...currentGoal,
    currentValue: monthMetrics.expense,
    label: 'Gastos acumulados no mês',
  };
}

export function getTopCategoryExpenses(
  transactions: Transaction[],
  categories: Category[],
) {
  const monthMetrics = getCurrentMonthMetrics(transactions);
  const totals = new Map<
    string,
    { id: string; name: string; color: string; value: number }
  >();

  monthMetrics.transactions
    .filter((t) => t.kind === 'expense')
    .forEach((t) => {
      const category = getCategoryById(categories, t.categoryId);
      const key = category?.id ?? 'unknown';
      const previous = totals.get(key) ?? {
        id: key,
        name: category?.name ?? 'Sem categoria',
        color: category?.color ?? '#b08968',
        value: 0,
      };
      previous.value += Number(t.amount);
      totals.set(key, previous);
    });

  return [...totals.values()].sort((a, b) => b.value - a.value);
}

export function getRecentTransactions(transactions: Transaction[], limit = 5) {
  return [...transactions]
    .sort((a, b) => {
      if (a.transactionDate !== b.transactionDate) {
        return b.transactionDate.localeCompare(a.transactionDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, limit);
}

export function getMonthlySeries(transactions: Transaction[]) {
  const series: Array<{
    label: string;
    income: number;
    expense: number;
    net: number;
    total: number;
  }> = [];
  const now = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthKey = date.toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(
      (t) => t.transactionDate.slice(0, 7) === monthKey,
    );

    const income = monthTransactions
      .filter((t) => t.kind === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.kind === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);

    series.push({
      label: formatShortMonth(date),
      income,
      expense,
      net: income - expense,
      total: income + expense,
    });
  }

  return series;
}

export function getFilteredTransactions(
  transactions: Transaction[],
  categories: Category[],
  search: string,
  kindFilter: 'all' | 'income' | 'expense',
) {
  const q = search.trim().toLowerCase();

  return [...transactions]
    .filter((t) => {
      if (kindFilter !== 'all' && t.kind !== kindFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      const category = getCategoryById(categories, t.categoryId);
      const haystack = [t.description, t.notes ?? '', category?.name ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => {
      if (a.transactionDate !== b.transactionDate) {
        return b.transactionDate.localeCompare(a.transactionDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function getOrderedAccounts(
  accounts: Account[],
  transactions: Transaction[],
) {
  return [...accounts]
    .sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    })
    .map((account) => ({
      ...account,
      currentBalance: getAccountBalance(account, transactions),
    }));
}
