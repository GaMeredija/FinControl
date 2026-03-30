import { BarList } from '@/components/BarList';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDateTime } from '@/lib/format';
import {
  getCurrentGoalSnapshot,
  getCurrentMonthMetrics,
  getOrderedAccounts,
  getRecentTransactions,
  getTopCategoryExpenses,
} from '@/lib/finance';

export function OverviewPage() {
  const { user, accounts, categories, transactions, reports, goals } = useApp();

  const ordered = getOrderedAccounts(accounts, transactions);
  const activeAccounts = ordered.filter((account) => account.isActive);
  const reportSummary = reports.summary;
  const balance =
    reportSummary?.totalBalance ??
    activeAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const monthMetrics = reportSummary
    ? {
        income: reportSummary.income,
        expense: reportSummary.expense,
        net: reportSummary.net,
      }
    : getCurrentMonthMetrics(transactions);
  const goal = reportSummary?.goalSnapshot ?? getCurrentGoalSnapshot(goals, transactions);
  const activeCount = reportSummary?.activeAccountsCount ?? activeAccounts.length;

  const recent = reports.recentTransactions.length
    ? reports.recentTransactions
    : getRecentTransactions(transactions).map((transaction) => ({
        id: transaction.id,
        description: transaction.description,
        kind: transaction.kind,
        amount: Number(transaction.amount),
        createdAt: transaction.createdAt,
        categoryName: categories.find((category) => category.id === transaction.categoryId)?.name,
      }));

  const topCats = reports.categoryExpenses.length
    ? reports.categoryExpenses.map((category) => ({
        label: category.name,
        value: category.value,
        color: category.color,
        aside: formatCurrency(category.value),
      }))
    : getTopCategoryExpenses(transactions, categories).map((category) => ({
        label: category.name,
        value: category.value,
        color: category.color,
        aside: formatCurrency(category.value),
      }));

  return (
    <div>
      <div className="fc-grid fc-grid--4" style={{ marginBottom: 24 }}>
        <div className="fc-stat fc-stat--accent">
          <span>Patrimônio consolidado</span>
          <strong>{formatCurrency(balance)}</strong>
          <span>
            {activeCount} conta{activeCount === 1 ? '' : 's'} ativa
            {activeCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="fc-stat">
          <span>Receitas (mês)</span>
          <strong>{formatCurrency(monthMetrics.income)}</strong>
        </div>
        <div className="fc-stat">
          <span>Despesas (mês)</span>
          <strong>{formatCurrency(monthMetrics.expense)}</strong>
        </div>
        <div className="fc-stat">
          <span>Meta</span>
          <strong>
            {goal
              ? `${goal.title} (${Math.round(
                  goal.targetAmount > 0
                    ? Math.min(100, (goal.currentValue / goal.targetAmount) * 100)
                    : 0,
                )}%)`
              : 'Sem meta'}
          </strong>
          <span>
            {goal
              ? `${goal.label}: ${formatCurrency(goal.currentValue)} de ${formatCurrency(goal.targetAmount)}`
              : 'Defina uma meta em Metas.'}
          </span>
        </div>
      </div>

      <div className="fc-card" style={{ marginBottom: 16 }}>
        <h2 className="fc-kicker" style={{ marginBottom: 8 }}>
          Destaque
        </h2>
        <p style={{ margin: 0, fontSize: '1.05rem' }}>
          Bem-vindo de volta{user?.name ? `, ${user.name}` : ''}.
        </p>
        <p style={{ margin: '8px 0 0', color: 'var(--fc-muted)' }}>
          Use o menu para gerenciar contas, categorias e lançamentos.
        </p>
      </div>

      <div className="fc-grid fc-grid--2">
        <section className="fc-card" aria-labelledby="ov-cat">
          <h2 id="ov-cat" style={{ marginTop: 0 }}>
            Despesas por categoria
          </h2>
          <BarList
            items={topCats}
            emptyMessage="Nenhuma despesa registrada neste mês."
          />
        </section>
        <section className="fc-card" aria-labelledby="ov-recent">
          <h2 id="ov-recent" style={{ marginTop: 0 }}>
            Lançamentos recentes
          </h2>
          {!recent.length ? (
            <div className="fc-empty">Nenhum lançamento ainda.</div>
          ) : (
            recent.map((transaction) => (
              <article key={transaction.id} className="fc-activity">
                <div>
                  <strong>{transaction.description}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--fc-muted)' }}>
                    {transaction.categoryName ?? 'Sem categoria'} — {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
                <span className={transaction.kind === 'income' ? 'fc-tag-pos' : 'fc-tag-neg'}>
                  {transaction.kind === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
