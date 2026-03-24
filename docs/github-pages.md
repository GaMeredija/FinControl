# Publicar O Frontend No GitHub Pages

O GitHub Pages publica apenas a interface web. Neste projeto, o frontend ja ficou preparado para funcionar online em dois modos:

- `demo web`: roda direto no navegador usando localStorage
- `api real`: usa um backend publicado externamente

## O que ja ficou pronto no projeto

- workflow automatico em `.github/workflows/deploy-pages.yml`
- frontend preparado para GitHub Pages com `HashRouter` em producao
- modo demo local no navegador por padrao em producao
- suporte a `VITE_API_URL` para apontar para a API publicada

## 1. Suba o repositorio para o GitHub

Se ainda nao subiu:

```powershell
git add .
git commit -m "feat: prepare github pages deployment"
git remote add origin https://github.com/seu-usuario/fincontrol.git
git branch -M main
git push -u origin main
```

## 2. Entenda o comportamento padrao

Se voce nao configurar nenhuma variavel de ambiente no GitHub, o site sera publicado em `modo demo`.

Nesse modo, ja vai funcionar:

- landing page
- login
- cadastro
- contas
- categorias
- lancamentos
- metas
- relatorios

Credenciais demo padrao:

- `demo@fincontrol.app`
- `123456`

## 3. Opcional: publique o backend em algum provedor

Exemplos:

- Render
- Railway
- Fly.io
- VPS propria

Quando o backend estiver online, copie a URL final, por exemplo:

- `https://fincontrol-api.onrender.com`

## 4. Opcional: configure a URL da API no GitHub

No repositrio do GitHub:

1. Abra `Settings`
2. Abra `Secrets and variables`
3. Abra `Actions`
4. Aba `Variables`
5. Clique em `New repository variable`

Crie:

- Nome: `VITE_API_URL`
- Valor: `https://fincontrol-api.onrender.com`

Se essa variavel existir, o frontend publicado vai usar a API real em vez do modo demo.

## 5. Ative o GitHub Pages

No repositrio:

1. Abra `Settings`
2. Abra `Pages`
3. Em `Source`, selecione `GitHub Actions`

## 6. Dispare a publicacao

Ao fazer push na branch `main`, o workflow publica automaticamente. Se preferir, tambem pode abrir a aba `Actions` e rodar manualmente o workflow `Deploy Frontend To GitHub Pages`.

## 7. Acesse o site

A URL costuma ficar assim:

- `https://seu-usuario.github.io/fincontrol/`

Como o projeto usa `HashRouter` em producao, as telas internas vao aparecer nesse formato:

- `https://seu-usuario.github.io/fincontrol/#/login`
- `https://seu-usuario.github.io/fincontrol/#/app/overview`

## Se aparecer a interface, mas a API nao responder

Isso significa que:

- o frontend foi publicado corretamente e voce tentou usar uma API externa
- a URL em `VITE_API_URL` esta errada, ou
- o backend ainda nao foi publicado, ou
- o backend nao liberou CORS para o dominio do GitHub Pages

## CORS no backend

Se precisar, o backend deve aceitar requisicoes vindas do dominio:

- `https://seu-usuario.github.io`

## Resumo

- GitHub Pages publica o frontend
- sem `VITE_API_URL`, o site funciona em modo demo
- com `VITE_API_URL`, o site passa a usar o backend hospedado
