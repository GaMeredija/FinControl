# Frontend FinControl

Interface em **React 19 + Vite 6 + TypeScript**, com **React Router 7** para rotas nomeadas, tema claro/escuro e integracao com a mesma API REST do backend.

## Rotas

| Rota | Descricao |
|------|-----------|
| `/login` | Entrada (ecra dedicado) |
| `/register` | Cadastro (ecra dedicado) |
| `/app/overview` | Visao geral |
| `/app/accounts` | Contas |
| `/app/categories` | Categorias |
| `/app/transactions` | Lancamentos |
| `/app/goals` | Metas |
| `/app/reports` | Relatorios |
| `/app/settings` | Configuracoes e perfil |

`/` abre a landing page inicial. A partir dela, o utilizador segue para login ou para o painel.

## LocalStorage (compativel com a versao anterior)

- `fincontrol.auth.token`
- `fincontrol.api-url`
- `fincontrol.theme`

## Comandos

```powershell
npm install
npm run dev
```

Build de producao:

```powershell
npm run build
npm run preview
```

Teste de fumaca (compila e valida `dist`):

```powershell
npm run test:smoke
```

## Docker

O `Dockerfile` faz build da SPA e serve com **nginx** (fallback para `index.html` para o router).

## GitHub Pages

O frontend ja esta preparado para publicacao no GitHub Pages via workflow em `.github/workflows/deploy-pages.yml`.

Sem nenhuma configuracao adicional, o site publicado entra em `modo demo` no navegador e fica utilizavel com:

- email: `demo@fincontrol.app`
- senha: `123456`

Para o site funcionar online com dados reais:

- publique o backend separadamente
- configure a variavel `VITE_API_URL` no repositorio do GitHub

Exemplo de `.env` local:

```env
VITE_API_URL="https://seu-backend-publicado.onrender.com"
```

Detalhes completos em `docs/github-pages.md`.

## Estrutura `src/`

- `api/` — cliente HTTP
- `components/` — layout, barras, guards de rota
- `context/` — estado global (sessao, tema, API) e toasts
- `hooks/` — titulo da pagina, foco ao navegar
- `lib/` — formatacao, calculos financeiros, constantes
- `pages/app/*` — modulos autenticados
- `pages/auth/*` — login e registo
