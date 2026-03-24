import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/format';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const {
    user,
    apiUrl,
    setApiUrl,
    dataProvider,
    syncAll,
    checkHealth,
    busy,
    updateProfile,
    logout,
  } = useApp();
  const { push } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function onProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const msg = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      push(msg, 'success');
    } catch (err) {
      push(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="fc-grid fc-grid--2">
      <section className="fc-card">
        <h2 style={{ marginTop: 0 }}>Perfil</h2>
        <form onSubmit={onProfile}>
          <div className="fc-field">
            <span>Nome</span>
            <input className="fc-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="fc-field">
            <span>Email</span>
            <input className="fc-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="fc-field">
            <span>Senha atual (se alterar email ou senha)</span>
            <input
              className="fc-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="fc-field">
            <span>Nova senha (opcional)</span>
            <input
              className="fc-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="fc-btn fc-btn--primary">
            Atualizar perfil
          </button>
        </form>
      </section>

      <section className="fc-card">
        <h2 style={{ marginTop: 0 }}>Integracao</h2>
        <p style={{ color: 'var(--fc-muted)', marginTop: 0 }}>
          Persistencia:{' '}
          <strong>
            {dataProvider === 'prisma'
              ? 'PostgreSQL / Prisma'
              : dataProvider === 'json'
                ? 'Arquivos JSON'
                : 'Não identificado'}
          </strong>
        </p>
        <div className="fc-field">
          <span>URL da API</span>
          <input className="fc-input" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="fc-btn fc-btn--ghost"
            disabled={busy}
            onClick={async () => {
              const ok = await checkHealth();
              push(ok ? 'API respondeu.' : 'API offline ou inacessível.', ok ? 'success' : 'error');
            }}
          >
            Testar API
          </button>
          <button
            type="button"
            className="fc-btn fc-btn--primary"
            disabled={busy}
            onClick={async () => {
              await syncAll();
              push('Sincronizacao concluida.', 'success');
            }}
          >
            Sincronizar dados
          </button>
          <button
            type="button"
            className="fc-btn fc-btn--danger"
            onClick={() => {
              logout();
              push('Sessão encerrada.', 'info');
              navigate('/login', { replace: true });
            }}
          >
            Sair e limpar token
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--fc-muted)', marginTop: 16 }}>
          Token, URL da API e tema usam as mesmas chaves de localStorage da versão anterior (fincontrol.*).
        </p>
      </section>
    </div>
  );
}
