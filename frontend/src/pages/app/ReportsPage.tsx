import { BarList } from '@/components/BarList';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import {
  getCurrentMonthMetrics,
  getMonthlySeries,
  getTopCategoryExpenses,
} from '@/lib/finance';

export function ReportsPage() {
  const { transactions, categories, reports } = useApp();
  const reportSummary = reports.summary;
  const monthMetrics = reportSummary
    ? {
        income: reportSummary.income,
        expense: reportSummary.expense,
        net: reportSummary.net,
      }
    : getCurrentMonthMetrics(transactions);

  const categoryExpenses = reports.categoryExpenses.length
    ? reports.categoryExpenses.map((c) => ({
        label: c.name,
        value: c.value,
        color: c.color,
        aside: formatCurrency(c.value),
      }))
    : getTopCategoryExpenses(transactions, categories).map((c) => ({
        label: c.name,
        value: c.value,
        color: c.color,
        aside: formatCurrency(c.value),
      }));

  const monthlySeries = reports.monthlySeries.length
    ? reports.monthlySeries.map((m) => ({
        label: m.label,
        value: m.total,
        color: m.net >= 0 ? '#0d8f6e' : '#c43d3d',
        aside: `${formatCurrency(m.income)} / ${formatCurrency(m.expense)}`,
      }))
    : getMonthlySeries(transactions).map((m) => ({
        label: m.label,
        value: m.total,
        color: m.net >= 0 ? '#0d8f6e' : '#c43d3d',
        aside: `${formatCurrency(m.income)} / ${formatCurrency(m.expense)}`,
      }));

  return (
    <div>
      <div className="fc-grid fc-grid--3" style={{ marginBottom: 20 }}>
        <div className="fc-stat">
          <span>Receitas</span>
          <strong>{formatCurrency(monthMetrics.income)}</strong>
        </div>
        <div className="fc-stat">
          <span>Despesas</span>
          <strong>{formatCurrency(monthMetrics.expense)}</strong>
        </div>
        <div className="fc-stat fc-stat--accent">
          <span>Saldo do mês</span>
          <strong>{formatCurrency(monthMetrics.net)}</strong>
        </div>
      </div>

      <div className="fc-grid fc-grid--2">
        <section className="fc-card">
          <h2 style={{ marginTop: 0 }}>Gastos por categoria</h2>
          <BarList items={categoryExpenses} emptyMessage="Sem gastos por categoria ainda." />
        </section>
        <section className="fc-card">
          <h2 style={{ marginTop: 0 }}>Histórico mensal (6 meses)</h2>
          <BarList items={monthlySeries} emptyMessage="Sem histórico suficiente." />
        </section>
      </div>
    </div>
  );
}
