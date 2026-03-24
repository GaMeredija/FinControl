import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { PrismaClient } from '@prisma/client';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

type StoredAccount = {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card' | 'investment';
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type StoredCategory = {
  id: string;
  userId: string;
  name: string;
  kind: 'income' | 'expense';
  color?: string;
  createdAt: string;
  updatedAt: string;
};

type StoredTransaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  kind: 'income' | 'expense';
  amount: number;
  transactionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type StoredGoal = {
  id: string;
  userId: string;
  title: string;
  mode: 'saving' | 'limit';
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
};

const prisma = new PrismaClient();

function resolveDataPath(filePath: string | undefined, fallback: string) {
  return path.resolve(process.cwd(), filePath ?? fallback);
}

async function readCollection<T>(filePath: string): Promise<T[]> {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const users = await readCollection<StoredUser>(
    resolveDataPath(process.env.USERS_FILE_PATH, './data/users.json'),
  );
  const accounts = await readCollection<StoredAccount>(
    resolveDataPath(process.env.ACCOUNTS_FILE_PATH, './data/accounts.json'),
  );
  const categories = await readCollection<StoredCategory>(
    resolveDataPath(process.env.CATEGORIES_FILE_PATH, './data/categories.json'),
  );
  const transactions = await readCollection<StoredTransaction>(
    resolveDataPath(process.env.TRANSACTIONS_FILE_PATH, './data/transactions.json'),
  );
  const goals = await readCollection<StoredGoal>(
    resolveDataPath(process.env.GOALS_FILE_PATH, './data/goals.json'),
  );

  let createdUsers = 0;
  let createdAccounts = 0;
  let createdCategories = 0;
  let createdTransactions = 0;
  let createdGoals = 0;

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (existingUser) {
      continue;
    }

    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
    createdUsers += 1;
  }

  for (const account of accounts) {
    const existingAccount = await prisma.account.findUnique({
      where: { id: account.id },
      select: { id: true },
    });

    if (existingAccount) {
      continue;
    }

    await prisma.account.create({
      data: {
        id: account.id,
        userId: account.userId,
        name: account.name,
        type: account.type,
        initialBalance: account.initialBalance,
        isActive: account.isActive,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt),
      },
    });
    createdAccounts += 1;
  }

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: category.id },
      select: { id: true },
    });

    if (existingCategory) {
      continue;
    }

    await prisma.category.create({
      data: {
        id: category.id,
        userId: category.userId,
        name: category.name,
        kind: category.kind,
        color: category.color ?? '#147a68',
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
    });
    createdCategories += 1;
  }

  for (const transaction of transactions) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      select: { id: true },
    });

    if (existingTransaction) {
      continue;
    }

    await prisma.transaction.create({
      data: {
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        description: transaction.description,
        kind: transaction.kind,
        amount: transaction.amount,
        transactionDate: parseDateOnly(transaction.transactionDate),
        notes: transaction.notes ?? '',
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt),
      },
    });
    createdTransactions += 1;
  }

  for (const goal of goals) {
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goal.id },
      select: { id: true },
    });

    if (existingGoal) {
      continue;
    }

    await prisma.goal.create({
      data: {
        id: goal.id,
        userId: goal.userId,
        title: goal.title,
        mode: goal.mode,
        targetAmount: goal.targetAmount,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      },
    });
    createdGoals += 1;
  }

  console.log(JSON.stringify({
    createdUsers,
    createdAccounts,
    createdCategories,
    createdTransactions,
    createdGoals,
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
