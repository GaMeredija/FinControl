# Publicar No GitHub

Este projeto ja foi higienizado para subir ao GitHub:

- arquivos `backend/data/*.json` estao vazios
- `.env` e artefatos locais ficam fora do versionamento
- `.gitattributes` foi configurado para evitar problemas de fim de linha no Windows

## 1. Revisar o estado do repositorio

Na raiz do projeto:

```powershell
git status
```

Se quiser validar o projeto antes de publicar:

```powershell
.\scripts\test-project.ps1
```

## 2. Criar o commit inicial

```powershell
git add .
git commit -m "feat: initial FinControl release"
```

## 3. Criar o repositorio no GitHub

Crie um repositorio vazio no GitHub e copie a URL, por exemplo:

- `https://github.com/seu-usuario/fincontrol.git`

## 4. Conectar o repositorio local ao GitHub

Se ainda nao existir `origin`:

```powershell
git remote add origin https://github.com/seu-usuario/fincontrol.git
```

Se ja existir `origin` e voce quiser trocar a URL:

```powershell
git remote set-url origin https://github.com/seu-usuario/fincontrol.git
```

## 5. Publicar a branch principal

```powershell
git branch -M main
git push -u origin main
```

## Observacoes

- Nao publique `backend/.env`; use `backend/.env.example` como modelo.
- Se for usar PostgreSQL no deploy, configure `DATA_PROVIDER="prisma"` e `DATABASE_URL` direto no provedor.
- Se quiser um repositorio com dados de demonstracao, crie exemplos anonimizados antes de commitar.
