# Gestão Rural v21.3 — nova página inicial

## Novidades da v21.3

- **Nova página inicial em `/`** (`index.html`, `inicio.css`, `inicio.js`): grãos de café reais flutuando em 3D sobre a lavoura desfocada. Ao rolar, a câmera voa entre os grãos, atravessa o título e abre o painel do sistema.
- **Prévia de cada página do sistema** no painel: Visão geral, Mercado, Equipamentos, Talhões, Banho, Estoque, Balanço financeiro, Notas fiscais, Pagamentos, Gado, Fazendas, Usuários, Log equipamentos e Perfil. As abas trocam sozinhas a cada 4 s até o visitante clicar; funcionam com teclado (setas). Todas usam dados de exemplo.
- **Cotação real da saca** no card da página inicial, puxada de `/api/cotacao-cafe`.
- **Compra e criação do Grupo continuam iguais**: `sales.js` não mudou e todos os campos (`planPrice`, `buyerEmail`, `buyButton`, `paymentHint`, `onboarding`) estão na nova página.
- Imagens em `assets/` (lavoura desfocada e três grãos). No celular e para quem desativa animações, a página vira rolagem normal, sem o voo.
- **Tela de login do `/app` e painel do sistema com o tema café** (`theme.css` e `fx.js`): grãos realistas sobre a lavoura escura, botões em alto relevo com grãos, grão no lugar do quadrado "GR", cursor de grão e luz dourada que segue o mouse nos botões. No Balanço financeiro, as barras sobem uma a uma e o resultado de cada mês aparece em cima.
- **Painel da plataforma (`/platform`) com o mesmo tema** (`platform-theme.css`): tela da chave com grãos, botões em relevo, cabeçalho escuro e tabela em tons de café.
- `sales.css` não é mais usado pela página inicial e pode ser apagado.

# Gestão Rural v21.1 — SaaS / Código numérico do Grupo

## Novidades da v21.2

- **Excluir Grupo** em `/platform`: grupos de clientes podem ser apagados definitivamente após digitar o Código do Grupo. O Grupo inicial `1001` fica protegido contra exclusão acidental.
- **Esqueci minha senha** em `/app`: o usuário informa Código do Grupo, usuário e e-mail, recebe um código de 6 dígitos e define uma nova senha.
- Novos usuários agora têm **e-mail obrigatório**; o CEO também pode atualizar o próprio e-mail na aba Perfil.
- O código de recuperação expira (padrão: 10 minutos), aceita no máximo 5 tentativas e invalida as sessões antigas depois da troca.

### Configurar o envio de e-mail

A v21.2 envia o código pela API do **Resend**, sem dependência extra no Node. No Render, adicione:

```text
RESEND_API_KEY=re_xxxxxxxxx
PASSWORD_RESET_FROM=Gestão Rural <acesso@seudominio.com>
PASSWORD_RESET_MINUTES=10
SEED_CEO_EMAIL=seu-email@dominio.com
```

Em produção, `PASSWORD_RESET_FROM` deve usar um remetente/domínio autorizado na sua conta do Resend. O Grupo comprado usa automaticamente o e-mail da assinatura como e-mail inicial do CEO.

Enquanto `TEST_PURCHASE_MODE=true`, a tela de recuperação também mostra/preenche o código de teste, para você validar tudo localmente sem configurar e-mail primeiro. Antes de vender, coloque `TEST_PURCHASE_MODE=false`.


Esta versão transforma a v20 em uma base multiempresa para comercialização do acesso.

## O que mudou

- Página pública de vendas em `/`
- Área do cliente em `/app`
- Cada cliente possui um **Grupo** separado
- Login agora usa **Código do Grupo + usuário + senha**
- O cliente não precisa inventar identificador: o Código do Grupo é numérico e gerado automaticamente
- Dados compartilhados pelo servidor
- PostgreSQL em produção
- Senhas armazenadas com hash (`bcrypt`)
- Sessões no servidor
- Solicitações de registro aparecem para o CEO mesmo se forem feitas em outro celular/computador
- Sincronização automática do painel a cada ~12 segundos
- Migração opcional da v20 local para a nuvem no primeiro login do CEO
- Fluxo comercial: assinatura → confirmação → criação do Grupo → criação do primeiro CEO
- Integração preparada para Mercado Pago Assinaturas
- Webhook de assinatura para atualizar situação do cliente
- A v20 foi preservada: Café, Gado, fazendas, usuários, talhões, estoque, financeiro, notas, pagamentos, equipamentos, log e Banho.

---

## Primeiro acesso do Grupo Fagundes Miari

Por padrão de desenvolvimento:

- Código do Grupo: `1001`
- Grupo: `Grupo Fagundes Miari`
- Usuário: `jacquesmiari`
- Senha: `05091722`

**Antes de colocar em produção, altere `SEED_CEO_PASSWORD` nas variáveis do Render.**

Se o navegador já tiver uma v20, no primeiro login do CEO o sistema pergunta se deseja importar os dados locais para o servidor.

---

# Como publicar no Render

## 1. Suba os arquivos no GitHub

Substitua os arquivos da versão anterior pelos arquivos desta pasta.

## 2. Crie um PostgreSQL no Render

No Render:

1. `New` → `PostgreSQL`
2. Crie o banco
3. Copie a **Internal Database URL**
4. No seu Web Service, crie a variável:

```text
DATABASE_URL=<Internal Database URL>
```

Sem `DATABASE_URL`, o sistema usa `.local-cloud.json` apenas para desenvolvimento. No Render esse arquivo não deve ser usado como banco definitivo, pois o filesystem do serviço pode ser recriado.

## 3. Web Service

Configuração:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
```

## 4. Variáveis recomendadas

Use `.env.example` como referência.

Mínimo para o sistema compartilhado:

```text
NODE_ENV=production
DATABASE_URL=...
PUBLIC_BASE_URL=https://seu-site.onrender.com
SEED_GROUP_SLUG=grupo-fagundes-miari
SEED_GROUP_CODE=1001
SEED_GROUP_NAME=Grupo Fagundes Miari
SEED_CEO_NAME=Jacques Miari
SEED_CEO_USER=jacquesmiari
SEED_CEO_PASSWORD=UMA_SENHA_FORTE
PLATFORM_SETUP_KEY=UMA_CHAVE_GRANDE_E_ALEATORIA
```

---

# Mercado Pago

Para ativar **Comprar acesso** em produção:

```text
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
PLAN_NAME=Gestão Rural Pro
PLAN_PRICE=199.90
PUBLIC_BASE_URL=https://seu-site.onrender.com
```

Se `MERCADOPAGO_PLAN_ID` estiver vazio, o servidor tenta criar e guardar o plano recorrente automaticamente na primeira compra. Se você já criou um plano no Mercado Pago, pode colocar o ID em:

```text
MERCADOPAGO_PLAN_ID=2c9380...
```

### Fluxo implementado

1. Cliente informa o e-mail na página de vendas.
2. O backend cria uma compra interna.
3. O backend cria uma assinatura do plano no Mercado Pago.
4. Cliente é redirecionado ao checkout do Mercado Pago.
5. O `back_url` retorna para o site com o identificador interno da compra.
6. O backend consulta o status real da assinatura no Mercado Pago.
7. Se o status estiver autorizado, aparece o formulário:
   - Nome do Grupo
   - Nome do CEO
   - Usuário do CEO
   - Senha do CEO
8. O servidor gera automaticamente um **Código do Grupo numérico**, por exemplo `4837`.
9. A compra pode criar apenas um Grupo.
10. O novo CEO entra em `/app` usando Código do Grupo + usuário + senha e administra o restante da equipe.

### Webhook

Configure no painel da sua integração Mercado Pago a URL:

```text
https://SEU-SITE.onrender.com/api/webhooks/mercadopago
```

Quando chega uma atualização, o servidor consulta novamente a assinatura na API do Mercado Pago e atualiza o status do Grupo. Uma assinatura autorizada mantém o Grupo ativo; situações não ativas podem suspender o acesso sem apagar os dados.

---

# Testar o fluxo de compra sem cobrar

## Teste rápido do próprio sistema (sem Mercado Pago)

No ambiente de teste, configure:

```text
TEST_PURCHASE_MODE=true
PUBLIC_BASE_URL=https://SEU-SITE-DE-TESTE.onrender.com
```

Ou localmente:

```text
TEST_PURCHASE_MODE=true
PUBLIC_BASE_URL=http://localhost:3000
```

Nesse modo, ao clicar em **Comprar acesso**, o servidor marca a compra como autorizada e abre diretamente o cadastro do Grupo + CEO. Ao finalizar, o sistema gera automaticamente o **Código do Grupo**.

Use isso apenas em um ambiente de teste. Se um site público ficar com `TEST_PURCHASE_MODE=true`, qualquer visitante poderá simular uma compra e criar um Grupo sem pagar.

## Teste real do checkout do Mercado Pago

Depois do fluxo interno estar validado, desative `TEST_PURCHASE_MODE` e configure as **credenciais de teste** do Mercado Pago. Assim você valida a tela externa de pagamento sem usar cobrança real. Antes de produção, troque para as credenciais produtivas.

---

# Como os Grupos ficam separados

O backend identifica o Grupo pela sessão. Um usuário autenticado em um Grupo só recebe e grava o estado daquele Grupo.

Exemplo:

```text
Grupo Fagundes Miari
  ├─ Fazendas
  ├─ Usuários
  ├─ Estoque
  ├─ Financeiro
  └─ Banhos

Grupo Oliveira
  ├─ Fazendas
  ├─ Usuários
  ├─ Estoque
  ├─ Financeiro
  └─ Banhos
```

Os dados não são enviados de um Grupo para o outro.

---

# Solicitação de funcionário

Agora funciona entre aparelhos:

```text
Funcionário no celular
      ↓
Servidor / PostgreSQL
      ↓
CEO no computador
      ↓
Usuários → Solicitações pendentes
```

O painel atualiza periodicamente, portanto a nova solicitação aparece sem depender do `localStorage` do funcionário.

---

# Observações de produção

A v21 já move a persistência principal e autenticação para o backend, mas antes de escalar comercialmente para muitos clientes ainda é recomendado adicionar:

- política de backup e retenção do PostgreSQL;
- logs/auditoria de ações críticas;
- recuperação de senha por e-mail;
- confirmação de e-mail;
- termos de uso e política de privacidade;
- domínio próprio e HTTPS;
- monitoramento de erros;
- testes automatizados de API e permissões;
- revisão jurídica/fiscal do modelo de assinatura.


# Painel da plataforma (nosso Super Admin)

A V21 inclui uma área administrativa separada em:

```text
https://SEU-SITE.onrender.com/platform
```

Ela usa a variável `PLATFORM_SETUP_KEY` como chave administrativa. Essa chave não deve ser compartilhada com clientes.

No painel é possível:

- ver todos os Grupos cadastrados;
- conferir Código do Grupo, plano, e-mail pagador e status;
- ver quantidade de Grupos ativos e suspensos;
- acompanhar uma estimativa de receita mensal com base no preço configurado do plano;
- suspender ou reativar o acesso de um Grupo sem apagar seus dados.

Para produção, use uma `PLATFORM_SETUP_KEY` longa e aleatória e mantenha-a somente nas variáveis secretas do Render.

---

# Rotas principais

```text
/           → site público de vendas
/app        → login e painel do cliente
/platform   → administração da plataforma
```

O preço exibido no site vem de `PLAN_PRICE`, portanto os R$ 199,90 usados no exemplo podem ser alterados sem refazer a página.
