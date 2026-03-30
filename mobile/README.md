# FinControl Mobile

Aplicativo mobile do FinControl construído com `Expo` e `React Native`.

## O que já está pronto

- fluxo de boas-vindas, login e cadastro
- navegação autenticada com foco mobile
- visão geral com resumo financeiro e atalhos rápidos
- contas com cadastro, edição e inativação
- categorias com cadastro, edição e exclusão
- lançamentos com cadastro, edição, exclusão, busca e filtros
- metas com cadastro, edição e exclusão
- relatórios mobile com leitura visual consolidada
- integração com a mesma API usada pelo painel web
- arquivo central de strings em pt-BR para manter a linguagem consistente

## Como rodar

```bash
cd mobile
npm install
npm run start
```

## Dica de API local

- Android Emulator: `http://10.0.2.2:3333`
- iOS Simulator: `http://localhost:3333`
- celular físico: use o IP da sua máquina na rede local

Você pode alterar a URL da API dentro de `Configurações`.
