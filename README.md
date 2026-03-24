# FinControl

Sistema de controle financeiro pessoal pensado para portfolio de ADS, com fluxo completo de autenticacao, organizacao financeira e relatorios.

## O que o projeto entrega hoje

- login, cadastro e perfil editavel
- contas financeiras
- categorias
- lancamentos
- metas
- relatorios e visao geral consolidados
- tema claro e escuro
- frontend separado da tela de login
- backend com regras de negocio e testes de fumaca

## Stack atual

- frontend: React, Vite, TypeScript e React Router (SPA)
- backend: Node.js, Express e TypeScript
- autenticacao: JWT com senha criptografada
- persistencia atual: JSON local
- persistencia opcional: Prisma + PostgreSQL

## Estrutura do repositorio

- `docs/`: documentacao funcional e tecnica
- `database/`: modelagem SQL e guia do banco
- `frontend/`: interface administrativa do sistema
- `backend/`: API, autenticacao e regras de negocio
- `scripts/`: atalhos PowerShell para iniciar e validar o projeto

## Como rodar

### Validar tudo

```powershell
.\scripts\test-project.ps1
```

### Subir backend

```powershell
.\scripts\start-backend.ps1
```

### Subir frontend

```powershell
.\scripts\start-frontend.ps1
```

Depois abra:

- `http://localhost:5173`

## Endpoints principais

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

## Persistencia

### Modo padrao

O projeto roda com `DATA_PROVIDER="json"` e salva os dados em `backend/data`.

### Modo opcional profissional

Tambem esta preparado para `Prisma + PostgreSQL`.

Passos:

1. Subir o PostgreSQL com `docker compose up -d`
2. Ajustar `backend/.env` para `DATA_PROVIDER="prisma"`
3. Rodar dentro de `backend`:

```powershell
cmd /c npm run db:generate
cmd /c npm run db:push
```

4. Se quiser migrar os dados atuais em JSON:

```powershell
cmd /c npm run db:seed:json
```

Para validar o backend no modo relacional:

```powershell
.\scripts\test-backend-prisma.ps1
```

Detalhes em `database/README.md` e `deploy/README.md`.

## Referencias do projeto

- `docs/03-requisitos.md`
- `docs/04-modelagem.md`
- `docs/05-arquitetura-api.md`
- `docs/github-upload.md`
- `docs/github-pages.md`
- `database/schema.sql`
