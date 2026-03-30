import { DonutChart } from '@/components/DonutChart';
import { MonthlyBarsChart } from '@/components/MonthlyBarsChart';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { exportElementToPdf } from '@/lib/exportPdf';
import { formatCurrency, formatDateTime } from '@/lib/format';
import {
  getCurrentMonthMetrics,
  getMonthlySeries,
  getTopCategoryExpenses,
} from '@/lib/finance';
import { useMemo, useRef, useState } from 'react';

export function ReportsPage() {
  const { transactions, categories, reports, user } = useApp();
  const { push } = useToast();
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const reportSummary = reports.summary;
  const monthMetrics = reportSummary
    ? {
        income: reportSummary.income,
        expense: reportSummary.expense,
        net: reportSummary.net,
        totalBalance: reportSummary.totalBalance,
      }
    : {
        ...getCurrentMonthMetrics(transactions),
        totalBalance: 0,
      };

  const categoryExpenses = reports.categoryExpenses.length
    ? reports.categoryExpenses
    : getTopCategoryExpenses(transactions, categories).map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        value: item.value,
      }));

  const monthlySeries = reports.monthlySeries.length
    ? reports.monthlySeries
    : getMonthlySeries(transactions);

  const recentTransactions = reports.recentTransactions.length
    ? reports.recentTransactions
    : [...transactions]
        .sort((left, right) => {
          if (left.transactionDate !== right.transactionDate) {
            return right.transactionDate.localeCompare(left.transactionDate);
          }
          return right.createdAt.localeCompare(left.createdAt);
        })
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          description: item.description,
          kind: item.kind,
          amount: item.amount,
          createdAt: item.createdAt,
          categoryName: categories.find((category) => category.id === item.categoryId)?.name,
        }));

  const totals = useMemo(() => {
    const totalExpenses = categoryExpenses.reduce((sum, item) => sum + item.value, 0);
    return {
      totalExpenses,
      generatedAt: formatDateTime(new Date().toISOString()),
      bestCategory:
        categoryExpenses.length > 0
          ? [...categoryExpenses].sort((left, right) => right.value - left.value)[0]
          : null,
    };
  }, [categoryExpenses]);

  async function exportPdf() {
    if (!reportRef.current) {
      return;
    }

    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await exportElementToPdf(reportRef.current, `fincontrol-relatorio-${stamp}.pdf`);
      push('PDF gerado com sucesso.', 'success');
    } catch (error) {
      console.error('FinControl: falha ao gerar PDF', error);
      push('Não foi possível gerar o PDF.', 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="fc-report-toolbar">
        <div>
          <p className="fc-kicker" style={{ marginBottom: 8 }}>Relatório executivo</p>
          <p className="fc-page-lead" style={{ margin: 0 }}>
            Panorama mensal, distribuição por categoria e histórico recente prontos para exportação.
          </p>
        </div>
        <button
          type="button"
          className="fc-btn fc-btn--primary"
          onClick={() => void exportPdf()}
          disabled={exporting}
        >
          {exporting ? 'Gerando PDF...' : 'Exportar PDF'}
        </button>
      </div>

      <div ref={reportRef} className="fc-report-export">
        <header className="fc-report-sheet__header">
          <div>
            <p className="fc-kicker">FinControl</p>
            <h2>Relatório financeiro</h2>
            <p>
              Emitido em {totals.generatedAt}
              {user?.name ? ` para ${user.name}` : ''}.
            </p>
          </div>
          <div className="fc-report-sheet__meta">
            <span>Período principal</span>
            <strong>Mês atual</strong>
            <span>Histórico complementar: últimos 6 meses</span>
          </div>
        </header>

        <section className="fc-report-hero">
          <div className="fc-grid fc-grid--4">
            <article className="fc-stat fc-stat--accent">
              <span>Patrimônio consolidado</span>
              <strong>{formatCurrency(reportSummary?.totalBalance ?? 0)}</strong>
              <span>{reportSummary?.activeAccountsCount ?? 0} contas ativas</span>
            </article>
            <article className="fc-stat">
              <span>Receitas do mês</span>
              <strong>{formatCurrency(monthMetrics.income)}</strong>
            </article>
            <article className="fc-stat">
              <span>Despesas do mês</span>
              <strong>{formatCurrency(monthMetrics.expense)}</strong>
            </article>
            <article className="fc-stat">
              <span>Saldo do mês</span>
              <strong>{formatCurrency(monthMetrics.net)}</strong>
              <span>{monthMetrics.net >= 0 ? 'Resultado positivo' : 'Resultado negativo'}</span>
            </article>
          </div>
        </section>

        <div className="fc-report-grid">
          <section className="fc-card">
            <div className="fc-report-card__head">
              <div>
                <p className="fc-kicker">Distribuição</p>
                <h3>Gastos por categoria</h3>
              </div>
              <span className="fc-report-note">
                Total de despesas: {formatCurrency(totals.totalExpenses)}
              </span>
            </div>
            <DonutChart
              title="Gastos por categoria"
              totalLabel={formatCurrency(totals.totalExpenses)}
              slices={categoryExpenses.map((item) => ({
                label: item.name,
                value: item.value,
                color: item.color,
              }))}
            />
          </section>

          <section className="fc-card">
            <div className="fc-report-card__head">
              <div>
                <p className="fc-kicker">Histórico</p>
                <h3>Receitas x despesas</h3>
              </div>
              <span className="fc-report-note">Últimos 6 meses</span>
            </div>
            <MonthlyBarsChart
              items={monthlySeries.map((item) => ({
                label: item.label,
                income: item.income,
                expense: item.expense,
              }))}
            />
          </section>
        </div>

        <div className="fc-report-grid">
          <section className="fc-card">
            <div className="fc-report-card__head">
              <div>
                <p className="fc-kicker">Categorias</p>
                <h3>Ranking de despesas</h3>
              </div>
              <span className="fc-report-note">
                {totals.bestCategory
                  ? `Maior impacto: ${totals.bestCategory.name}`
                  : 'Sem categoria dominante'}
              </span>
            </div>
            {!categoryExpenses.length ? (
              <div className="fc-empty">Sem despesas registradas para montar o ranking.</div>
            ) : (
              <div className="fc-report-table">
                <div className="fc-report-table__head">
                  <span>Categoria</span>
                  <span>Valor</span>
                  <span>Participação</span>
                </div>
                {categoryExpenses.map((item) => {
                  const share = totals.totalExpenses > 0
                    ? `${Math.round((item.value / totals.totalExpenses) * 100)}%`
                    : '0%';
                  return (
                    <div key={item.id} className="fc-report-table__row">
                      <span className="fc-report-table__category">
                        <i style={{ background: item.color }} aria-hidden />
                        {item.name}
                      </span>
                      <strong>{formatCurrency(item.value)}</strong>
                      <span>{share}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="fc-card">
            <div className="fc-report-card__head">
              <div>
                <p className="fc-kicker">Movimentação</p>
                <h3>Histórico recente</h3>
              </div>
              <span className="fc-report-note">Últimos lançamentos registrados</span>
            </div>
            {!recentTransactions.length ? (
              <div className="fc-empty">Nenhum lançamento recente encontrado.</div>
            ) : (
              <div className="fc-report-table">
                <div className="fc-report-table__head fc-report-table__head--transactions">
                  <span>Descrição</span>
                  <span>Categoria</span>
                  <span>Data</span>
                  <span>Valor</span>
                </div>
                {recentTransactions.map((item) => (
                  <div key={item.id} className="fc-report-table__row fc-report-table__row--transactions">
                    <span>{item.description}</span>
                    <span>{item.categoryName ?? 'Sem categoria'}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                    <strong className={item.kind === 'income' ? 'fc-tag-pos' : 'fc-tag-neg'}>
                      {item.kind === 'income' ? '+' : '-'}
                      {formatCurrency(item.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
