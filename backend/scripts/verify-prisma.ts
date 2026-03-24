import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

import { PrismaClient } from '@prisma/client';

function withSchema(databaseUrl: string, schemaName: string) {
  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schemaName);
  return url.toString();
}

function runPrismaDbPush(databaseUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('cmd.exe', ['/c', 'npm run db:push -- --skip-generate'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'pipe',
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `prisma db push falhou com codigo ${code}`));
    });
  });
}

async function main() {
  const baseDatabaseUrl = process.env.DATABASE_URL;

  if (!baseDatabaseUrl) {
    throw new Error('Defina DATABASE_URL para executar o teste Prisma.');
  }

  const schemaName = `smoke_${randomUUID().replace(/-/g, '')}`;
  const databaseUrl = withSchema(baseDatabaseUrl, schemaName);
  process.env.DATABASE_URL = databaseUrl;
  process.env.DATA_PROVIDER = 'prisma';

  await runPrismaDbPush(databaseUrl);

  const { app } = await import('../src/app');
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once('listening', resolve);
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Nao foi possivel identificar a porta do servidor Prisma.');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: baseDatabaseUrl,
      },
    },
  });

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const email = `prisma.${randomUUID()}@example.com`;

  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = await healthResponse.json();

    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuario Prisma',
        email,
        password: '123456',
      }),
    });
    const register = await registerResponse.json();

    const createAccountResponse = await fetch(`${baseUrl}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${register.data.token}`,
      },
      body: JSON.stringify({
        name: 'Conta Prisma',
        type: 'checking',
        initialBalance: 900,
      }),
    });
    const account = await createAccountResponse.json();

    const createCategoryResponse = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${register.data.token}`,
      },
      body: JSON.stringify({
        name: 'Receita Prisma',
        kind: 'income',
        color: '#147a68',
      }),
    });
    const category = await createCategoryResponse.json();

    const createTransactionResponse = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${register.data.token}`,
      },
      body: JSON.stringify({
        description: 'Entrada validada no Prisma',
        kind: 'income',
        amount: 200,
        accountId: account.data.id,
        categoryId: category.data.id,
        transactionDate: '2026-03-24',
        notes: 'Teste relacional',
      }),
    });
    const transaction = await createTransactionResponse.json();

    const reportsResponse = await fetch(`${baseUrl}/reports/summary`, {
      headers: {
        Authorization: `Bearer ${register.data.token}`,
      },
    });
    const reports = await reportsResponse.json();

    console.log(JSON.stringify({
      provider: health.data.dataProvider,
      registeredEmail: register.data.user.email,
      accountName: account.data.name,
      categoryName: category.data.name,
      transactionAmount: transaction.data.amount,
      totalBalance: reports.data.summary.totalBalance,
      income: reports.data.summary.income,
      recentTransactions: reports.data.recentTransactions.length,
    }));
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
