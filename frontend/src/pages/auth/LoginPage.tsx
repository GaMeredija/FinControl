import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getErrorMessage } from '@/lib/format';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  usePageTitle('Entrar');
  const { login, busy } = useApp();
  const { push } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');
    try {
      await login(email, password);
      push('Sessão iniciada.', 'success');
      navigate('/app/overview', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      push(msg, 'error');
    }
  }

  return (
    <div className="fc-auth__card">
      <p className="fc-auth__eyebrow">Acesso</p>
      <h1>Entrar no painel</h1>
      <p className="fc-auth__lead">
        Use o email e a senha cadastrados na API FinControl.
      </p>

      {error ? (
        <p role="alert" className="fc-auth__lead" style={{ color: 'var(--fc-danger)' }}>
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit}>
        <div className="fc-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            className="fc-input"
            required
            autoComplete="email"
            placeholder="nome@email.com"
          />
        </div>
        <div className="fc-field">
          <label htmlFor="login-password">Senha</label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="fc-input"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="fc-btn fc-btn--primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to="/register" className="fc-link">
          Criar nova conta
        </Link>
      </p>
    </div>
  );
}
