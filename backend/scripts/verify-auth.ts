import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

async function main() {
  const tempDirectory = await mkdtemp(path.join(tmpdir(), 'fincontrol-auth-'));
  const tempUsersFile = path.join(tempDirectory, 'users.json');
  const tempAccountsFile = path.join(tempDirectory, 'accounts.json');
  const tempCategoriesFile = path.join(tempDirectory, 'categories.json');
  const tempTransactionsFile = path.join(tempDirectory, 'transactions.json');
  const tempGoalsFile = path.join(tempDirectory, 'goals.json');

  process.env.USERS_FILE_PATH = tempUsersFile;
  process.env.ACCOUNTS_FILE_PATH = tempAccountsFile;
  process.env.CATEGORIES_FILE_PATH = tempCategoriesFile;
  process.env.TRANSACTIONS_FILE_PATH = tempTransactionsFile;
  process.env.GOALS_FILE_PATH = tempGoalsFile;
  process.env.DATA_PROVIDER = 'json';

  const { app } = await import('../src/app');
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once('listening', () => resolve());
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Nao foi possivel identificar a porta do servidor.');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const email = `teste.${randomUUID()}@example.com`;

  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = await healthResponse.json();

    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuario Teste',
        email,
        password: '123456',
      }),
    });
    const register = await registerResponse.json();

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: '123456',
      }),
    });
    const login = await loginResponse.json();

    const meResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${login.data.token}`,
      },
    });
    const me = await meResponse.json();

    const updateProfileResponse = await fetch(`${baseUrl}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.token}`,
      },
      body: JSON.stringify({
        name: 'Usuario Teste Atualizado',
        email,
      }),
    });
    const updatedProfile = await updateProfileResponse.json();

    const createCategoryResponse = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.token}`,
      },
      body: JSON.stringify({
        name: 'Alimentacao',
        kind: 'expense',
        color: '#ee9b00',
      }),
    });
    const createdCategory = await createCategoryResponse.json();

    const updateCategoryResponse = await fetch(
      `${baseUrl}/categories/${createdCategory.data.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${login.data.token}`,
        },
        body: JSON.stringify({
          name: 'Alimentacao Casa',
          kind: 'expense',
          color: '#f4a261',
        }),
      },
    );
    const updatedCategory = await updateCategoryResponse.json();

    const listCategoriesResponse = await fetch(`${baseUrl}/categories`, {
      headers: {
        Authorization: `Bearer ${login.data.token}`,
      },
    });
    const categories = await listCategoriesResponse.json();

    const createAccountResponse = await fetch(`${baseUrl}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.token}`,
      },
      body: JSON.stringify({
        name: 'Carteira Principal',
        type: 'checking',
        initialBalance: 1450.35,
      }),
    });
    const createdAccount = await createAccountResponse.json();

    const createTransactionResponse = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.token}`,
      },
      body: JSON.stringify({
        description: 'Mercado do mes',
        kind: 'expense',
        amount: 125.5,
        accountId: createdAccount.data.id,
        categoryId: createdCategory.data.id,
        transactionDate: '2026-03-24',
        notes: 'Compra principal',
      }),
    });
    const createdTransaction = await createTransactionResponse.json();

    const updateTransactionResponse = await fetch(
      `${baseUrl}/transactions/${createdTransaction.data.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${login.data.token}`,
        },
        body: JSON.stringify({
          description: 'Mercado do mes atualizado',
          kind: 'expense',
          amount: 150.75,
          accountId: createdAccount.data.id,
          categoryId: createdCategory.data.id,
          transactionDate: '2026-03-24',
          notes: 'Compra reajustada',
        }),
      },
    );
    const updatedTransaction = await updateTransactionResponse.json();

    const listTransactionsResponse = await fetch(`${baseUrl}/transactions`, {
      headers: {
        Authorization: `Bearer ${login.data.token}`,
      },
    });
    const transactions = await listTransactionsResponse.json();

    const createGoalResponse = await fetch(`${baseUrl}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.token}`,
      },
      body: JSON.stringify({
        title: 'Guardar para viagem',
        mode: 'saving',
        targetAmount: 1500,
      }),
    });
    const createdGoal = await createGoalResponse.json();

    const updateGoalResponse = await fetch(`${baseUrl}/goals/${createdGoal.data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.data.token}`,
      },
      body: JSON.stringify({
        title: 'Guardar para viagem internacional',
        mode: 'saving',
        targetAmount: 2000,
      }),
    });
    const updatedGoal = await updateGoalResponse.json();

    const listGoalsResponse = await fetch(`${baseUrl}/goals`, {
      headers: {
        Authorization: `Bearer ${login.data.token}`,
      },
    });
    const goals = await listGoalsResponse.json();

    const deleteCategoryBlockedResponse = await fetch(
      `${baseUrl}/categories/${createdCategory.data.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${login.data.token}`,
        },
      },
    );
    const deleteCategoryBlocked = await deleteCategoryBlockedResponse.json();

    const reportsSummaryResponse = await fetch(`${baseUrl}/reports/summary`, {
      headers: {
        Authorization: `Bearer ${login.data.token}`,
      },
    });
    const reportsSummary = await reportsSummaryResponse.json();

    const updateAccountResponse = await fetch(
      `${baseUrl}/accounts/${createdAccount.data.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${login.data.token}`,
        },
        body: JSON.stringify({
          name: 'Conta Corrente Principal',
          type: 'checking',
          initialBalance: 1500,
        }),
      },
    );
    const updatedAccount = await updateAccountResponse.json();

    const listAccountsResponse = await fetch(`${baseUrl}/accounts?includeInactive=true`, {
      headers: {
        Authorization: `Bearer ${login.data.token}`,
      },
    });
    const accounts = await listAccountsResponse.json();

    const inactivateAccountResponse = await fetch(
      `${baseUrl}/accounts/${createdAccount.data.id}/inactivate`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${login.data.token}`,
        },
      },
    );
    const inactiveAccount = await inactivateAccountResponse.json();

    console.log(
      JSON.stringify({
        healthStatus: health.data.status,
        registeredEmail: register.data.user.email,
        loginTokenReceived: Boolean(login.data.token),
        meEmail: me.data.email,
        updatedProfileName: updatedProfile.data.user.name,
        createdCategoryName: createdCategory.data.name,
        updatedCategoryColor: updatedCategory.data.color,
        categoriesCount: categories.data.length,
        createdTransactionAmount: createdTransaction.data.amount,
        updatedTransactionDescription: updatedTransaction.data.description,
        transactionsCount: transactions.data.length,
        createdGoalTitle: createdGoal.data.title,
        updatedGoalAmount: updatedGoal.data.targetAmount,
        goalsCount: goals.data.length,
        deleteCategoryBlockedCode: deleteCategoryBlocked.error,
        reportsIncome: reportsSummary.data.summary.income,
        reportsExpense: reportsSummary.data.summary.expense,
        reportsRecentCount: reportsSummary.data.recentTransactions.length,
        createdAccountName: createdAccount.data.name,
        updatedAccountBalance: updatedAccount.data.initialBalance,
        accountsCount: accounts.data.length,
        inactiveAccountState: inactiveAccount.data.isActive,
      }),
    );
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

    await rm(tempDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
