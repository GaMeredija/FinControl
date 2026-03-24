import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { env } from '../config/env';
import {
  getPrismaClient,
  isPrismaProvider,
  toDateTimeString,
  toNumber,
} from '../lib/prisma';
import { readJsonFile, writeJsonFile } from './json-file.repository';

export type StoredAccount = {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card' | 'investment';
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const accountsFilePath = path.resolve(process.cwd(), env.ACCOUNTS_FILE_PATH);

async function readAccounts() {
  return readJsonFile<StoredAccount[]>(accountsFilePath);
}

async function writeAccounts(accounts: StoredAccount[]) {
  await writeJsonFile(accountsFilePath, accounts);
}

function mapPrismaAccount(account: {
  id: string;
  userId: string;
  name: string;
  type: string;
  initialBalance: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type as StoredAccount['type'],
    initialBalance: toNumber(account.initialBalance),
    isActive: account.isActive,
    createdAt: toDateTimeString(account.createdAt),
    updatedAt: toDateTimeString(account.updatedAt),
  } satisfies StoredAccount;
}

export async function createAccount(
  data: Omit<StoredAccount, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>,
) {
  if (isPrismaProvider()) {
    const account = await getPrismaClient().account.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance,
      },
    });

    return mapPrismaAccount(account);
  }

  const accounts = await readAccounts();
  const now = new Date().toISOString();

  const account: StoredAccount = {
    id: randomUUID(),
    userId: data.userId,
    name: data.name,
    type: data.type,
    initialBalance: data.initialBalance,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  accounts.push(account);
  await writeAccounts(accounts);

  return account;
}

export async function findAccountById(accountId: string) {
  if (isPrismaProvider()) {
    const account = await getPrismaClient().account.findUnique({
      where: { id: accountId },
    });

    return account ? mapPrismaAccount(account) : null;
  }

  const accounts = await readAccounts();
  return accounts.find((account) => account.id === accountId) ?? null;
}

export async function listAccountsByUser(userId: string) {
  if (isPrismaProvider()) {
    const accounts = await getPrismaClient().account.findMany({
      where: { userId },
    });

    return accounts.map(mapPrismaAccount);
  }

  const accounts = await readAccounts();

  return accounts.filter((account) => account.userId === userId);
}

export async function updateStoredAccount(
  accountId: string,
  updater: (account: StoredAccount) => StoredAccount,
) {
  if (isPrismaProvider()) {
    const existingAccount = await findAccountById(accountId);

    if (!existingAccount) {
      return null;
    }

    const updatedAccount = updater(existingAccount);
    const account = await getPrismaClient().account.update({
      where: { id: accountId },
      data: {
        name: updatedAccount.name,
        type: updatedAccount.type,
        initialBalance: updatedAccount.initialBalance,
        isActive: updatedAccount.isActive,
      },
    });

    return mapPrismaAccount(account);
  }

  const accounts = await readAccounts();
  const accountIndex = accounts.findIndex((account) => account.id === accountId);

  if (accountIndex === -1) {
    return null;
  }

  const updatedAccount = updater(accounts[accountIndex]);
  accounts[accountIndex] = updatedAccount;

  await writeAccounts(accounts);

  return updatedAccount;
}
