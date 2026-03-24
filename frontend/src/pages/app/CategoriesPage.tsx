import { apiFetch } from '@/api/fetcher';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/format';
import type { ApiEnvelope, Category } from '@/types/api';
import { useMemo, useState, type FormEvent } from 'react';

export function CategoriesPage() {
  const { apiUrl, token, categories, transactions, fetchCategories, fetchReports } = useApp();
  const { push } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#147a68');

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  function startEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setKind(c.kind);
    setColor(c.color || '#147a68');
  }

  function reset() {
    setEditing(null);
    setName('');
    setKind('expense');
    setColor('#147a68');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      return;
    }
    const payload = { name: name.trim(), kind, color };
    if (!payload.name) {
      push('Informe o nome da categoria.', 'error');
      return;
    }

    try {
      if (editing) {
        const usage = transactions.filter((t) => t.categoryId === editing.id);
        if (usage.length && editing.kind !== kind) {
          push('Não altere o tipo de uma categoria com lançamentos.', 'error');
          return;
        }
        const res = await apiFetch<ApiEnvelope<unknown>>(
          apiUrl,
          `/categories/${editing.id}`,
          { method: 'PUT', token, jsonBody: payload },
        );
        push(res.message, 'success');
      } else {
        const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, '/categories', {
          method: 'POST',
          token,
          jsonBody: payload,
        });
        push(res.message, 'success');
      }
      reset();
      await fetchCategories({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  async function remove(c: Category) {
    if (transactions.some((t) => t.categoryId === c.id)) {
      push('Categoria vinculada a lançamentos não pode ser removida.', 'error');
      return;
    }
    if (!token || !window.confirm(`Remover "${c.name}"?`)) {
      return;
    }
    try {
      const res = await apiFetch<ApiEnvelope<unknown>>(apiUrl, `/categories/${c.id}`, {
        method: 'DELETE',
        token,
      });
      push(res.message, 'success');
      await fetchCategories({ silent: true });
      await fetchReports({ silent: true });
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="fc-grid fc-grid--2">
      <section className="fc-card">
        <h2 style={{ marginTop: 0 }}>{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
        <form onSubmit={onSubmit}>
          <div className="fc-field">
            <span>Nome</span>
            <input className="fc-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="fc-field">
            <span>Tipo</span>
            <select className="fc-select" value={kind} onChange={(e) => setKind(e.target.value as 'income' | 'expense')}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div className="fc-field">
            <span>Cor</span>
            <input className="fc-input" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
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
        <h2 style={{ marginTop: 0 }}>Lista</h2>
        {!sorted.length ? (
          <div className="fc-empty">Nenhuma categoria.</div>
        ) : (
          sorted.map((c) => {
            const usage = transactions.filter((t) => t.categoryId === c.id).length;
            return (
              <article key={c.id} className="fc-data-row">
                <div className="fc-data-row__main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        background: c.color,
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                    <div>
                      <h3 style={{ margin: 0 }}>{c.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--fc-muted)' }}>
                        {c.kind === 'income' ? 'Receita' : 'Despesa'}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{usage}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--fc-muted)' }}>usos</div>
                  </div>
                </div>
                <div className="fc-data-row__actions">
                  <button type="button" className="fc-btn fc-btn--ghost fc-btn--sm" onClick={() => startEdit(c)}>
                    Editar
                  </button>
                  <button type="button" className="fc-btn fc-btn--danger fc-btn--sm" onClick={() => remove(c)}>
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
