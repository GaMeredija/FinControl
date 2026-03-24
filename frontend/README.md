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

`/` redireciona para `/login` ou `/app/overview` conforme a sessao.

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

## Estrutura `src/`

- `api/` — cliente HTTP
- `components/` — layout, barras, guards de rota
- `context/` — estado global (sessao, tema, API) e toasts
- `hooks/` — titulo da pagina, foco ao navegar
- `lib/` — formatacao, calculos financeiros, constantes
- `pages/app/*` — modulos autenticados
- `pages/auth/*` — login e registo
