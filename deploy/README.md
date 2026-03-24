# Deploy

O repositorio ficou preparado para dois tipos de entrega:

- frontend estatico
- backend Node.js com suporte a Prisma/PostgreSQL

## O que ja esta pronto

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `backend/.env.example`
- `database/README.md`

## Backend

Variaveis minimas:

```env
PORT=3333
JWT_SECRET="sua-chave-forte"
CORS_ORIGIN="https://seu-frontend"
DATA_PROVIDER="prisma"
DATABASE_URL="postgresql://usuario:senha@host:5432/fincontrol?schema=public"
```

Build:

```powershell
cmd /c npm install
cmd /c npm run db:generate
cmd /c npm run build
```

Start:

```powershell
cmd /c npm run start
```

## Frontend

O frontend pode ser publicado como site estatico em:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Defina a URL da API no proprio painel, no campo `API URL`.

## Observacao

Eu deixei a estrutura pronta para deploy, mas o deploy publico em provedor externo ainda depende de conta, credenciais e escolha do servico.
