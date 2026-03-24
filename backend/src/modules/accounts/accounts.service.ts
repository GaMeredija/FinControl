import { AppError } from '../../errors/app-error';
import {
  createAccount,
  findAccountById,
  listAccountsByUser,
  updateStoredAccount,
} from '../../repositories/account.repository';
import { listTransactionsByUser } from '../../repositories/transaction.repository';
import {
  CreateAccountInput,
  ListAccountsQuery,
  UpdateAccountInput,
} from './accounts.schemas';

const accountTypeLabels: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupanca',
  cash: 'Dinheiro',
  credit_card: 'Cartao de credito',
  investment: 'Investimento',
};

function sanitizeAccount(account: {
  id: string;
  userId: string;
  name: string;
  type: string;
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    typeLabel: accountTypeLabels[account.type] ?? account.type,
    initialBalance: account.initialBalance,
    currentBalance: account.initialBalance,
    isActive: account.isActive,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function ensureAccountOwnership(userId: string, accountUserId: string) {
  if (userId !== accountUserId) {
    throw new AppError(404, 'Conta nao encontrada.', 'ACCOUNT_NOT_FOUND');
  }
}

export async function listAccounts(userId: string, query: ListAccountsQuery) {
  const accounts = await listAccountsByUser(userId);
  const transactions = await listTransactionsByUser(userId);
  const includeInactive = query.includeInactive ?? false;

  return accounts
    .filter((account) => (includeInactive ? true : account.isActive))
    .sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .map((account) => {
      const currentBalance = transactions
        .filter((transaction) => transaction.accountId === account.id)
        .reduce((sum, transaction) => {
          const amount = Number(transaction.amount);
          return transaction.kind === 'income' ? sum + amount : sum - amount;
        }, account.initialBalance);

      return {
        ...sanitizeAccount(account),
        currentBalance: Number(currentBalance.toFixed(2)),
      };
    });
}

export async function createNewAccount(userId: string, data: CreateAccountInput) {
  const account = await createAccount({
    userId,
    name: data.name,
    type: data.type,
    initialBalance: Number(data.initialBalance.toFixed(2)),
  });

  return sanitizeAccount(account);
}

export async function updateAccount(userId: string, accountId: string, data: UpdateAccountInput) {
  const existingAccount = await findAccountById(accountId);

  if (!existingAccount) {
    throw new AppError(404, 'Conta nao encontrada.', 'ACCOUNT_NOT_FOUND');
  }

  ensureAccountOwnership(userId, existingAccount.userId);

  const updatedAccount = await updateStoredAccount(accountId, (account) => ({
    ...account,
    name: data.name,
    type: data.type,
    initialBalance: Number(data.initialBalance.toFixed(2)),
    updatedAt: new Date().toISOString(),
  }));

  if (!updatedAccount) {
    throw new AppError(404, 'Conta nao encontrada.', 'ACCOUNT_NOT_FOUND');
  }

  return sanitizeAccount(updatedAccount);
}

export async function inactivateAccount(userId: string, accountId: string) {
  const existingAccount = await findAccountById(accountId);

  if (!existingAccount) {
    throw new AppError(404, 'Conta nao encontrada.', 'ACCOUNT_NOT_FOUND');
  }

  ensureAccountOwnership(userId, existingAccount.userId);

  if (!existingAccount.isActive) {
    return sanitizeAccount(existingAccount);
  }

  const updatedAccount = await updateStoredAccount(accountId, (account) => ({
    ...account,
    isActive: false,
    updatedAt: new Date().toISOString(),
  }));

  if (!updatedAccount) {
    throw new AppError(404, 'Conta nao encontrada.', 'ACCOUNT_NOT_FOUND');
  }

  return sanitizeAccount(updatedAccount);
}
