# Banco de dados

O projeto funciona hoje em dois modos de persistencia:

- `json`: modo padrao para desenvolvimento rapido e testes locais
- `prisma`: modo opcional para rodar com PostgreSQL

## Modo JSON

Nao exige servico externo.

Arquivos usados:

- `backend/data/users.json`
- `backend/data/accounts.json`
- `backend/data/categories.json`
- `backend/data/transactions.json`
- `backend/data/goals.json`

## Modo PostgreSQL com Prisma

### 1. Subir o banco

Na raiz do projeto:

```powershell
docker compose up -d
```

### 2. Ajustar o backend

Em `backend/.env`:

```env
DATA_PROVIDER="prisma"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/fincontrol?schema=public"
```

### 3. Gerar e aplicar o schema

Dentro de `backend`:

```powershell
cmd /c npm run db:generate
cmd /c npm run db:push
```

### 4. Migrar os dados atuais em JSON para o banco

Opcional:

```powershell
cmd /c npm run db:seed:json
```

### 5. Validar o backend em modo Prisma

```powershell
.\scripts\test-backend-prisma.ps1
```

## Opcional no Windows sem Docker

Se voce optar por usar os binarios locais do PostgreSQL, os atalhos sao:

```powershell
.\scripts\start-local-postgres.ps1
.\scripts\stop-local-postgres.ps1
```

## Observacao

A camada Prisma foi preparada para conviviver com a implementacao atual. Se `DATA_PROVIDER` estiver em `json`, o sistema continua operando como antes. Se estiver em `prisma`, os repositorios passam a usar o PostgreSQL.
