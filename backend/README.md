# Backend

API do FinControl com autenticacao, regras de negocio e suporte opcional a banco relacional.

## Modulos prontos

- auth
- accounts
- categories
- transactions
- goals
- reports

## Persistencia

O backend funciona em dois modos:

- `json`: padrao atual para desenvolvimento rapido
- `prisma`: opcional para PostgreSQL

Variaveis principais em `backend/.env`:

```env
DATA_PROVIDER="json"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fincontrol?schema=public"
```

## Comandos

```powershell
cmd /c npm run dev
cmd /c npm run build
cmd /c npm run test:smoke
cmd /c npm run test:prisma
cmd /c npm run db:generate
cmd /c npm run db:validate
cmd /c npm run db:push
cmd /c npm run db:seed:json
```

## Endpoints disponiveis

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/profile`
- `GET /accounts`
- `POST /accounts`
- `PUT /accounts/:id`
- `PATCH /accounts/:id/inactivate`
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `GET /transactions`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /goals`
- `POST /goals`
- `PUT /goals/:id`
- `DELETE /goals/:id`
- `GET /reports/summary`

## Teste rapido

Na raiz do projeto:

```powershell
.\scripts\test-backend.ps1
.\scripts\test-backend-prisma.ps1
```

## Observacao

Os testes de fumaca continuam isolados no modo `json`, para validar a API sem depender de um PostgreSQL rodando.

## GitHub Pages e CORS

Se o frontend for publicado no GitHub Pages, o backend precisa liberar a origem do site em `CORS_ORIGIN`.

Exemplo:

```env
CORS_ORIGIN="http://localhost:5173,https://seu-usuario.github.io"
```
