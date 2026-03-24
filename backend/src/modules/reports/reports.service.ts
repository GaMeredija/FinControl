import { listAccountsByUser } from '../../repositories/account.repository';
import { listCategoriesByUser } from '../../repositories/category.repository';
import { listGoalsByUser } from '../../repositories/goal.repository';
import { listTransactionsByUser } from '../../repositories/transaction.repository';

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export async function getReportSummary(userId: string) {
  const [accounts, categories, goals, transactions] = await Promise.all([
    listAccountsByUser(userId),
    listCategoriesByUser(userId),
    listGoalsByUser(userId),
    listTransactionsByUser(userId),
  ]);

  const currentMonth = getCurrentMonthKey();
  const activeAccounts = accounts.filter((account) => account.isActive);

  const accountsWithBalance = accounts.map((account) => {
    const currentBalance = transactions
      .filter((transaction) => transaction.accountId === account.id)
      .reduce((sum, transaction) => {
        const amount = Number(transaction.amount);
        return transaction.kind === 'income' ? sum + amount : sum - amount;
      }, account.initialBalance);

    return {
      id: account.id,
      isActive: account.isActive,
      currentBalance: roundCurrency(currentBalance),
    };
  });

  const totalBalance = activeAccounts.reduce((sum, account) => {
    const accountSnapshot = accountsWithBalance.find((item) => item.id === account.id);
    return sum + Number(accountSnapshot?.currentBalance ?? account.initialBalance);
  }, 0);

  const monthTransactions = transactions.filter(
    (transaction) => transaction.transactionDate.slice(0, 7) === currentMonth,
  );

  const income = monthTransactions
    .filter((transaction) => transaction.kind === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = monthTransactions
    .filter((transaction) => transaction.kind === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const recentTransactions = [...transactions]
    .sort((left, right) => {
      if (left.transactionDate !== right.transactionDate) {
        return right.transactionDate.localeCompare(left.transactionDate);
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, 5)
    .map((transaction) => {
      const category = categories.find((item) => item.id === transaction.categoryId);
      return {
        id: transaction.id,
        description: transaction.description,
        kind: transaction.kind,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        categoryName: category?.name ?? 'Sem categoria',
        categoryColor: category?.color ?? '#b08968',
        transactionDate: transaction.transactionDate,
        createdAt: transaction.createdAt,
      };
    });

  const categoryTotals = new Map<string, {
    id: string;
    name: string;
    color: string;
    value: number;
  }>();

  monthTransactions
    .filter((transaction) => transaction.kind === 'expense')
    .forEach((transaction) => {
      const category = categories.find((item) => item.id === transaction.categoryId);
      const key = category?.id ?? 'unknown';
      const previous = categoryTotals.get(key) ?? {
        id: key,
        name: category?.name ?? 'Sem categoria',
        color: category?.color ?? '#b08968',
        value: 0,
      };

      previous.value += Number(transaction.amount);
      categoryTotals.set(key, previous);
    });

  const categoryExpenses = [...categoryTotals.values()]
    .sort((left, right) => right.value - left.value)
    .map((item) => ({
      ...item,
      value: roundCurrency(item.value),
    }));

  const monthlySeries = [];
  const now = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthKey = date.toISOString().slice(0, 7);
    const transactionsForMonth = transactions.filter(
      (transaction) => transaction.transactionDate.slice(0, 7) === monthKey,
    );

    const monthIncome = transactionsForMonth
      .filter((transaction) => transaction.kind === 'income')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    const monthExpense = transactionsForMonth
      .filter((transaction) => transaction.kind === 'expense')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    monthlySeries.push({
      label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date),
      income: roundCurrency(monthIncome),
      expense: roundCurrency(monthExpense),
      net: roundCurrency(monthIncome - monthExpense),
      total: roundCurrency(monthIncome + monthExpense),
    });
  }

  const latestGoal = [...goals]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  const goalSnapshot = latestGoal
    ? latestGoal.mode === 'saving'
      ? {
        ...latestGoal,
        currentValue: roundCurrency(Math.max(0, income - expense)),
        label: 'Economia acumulada no mes',
      }
      : {
        ...latestGoal,
        currentValue: roundCurrency(expense),
        label: 'Gastos acumulados no mes',
      }
    : null;

  return {
    summary: {
      totalBalance: roundCurrency(totalBalance),
      activeAccountsCount: activeAccounts.length,
      income: roundCurrency(income),
      expense: roundCurrency(expense),
      net: roundCurrency(income - expense),
      goalSnapshot,
    },
    recentTransactions,
    categoryExpenses,
    monthlySeries,
  };
}
