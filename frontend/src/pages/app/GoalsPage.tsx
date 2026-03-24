import { apiFetch } from '@/api/fetcher';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, getErrorMessage } from '@/lib/format';
import { getCurrentMonthMetrics } from '@/lib/finance';
import type { ApiEnvelope, Goal } from '@/types/api';
import { useState, type FormEvent } from 'react';

export function GoalsPage() {
  const { apiUrl, token, goals, transactions, fetchGoals, fetchReports } = useApp();
  const { push } = useToast();
  const [editing, setEditing] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'saving' | 'limit'>('saving');
  const [targetAmount, setTargetAmount] = useState('');

  const month = getCurrentMonthMetrics(transactions);

  function startEdit(g: Goal) {
    setEditing(g);
    setTitle(g.title);
    setMode(g.mode);
    setTargetAmount(String(g.targetAmount));
  }

  function reset() {
    setEditing(null);
    setTitle('');
    setMode('saving');
    setTargetAmount('');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      return;
    }
    const payload = {
      title: title.trim(),
      mode,
      targetAmount: Number(String(targetAmount).replace(',', '.')),
    };
    if (!payload.title || payload.targetAmount <= 0) {
      push('Título e valor alvo são obrigatórios.', 'error');
      return;
    }
    try {
      if (editing) {
        const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, `/goals/${editing.id}`, {
          method: 'PUT',
          token,
          jsonBody: payload,
        });
        push(res.message, 'success');
      } else {
        const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, '/goals', {
          method: 'POST',
          token,
          jsonBody: payload,
        });
        push(res.message, 'success');
      }
      reset();
      await fetchGoals({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  async function remove(g: Goal) {
    if (!token || !window.confirm(`Remover meta "${g.title}"?`)) {
      return;
    }
    try {
      const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, `/goals/${g.id}`, {
        method: 'DELETE',
        token,
      });
      push(res.message, 'success');
      await fetchGoals({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="fc-grid fc-grid--2">
      <section className="fc-card">
        <h2 style={{ marginTop: 0 }}>{editing ? 'Editar meta' : 'Nova meta'}</h2>
        <form onSubmit={onSubmit}>
          <div className="fc-field">
            <span>Título</span>
            <input className="fc-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="fc-field">
            <span>Modo</span>
            <select className="fc-select" value={mode} onChange={(e) => setMode(e.target.value as 'saving' | 'limit')}>
              <option value="saving">Economia (saldo do mês)</option>
              <option value="limit">Limite de gastos</option>
            </select>
          </div>
          <div className="fc-field">
            <span>Valor alvo</span>
            <input className="fc-input" inputMode="decimal" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="fc-btn fc-btn--primary">
              {editing ? 'Salvar' : 'Criar'}
            </button>
            {editing ? (
              <button type="button" className="fc-btn fc-btn--ghost" onClick={reset}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="fc-card">
        <h2 style={{ marginTop: 0 }}>Metas ativas</h2>
        {!goals.length ? (
          <div className="fc-empty">Nenhuma meta.</div>
        ) : (
          goals.map((g) => {
            const currentValue = g.mode === 'saving' ? Math.max(0, month.net) : month.expense;
            const progress = g.targetAmount > 0 ? Math.min(100, (currentValue / g.targetAmount) * 100) : 0;
            return (
              <article key={g.id} className="fc-data-row">
                <div className="fc-data-row__main">
                  <div>
                    <span className="fc-inline-label">{g.mode === 'saving' ? 'Economia' : 'Limite'}</span>
                    <h3 style={{ margin: '4px 0' }}>{g.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--fc-muted)' }}>
                      {g.mode === 'saving' ? 'Economizado' : 'Gasto no mês'}: {formatCurrency(currentValue)} de{' '}
                      {formatCurrency(g.targetAmount)}
                    </p>
                  </div>
                  <strong>{Math.round(progress)}%</strong>
                </div>
                <div className="fc-progress" aria-hidden>
                  <span style={{ width: `${Math.max(progress, 4)}%` }} />
                </div>
                <div className="fc-data-row__actions">
                  <button type="button" className="fc-btn fc-btn--ghost fc-btn--sm" onClick={() => startEdit(g)}>
                    Editar
                  </button>
                  <button type="button" className="fc-btn fc-btn--danger fc-btn--sm" onClick={() => remove(g)}>
                    Remover
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
