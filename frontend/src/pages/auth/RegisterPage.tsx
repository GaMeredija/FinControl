import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getErrorMessage } from '@/lib/format';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function RegisterPage() {
  usePageTitle('Cadastro');
  const { register, busy } = useApp();
  const { push } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '');
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');
    try {
      await register(name, email, password);
      push('Conta criada com sucesso.', 'success');
      navigate('/app/overview', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      push(msg, 'error');
    }
  }

  return (
    <div className="fc-auth__card">
      <p className="fc-auth__eyebrow">Cadastro</p>
      <h1>Criar conta</h1>
      <p className="fc-auth__lead">
        Abra o acesso e depois entre normalmente pela tela de login.
      </p>

      {error ? (
        <p role="alert" className="fc-auth__lead" style={{ color: 'var(--fc-danger)' }}>
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit}>
        <div className="fc-field">
          <label htmlFor="reg-name">Nome</label>
          <input
            id="reg-name"
            name="name"
            className="fc-input"
            required
            minLength={2}
            autoComplete="name"
          />
        </div>
        <div className="fc-field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className="fc-input"
            required
            autoComplete="email"
          />
        </div>
        <div className="fc-field">
          <label htmlFor="reg-password">Senha</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            className="fc-input"
            required
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="fc-btn fc-btn--primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Criando...' : 'Criar conta'}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to="/login" className="fc-link">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
