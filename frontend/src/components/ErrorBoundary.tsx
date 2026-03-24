import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? String(error) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FinControl:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: 32,
            fontFamily: 'system-ui, sans-serif',
            background: '#f3f4f6',
            color: '#111',
          }}
        >
          <h1 style={{ marginTop: 0 }}>Algo correu mal ao carregar o FinControl</h1>
          <p>Abra o console do navegador (F12) para ver o erro completo.</p>
          <pre
            style={{
              padding: 16,
              background: '#fff',
              borderRadius: 8,
              overflow: 'auto',
              border: '1px solid #ddd',
            }}
          >
            {this.state.message}
          </pre>
          <p>
            <button type="button" onClick={() => window.location.reload()}>
              Recarregar pagina
            </button>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
