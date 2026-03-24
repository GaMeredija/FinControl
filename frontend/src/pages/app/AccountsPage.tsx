import { apiFetch } from '@/api/fetcher';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDateTime, getErrorMessage } from '@/lib/format';
import { getOrderedAccounts } from '@/lib/finance';
import { accountTypeLabels } from '@/lib/constants';
import type { Account, AccountType, ApiEnvelope } from '@/types/api';
import { useState, type FormEvent } from 'react';

export function AccountsPage() {
  const {
    apiUrl,
    token,
    accounts,
    transactions,
    includeInactiveAccounts,
    setIncludeInactiveAccounts,
    fetchAccounts,
    fetchReports,
  } = useApp();
  const { push } = useToast();

  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalance, setInitialBalance] = useState('');

  const ordered = getOrderedAccounts(accounts, transactions);
  const visible = includeInactiveAccounts
    ? ordered
    : ordered.filter((a) => a.isActive);

  function startEdit(a: Account) {
    setEditing(a);
    setName(a.name);
    setType(a.type);
    setInitialBalance(String(a.initialBalance));
  }

  function resetForm() {
    setEditing(null);
    setName('');
    setType('checking');
    setInitialBalance('');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      return;
    }
    const payload = {
      name: name.trim(),
      type,
      initialBalance: Number(String(initialBalance).replace(',', '.')),
    };
    try {
      if (editing) {
        const res = await apiFetch<ApiEnvelope<unknown>>(
          apiUrl,
          `/accounts/${editing.id}`,
          { method: 'PUT', token, jsonBody: payload },
        );
        push(res.message, 'success');
      } else {
        const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, '/accounts', {
          method: 'POST',
          token,
          jsonBody: payload,
        });
        push(res.message, 'success');
      }
      resetForm();
      await fetchAccounts({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  async function inactivate(a: Account) {
    if (!token || !window.confirm(`Inativar a conta "${a.name}"?`)) {
      return;
    }
    try {
      const res = await apiFetch<ApiEnvelope<unknown>>(
        apiUrl,
        `/accounts/${a.id}/inactivate`,
        { method: 'PATCH', token },
      );
      push(res.message, 'success');
      await fetchAccounts({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="fc-grid fc-grid--2">
      <section className="fc-card" aria-labelledby="acc-form-title">
        <h2 id="acc-form-title" style={{ marginTop: 0 }}>
          {editing ? 'Editar conta' : 'Nova conta'}
        </h2>
        <form onSubmit={onSubmit}>
          <div className="fc-field">
            <label htmlFor="acc-name">Nome</label>
            <input
              id="acc-name"
              className="fc-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="fc-field">
            <label htmlFor="acc-type">Tipo</label>
            <select
              id="acc-type"
              className="fc-select"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
            >
              {(Object.keys(accountTypeLabels) as AccountType[]).map((k) => (
                <option key={k} value={k}>
                  {accountTypeLabels[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="fc-field">
            <label htmlFor="acc-bal">Saldo inicial</label>
            <input
              id="acc-bal"
              className="fc-input"
              inputMode="decimal"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="fc-btn fc-btn--primary">
              {editing ? 'Salvar alterações' : 'Salvar conta'}
            </button>
            {editing ? (
              <button type="button" className="fc-btn fc-btn--ghost" onClick={resetForm}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="fc-card" aria-labelledby="acc-list-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 id="acc-list-title" style={{ margin: 0 }}>
            Suas contas
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={includeInactiveAccounts}
                onChange={(e) => {
                  const v = e.target.checked;
                  setIncludeInactiveAccounts(v);
                  void fetchAccounts({ silent: true, includeInactive: v });
                }}
              />
              Incluir inativas
            </label>
            <button type="button" className="fc-btn fc-btn--ghost fc-btn--sm" onClick={() => fetchAccounts()}>
              Atualizar
            </button>
          </div>
        </div>

        {!visible.length ? (
          <div className="fc-empty" style={{ marginTop: 16 }}>
            Nenhuma conta cadastrada.
          </div>
        ) : (
          visible.map((a) => (
            <article key={a.id} className={`fc-data-row${a.isActive ? '' : ' is-muted'}`}>
              <div className="fc-data-row__main">
                <div>
                  <span className="fc-inline-label">{accountTypeLabels[a.type] ?? a.type}</span>
                  <h3 style={{ margin: '4px 0' }}>{a.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--fc-muted)' }}>
                    Criada em {formatDateTime(a.createdAt)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.15rem' }}>{formatCurrency(a.currentBalance)}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--fc-muted)' }}>Saldo atual</div>
                </div>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--fc-muted)' }}>
                Saldo inicial {formatCurrency(a.initialBalance)} · {a.isActive ? 'Ativa' : 'Inativa'}
              </p>
              <div className="fc-data-row__actions">
                <button type="button" className="fc-btn fc-btn--ghost fc-btn--sm" onClick={() => startEdit(a)}>
                  Editar
                </button>
                {a.isActive ? (
                  <button type="button" className="fc-btn fc-btn--danger fc-btn--sm" onClick={() => inactivate(a)}>
                    Inativar
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
