import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { env } from '../config/env';
import {
  getPrismaClient,
  isPrismaProvider,
  toDateOnlyString,
  toDateTimeString,
  toNumber,
} from '../lib/prisma';
import { readJsonFile, writeJsonFile } from './json-file.repository';

export type StoredTransaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  kind: 'income' | 'expense';
  amount: number;
  transactionDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const transactionsFilePath = path.resolve(process.cwd(), env.TRANSACTIONS_FILE_PATH);

async function readTransactions() {
  return readJsonFile<StoredTransaction[]>(transactionsFilePath);
}

async function writeTransactions(transactions: StoredTransaction[]) {
  await writeJsonFile(transactionsFilePath, transactions);
}

function mapPrismaTransaction(transaction: {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  kind: string;
  amount: unknown;
  transactionDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: transaction.id,
    userId: transaction.userId,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    description: transaction.description,
    kind: transaction.kind as StoredTransaction['kind'],
    amount: toNumber(transaction.amount),
    transactionDate: toDateOnlyString(transaction.transactionDate),
    notes: transaction.notes ?? '',
    createdAt: toDateTimeString(transaction.createdAt),
    updatedAt: toDateTimeString(transaction.updatedAt),
  } satisfies StoredTransaction;
}

export async function createTransaction(
  data: Omit<StoredTransaction, 'id' | 'createdAt' | 'updatedAt'>,
) {
  if (isPrismaProvider()) {
    const transaction = await getPrismaClient().transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        description: data.description,
        kind: data.kind,
        amount: data.amount,
        transactionDate: new Date(`${data.transactionDate}T00:00:00.000Z`),
        notes: data.notes,
      },
    });

    return mapPrismaTransaction(transaction);
  }

  const transactions = await readTransactions();
  const now = new Date().toISOString();

  const transaction: StoredTransaction = {
    id: randomUUID(),
    userId: data.userId,
    accountId: data.accountId,
    categoryId: data.categoryId,
    description: data.description,
    kind: data.kind,
    amount: data.amount,
    transactionDate: data.transactionDate,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  transactions.push(transaction);
  await writeTransactions(transactions);

  return transaction;
}

export async function findTransactionById(transactionId: string) {
  if (isPrismaProvider()) {
    const transaction = await getPrismaClient().transaction.findUnique({
      where: { id: transactionId },
    });

    return transaction ? mapPrismaTransaction(transaction) : null;
  }

  const transactions = await readTransactions();
  return transactions.find((transaction) => transaction.id === transactionId) ?? null;
}

export async function listTransactionsByUser(userId: string) {
  if (isPrismaProvider()) {
    const transactions = await getPrismaClient().transaction.findMany({
      where: { userId },
    });

    return transactions.map(mapPrismaTransaction);
  }

  const transactions = await readTransactions();
  return transactions.filter((transaction) => transaction.userId === userId);
}

export async function updateStoredTransaction(
  transactionId: string,
  updater: (transaction: StoredTransaction) => StoredTransaction,
) {
  if (isPrismaProvider()) {
    const existingTransaction = await findTransactionById(transactionId);

    if (!existingTransaction) {
      return null;
    }

    const updatedTransaction = updater(existingTransaction);
    const transaction = await getPrismaClient().transaction.update({
      where: { id: transactionId },
      data: {
        accountId: updatedTransaction.accountId,
        categoryId: updatedTransaction.categoryId,
        description: updatedTransaction.description,
        kind: updatedTransaction.kind,
        amount: updatedTransaction.amount,
        transactionDate: new Date(`${updatedTransaction.transactionDate}T00:00:00.000Z`),
        notes: updatedTransaction.notes,
      },
    });

    return mapPrismaTransaction(transaction);
  }

  const transactions = await readTransactions();
  const transactionIndex = transactions.findIndex((transaction) => transaction.id === transactionId);

  if (transactionIndex === -1) {
    return null;
  }

  const updatedTransaction = updater(transactions[transactionIndex]);
  transactions[transactionIndex] = updatedTransaction;

  await writeTransactions(transactions);

  return updatedTransaction;
}

export async function deleteStoredTransaction(transactionId: string) {
  if (isPrismaProvider()) {
    const deletedTransaction = await getPrismaClient().transaction.deleteMany({
      where: { id: transactionId },
    });

    return deletedTransaction.count > 0;
  }

  const transactions = await readTransactions();
  const transactionIndex = transactions.findIndex((transaction) => transaction.id === transactionId);

  if (transactionIndex === -1) {
    return false;
  }

  transactions.splice(transactionIndex, 1);
  await writeTransactions(transactions);

  return true;
}
