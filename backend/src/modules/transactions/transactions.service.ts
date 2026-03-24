import { AppError } from '../../errors/app-error';
import { findAccountById } from '../../repositories/account.repository';
import { findCategoryById } from '../../repositories/category.repository';
import {
  createTransaction,
  deleteStoredTransaction,
  findTransactionById,
  listTransactionsByUser,
  updateStoredTransaction,
} from '../../repositories/transaction.repository';
import {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from './transactions.schemas';

function sanitizeTransaction(transaction: {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  kind: string;
  amount: number;
  transactionDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: transaction.id,
    userId: transaction.userId,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    description: transaction.description,
    kind: transaction.kind,
    amount: transaction.amount,
    transactionDate: transaction.transactionDate,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

function ensureTransactionOwnership(userId: string, transactionUserId: string) {
  if (userId !== transactionUserId) {
    throw new AppError(404, 'Lancamento nao encontrado.', 'TRANSACTION_NOT_FOUND');
  }
}

async function ensureLinkedResources(userId: string, accountId: string, categoryId: string, kind: string) {
  const account = await findAccountById(accountId);

  if (!account || account.userId !== userId) {
    throw new AppError(404, 'Conta nao encontrada.', 'ACCOUNT_NOT_FOUND');
  }

  if (!account.isActive) {
    throw new AppError(409, 'Nao e possivel usar uma conta inativa.', 'ACCOUNT_INACTIVE');
  }

  const category = await findCategoryById(categoryId);

  if (!category || category.userId !== userId) {
    throw new AppError(404, 'Categoria nao encontrada.', 'CATEGORY_NOT_FOUND');
  }

  if (category.kind !== kind) {
    throw new AppError(
      409,
      'O tipo da categoria precisa combinar com o tipo do lancamento.',
      'CATEGORY_KIND_MISMATCH',
    );
  }
}

export async function listTransactions(userId: string, query: ListTransactionsQuery) {
  const transactions = await listTransactionsByUser(userId);

  return transactions
    .filter((transaction) => (query.kind === 'all' ? true : transaction.kind === query.kind))
    .sort((left, right) => {
      if (left.transactionDate !== right.transactionDate) {
        return right.transactionDate.localeCompare(left.transactionDate);
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .map(sanitizeTransaction);
}

export async function createNewTransaction(userId: string, data: CreateTransactionInput) {
  await ensureLinkedResources(userId, data.accountId, data.categoryId, data.kind);

  const transaction = await createTransaction({
    userId,
    accountId: data.accountId,
    categoryId: data.categoryId,
    description: data.description,
    kind: data.kind,
    amount: Number(data.amount.toFixed(2)),
    transactionDate: data.transactionDate,
    notes: data.notes ?? '',
  });

  return sanitizeTransaction(transaction);
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionInput,
) {
  const existingTransaction = await findTransactionById(transactionId);

  if (!existingTransaction) {
    throw new AppError(404, 'Lancamento nao encontrado.', 'TRANSACTION_NOT_FOUND');
  }

  ensureTransactionOwnership(userId, existingTransaction.userId);
  await ensureLinkedResources(userId, data.accountId, data.categoryId, data.kind);

  const updatedTransaction = await updateStoredTransaction(transactionId, (transaction) => ({
    ...transaction,
    accountId: data.accountId,
    categoryId: data.categoryId,
    description: data.description,
    kind: data.kind,
    amount: Number(data.amount.toFixed(2)),
    transactionDate: data.transactionDate,
    notes: data.notes ?? '',
    updatedAt: new Date().toISOString(),
  }));

  if (!updatedTransaction) {
    throw new AppError(404, 'Lancamento nao encontrado.', 'TRANSACTION_NOT_FOUND');
  }

  return sanitizeTransaction(updatedTransaction);
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const existingTransaction = await findTransactionById(transactionId);

  if (!existingTransaction) {
    throw new AppError(404, 'Lancamento nao encontrado.', 'TRANSACTION_NOT_FOUND');
  }

  ensureTransactionOwnership(userId, existingTransaction.userId);

  const removed = await deleteStoredTransaction(transactionId);

  if (!removed) {
    throw new AppError(404, 'Lancamento nao encontrado.', 'TRANSACTION_NOT_FOUND');
  }

  return sanitizeTransaction(existingTransaction);
}
