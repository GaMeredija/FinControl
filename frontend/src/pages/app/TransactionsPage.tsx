import { apiFetch } from '@/api/fetcher';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, getErrorMessage, nowDateInputValue } from '@/lib/format';
import { getFilteredTransactions, getOrderedAccounts } from '@/lib/finance';
import type { ApiEnvelope, Transaction } from '@/types/api';
import { useEffect, useState, type FormEvent } from 'react';

export function TransactionsPage() {
  const {
    apiUrl,
    token,
    accounts,
    categories,
    transactions,
    fetchTransactions,
    fetchAccounts,
    fetchReports,
  } = useApp();
  const { push } = useToast();

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(nowDateInputValue());
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | 'income' | 'expense'>('all');

  const orderedAccounts = getOrderedAccounts(accounts, transactions);
  const catsForKind = categories.filter((c) => c.kind === kind);

  useEffect(() => {
    if (!orderedAccounts.length) {
      setAccountId('');
    } else if (!orderedAccounts.some((a) => a.id === accountId)) {
      setAccountId(orderedAccounts[0].id);
    }
  }, [orderedAccounts, accountId]);

  useEffect(() => {
    if (!catsForKind.length) {
      setCategoryId('');
    } else if (!catsForKind.some((c) => c.id === categoryId)) {
      setCategoryId(catsForKind[0].id);
    }
  }, [catsForKind, categoryId]);

  function startEdit(t: Transaction) {
    setEditing(t);
    setDescription(t.description);
    setKind(t.kind);
    setAmount(String(t.amount));
    setAccountId(t.accountId);
    setCategoryId(t.categoryId);
    setTransactionDate(t.transactionDate.slice(0, 10));
    setNotes(t.notes ?? '');
  }

  function reset() {
    setEditing(null);
    setDescription('');
    setKind('expense');
    setAmount('');
    setTransactionDate(nowDateInputValue());
    setNotes('');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      return;
    }
    const payload = {
      description: description.trim(),
      kind,
      amount: Number(String(amount).replace(',', '.')),
      accountId,
      categoryId,
      transactionDate,
      notes: notes.trim(),
    };
    if (!payload.description || !payload.accountId || !payload.categoryId || !payload.transactionDate) {
      push('Preencha os campos obrigatórios.', 'error');
      return;
    }
    if (payload.amount <= 0) {
      push('Valor deve ser maior que zero.', 'error');
      return;
    }
    try {
      if (editing) {
        const res = await apiFetch<ApiEnvelope<unknown>>(
          apiUrl,
          `/transactions/${editing.id}`,
          { method: 'PUT', token, jsonBody: payload },
        );
        push(res.message, 'success');
      } else {
        const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, '/transactions', {
          method: 'POST',
          token,
          jsonBody: payload,
        });
        push(res.message, 'success');
      }
      reset();
      await fetchTransactions({ silent: true });
      await fetchAccounts({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  async function remove(t: Transaction) {
    if (!token) {
      return;
    }
    try {
      const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, `/transactions/${t.id}`, {
        method: 'DELETE',
        token,
      });
      push(res.message, 'success');
      await fetchTransactions({ silent: true });
      await fetchAccounts({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  const filtered = getFilteredTransactions(transactions, categories, search, kindFilter);

  if (!accounts.length || !categories.length) {
    return (
      <div className="fc-card">
        <div className="fc-empty">Cadastre ao menos uma conta e uma categoria para lançar.</div>
      </div>
    );
  }

  const formDisabled = !orderedAccounts.length || !catsForKind.length;

  return (
    <div className="fc-grid fc-grid--2">
      <section className="fc-card">
        <h2 style={{ marginTop: 0 }}>{editing ? 'Editar lançamento' : 'Novo lançamento'}</h2>
        <form onSubmit={onSubmit}>
          <div className="fc-field">
            <span>Descricao</span>
            <input
              className="fc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={formDisabled}
              required
            />
          </div>
          <div className="fc-field">
            <span>Tipo</span>
            <select
              className="fc-select"
              value={kind}
              onChange={(e) => setKind(e.target.value as 'income' | 'expense')}
              disabled={formDisabled}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div className="fc-field">
            <span>Valor</span>
            <input
              className="fc-input"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={formDisabled}
              required
            />
          </div>
          <div className="fc-field">
            <span>Conta</span>
            <select
              className="fc-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={formDisabled}
            >
              {orderedAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {!a.isActive ? ' (inativa)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="fc-field">
            <span>Categoria</span>
            <select
              className="fc-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={formDisabled}
            >
              {catsForKind.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="fc-field">
            <span>Data</span>
            <input
              className="fc-input"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              disabled={formDisabled}
              required
            />
          </div>
          <div className="fc-field">
            <span>Observações</span>
            <textarea className="fc-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={formDisabled} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="fc-btn fc-btn--primary" disabled={formDisabled}>
              {editing ? 'Salvar' : 'Lançar'}
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
        <h2 style={{ marginTop: 0 }}>Histórico</h2>
        <div className="fc-field" style={{ marginBottom: 12 }}>
          <span>Busca</span>
          <input className="fc-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Descricao, notas, categoria…" />
        </div>
        <div className="fc-field" style={{ marginBottom: 16 }}>
          <span>Filtro</span>
          <select className="fc-select" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}>
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>

        {!filtered.length ? (
          <div className="fc-empty">Nenhum lançamento para os filtros.</div>
        ) : (
          filtered.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            const acc = accounts.find((a) => a.id === t.accountId);
            return (
              <article key={t.id} className="fc-data-row">
                <div className="fc-data-row__main">
                  <div>
                    <span className="fc-inline-label">{t.kind === 'income' ? 'Receita' : 'Despesa'}</span>
                    <h3 style={{ margin: '4px 0' }}>{t.description}</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--fc-muted)' }}>
                      {cat?.name ?? '—'} · {acc?.name ?? '—'} · {t.transactionDate}
                    </p>
                    {t.notes ? (
                      <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{t.notes}</p>
                    ) : null}
                  </div>
                  <strong className={t.kind === 'income' ? 'fc-tag-pos' : 'fc-tag-neg'}>
                    {t.kind === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </strong>
                </div>
                <div className="fc-data-row__actions">
                  <button type="button" className="fc-btn fc-btn--ghost fc-btn--sm" onClick={() => startEdit(t)}>
                    Editar
                  </button>
                  <button type="button" className="fc-btn fc-btn--danger fc-btn--sm" onClick={() => remove(t)}>
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
