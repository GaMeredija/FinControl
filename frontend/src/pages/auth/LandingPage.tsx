import { useApp } from '@/context/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from 'react-router-dom';

export function LandingPage() {
  usePageTitle('Início');
  const { user } = useApp();

  return (
    <section className="fc-landing" aria-labelledby="fc-landing-title">
      <p className="fc-landing__eyebrow">Sistema financeiro pessoal</p>
      <h1 id="fc-landing-title">FinControl</h1>
      <p className="fc-landing__lead">
        Organize contas, categorias, lançamentos, metas e relatórios em um único
        ambiente.
      </p>
      <div className="fc-landing__actions">
        <Link
          to={user ? '/app/overview' : '/login'}
          className="fc-btn fc-btn--primary fc-landing__button"
        >
          Acessar
        </Link>
        {!user ? (
          <Link to="/register" className="fc-link fc-landing__secondary">
            Criar conta
          </Link>
        ) : null}
      </div>
    </section>
  );
}
