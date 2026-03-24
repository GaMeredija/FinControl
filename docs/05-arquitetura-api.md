# Arquitetura e API

## Arquitetura recomendada

- `frontend`: React + Vite + TypeScript
- `backend`: Node.js + Express + TypeScript
- `database`: PostgreSQL
- `auth`: JWT

## Implementacao atual

- A Sprint 2 foi iniciada pelo `backend`
- A autenticacao atual usa persistencia local em JSON para evitar bloqueios de ambiente
- A modelagem relacional continua valida para as proximas sprints, quando entrarem contas, categorias e lancamentos

## Estrutura de pastas sugerida

```text
backend/
  src/
    modules/
      auth/
      users/
      accounts/
      categories/
      transactions/
      dashboard/
    shared/
      middlewares/
      errors/
      utils/
frontend/
  src/
    pages/
    components/
    services/
    hooks/
    layouts/
    types/
```

## Fluxo de autenticacao

1. Usuario envia email e senha para `POST /auth/login`
2. API valida credenciais e retorna token
3. Frontend salva token e envia nas rotas privadas
4. Middleware valida o token e injeta o `userId` da sessao

## Endpoints iniciais

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Accounts

- `GET /accounts`
- `POST /accounts`
- `PUT /accounts/:id`
- `PATCH /accounts/:id/inactivate`

### Categories

- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `PATCH /categories/:id/inactivate`

### Transactions

- `GET /transactions`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/expenses-by-category`
- `GET /dashboard/recent-transactions`

## Filtros previstos

### GET /transactions

Query params sugeridos:

- `startDate`
- `endDate`
- `accountId`
- `categoryId`
- `kind`

### GET /dashboard/summary

Query params sugeridos:

- `month`
- `year`

## Padrao de resposta

### Sucesso

```json
{
  "data": {},
  "message": "Operacao realizada com sucesso"
}
```

### Erro

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Os dados enviados sao invalidos"
}
```
