# Grupo Fagundes Miari — Fazenda Admin v7

Sistema local de gestão rural com modos Café e Gado.

## Acesso principal
- CEO: `jacquesMiari` / `05091722`
- ADM: `adm` / `ADM123`
- Contribuinte de demonstração: `campo` / `CAFE123`

## Novidades da v4
- CEO cria e exclui fazendas sem limite fixo.
- Cada fazenda pode ser Café ou Gado.
- Café: tratores, implementos, estoque, cotação por saca, financeiro, notas.
- Gado: lotes, quantidade de cabeças, pesagens, média em kg, arrobas totais e média @/animal.
- Cadastro rápido de contribuinte na página inicial: nome, função opcional, chave PIX opcional, usuário e senha.
- CEO envia comprovantes de pagamento individualmente; somente o usuário destinatário vê o comprovante.
- CEO administra logins, senhas, bloqueios e exclusões.
- Balanço com gráfico de entradas, gastos e resultado.

## Executar
```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Importante
É um protótipo local. Dados, senhas e anexos ficam no navegador (localStorage). Arquivos de comprovante são limitados a 1 MB. Para uso real, migre autenticação, banco de dados e arquivos para o servidor com senhas protegidas por hash e backups.


## Correção v7 - Usuários
- Corrigido erro de sintaxe no bloco de ícones SVG que impedia a execução correta do JavaScript e a abertura da aba Usuários.
- Mantidas as funções de criação, aprovação de solicitações, senha, ativação, bloqueio e exclusão de usuários.

## Limpeza de nomes internos
- Removidas referências antigas de nomenclatura do código.
- Pacote e chaves internas agora usam nomenclatura de Fazenda.


## v12
- Função obrigatória para contribuinte: Tratorista ou Campo.
- Talhões gerenciados pelo CEO por fazenda de café.
- Contribuinte seleciona um ou mais talhões no trabalho do dia.
- Log de equipamentos registra função e talhões.
