export type AccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit_card'
  | 'investment';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  kind: 'income' | 'expense';
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  kind: 'income' | 'expense';
  amount: number;
  transactionDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  mode: 'saving' | 'limit';
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSnapshot {
  title: string;
  mode: string;
  targetAmount: number;
  currentValue: number;
  label: string;
}

export interface ReportsSummary {
  totalBalance: number;
  income: number;
  expense: number;
  net: number;
  activeAccountsCount: number;
  goalSnapshot: GoalSnapshot | null;
}

export interface CategoryExpenseRow {
  id: string;
  name: string;
  color: string;
  value: number;
}

export interface RecentTransactionRow {
  id: string;
  description: string;
  kind: 'income' | 'expense';
  amount: number;
  createdAt: string;
  categoryName?: string;
}

export interface MonthlySeriesRow {
  label: string;
  income: number;
  expense: number;
  net: number;
  total: number;
}

export interface ReportsPayload {
  summary: ReportsSummary | null;
  recentTransactions: RecentTransactionRow[];
  categoryExpenses: CategoryExpenseRow[];
  monthlySeries: MonthlySeriesRow[];
}

export interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface HealthPayload {
  data: { dataProvider?: string };
  message: string;
}
