# Requisitos

## Requisitos funcionais

- `RF01`: O sistema deve permitir cadastro de usuario com nome, email e senha.
- `RF02`: O sistema deve permitir login e logout.
- `RF03`: O sistema deve proteger rotas privadas por autenticacao.
- `RF04`: O usuario deve conseguir cadastrar contas financeiras.
- `RF05`: O usuario deve conseguir editar, listar e inativar contas financeiras.
- `RF06`: O usuario deve conseguir cadastrar categorias de receita e despesa.
- `RF07`: O usuario deve conseguir editar, listar e inativar categorias.
- `RF08`: O usuario deve conseguir registrar receitas.
- `RF09`: O usuario deve conseguir registrar despesas.
- `RF10`: O usuario deve conseguir editar, listar e remover lancamentos.
- `RF11`: O usuario deve conseguir filtrar lancamentos por periodo, conta, categoria e tipo.
- `RF12`: O sistema deve apresentar dashboard com saldo total, receitas do mes e despesas do mes.
- `RF13`: O sistema deve apresentar os ultimos lancamentos do usuario.
- `RF14`: O sistema deve apresentar distribuicao de gastos por categoria no periodo selecionado.

## Requisitos nao funcionais

- `RNF01`: A aplicacao deve utilizar autenticacao segura com senha criptografada.
- `RNF02`: A API deve seguir padrao REST com respostas em JSON.
- `RNF03`: O sistema deve ser responsivo para desktop e celular.
- `RNF04`: O codigo deve ser organizado por modulos de negocio.
- `RNF05`: A base de dados deve garantir integridade referencial.
- `RNF06`: As operacoes principais devem responder em tempo adequado para uso cotidiano.

## Regras de negocio

- `RN01`: Cada usuario so pode acessar seus proprios dados.
- `RN02`: Categoria de receita nao pode ser usada em despesa e vice-versa.
- `RN03`: Todo lancamento deve estar vinculado a uma conta e a uma categoria valida.
- `RN04`: O saldo exibido deve ser calculado com base no saldo inicial da conta e nos lancamentos confirmados.
- `RN05`: Despesas devem impactar o saldo com sinal negativo.
- `RN06`: Receitas devem impactar o saldo com sinal positivo.
- `RN07`: Contas ou categorias inativas nao devem aparecer como opcao em novos lancamentos.

## Backlog priorizado do MVP

1. Autenticacao
2. Contas financeiras
3. Categorias
4. Lancamentos
5. Dashboard

## Itens fora do MVP

- Parcelamento
- Lancamentos recorrentes
- Exportacao PDF/CSV
- Notificacoes
- Integracao com banco
- Metas avancadas por categoria

