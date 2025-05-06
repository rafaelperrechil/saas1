# Stripe Webhook e Integração de Pagamentos

## Configuração de Variáveis de Ambiente

Para que o sistema de pagamento funcione corretamente, você precisa configurar as seguintes variáveis de ambiente no arquivo `.env` na raiz do projeto:

```
# Stripe
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Aplicação
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Como funciona o fluxo de pagamento

1. **Criação da Assinatura**:

   - Quando o usuário seleciona um plano, criamos um registro de `Subscription` no banco de dados
   - Em seguida, criamos uma sessão de checkout do Stripe
   - Criamos um registro de `Payment` com um ID temporário baseado na sessão do Stripe
   - O usuário é redirecionado para a página de checkout do Stripe

2. **Processamento do Pagamento via Webhook**:
   - Quando o pagamento é concluído, o Stripe envia um evento para nosso webhook
   - O webhook atualiza o registro de `Payment` com o ID real do PaymentIntent
   - O status do pagamento é atualizado para `SUCCEEDED`
   - A assinatura também é atualizada para refletir a data de término

## Configurando o Webhook do Stripe

### Em desenvolvimento

1. Instale a CLI do Stripe:

   ```
   npm install -g stripe-cli
   ```

2. Autentique-se com sua conta Stripe:

   ```
   stripe login
   ```

3. Configure o encaminhamento de webhook para seu ambiente local:

   ```
   stripe listen --forward-to http://localhost:3000/api/webhook
   ```

4. A CLI irá fornecer uma chave de assinatura do webhook. Adicione-a ao seu `.env`:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### Em produção

1. Vá para o [Dashboard do Stripe](https://dashboard.stripe.com/webhooks)
2. Clique em "Add Endpoint"
3. Insira a URL do seu webhook (ex: `https://seu-site.com/api/webhook`)
4. Selecione os eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o "Signing Secret" e adicione-o à variável `STRIPE_WEBHOOK_SECRET` no seu servidor

## Testando o Webhook

Para testar o webhook localmente:

1. Use o Stripe CLI para enviar eventos de teste:

   ```
   stripe trigger checkout.session.completed
   ```

2. Verifique os logs do servidor para confirmar que o evento foi recebido e processado

## Extensões e Melhorias

O webhook atual suporta os eventos básicos, mas você pode estendê-lo para incluir:

- Cancelamento de assinaturas (`customer.subscription.deleted`)
- Pagamentos contestados (`charge.dispute.created`)
- Falhas de cobrança recorrente (`invoice.payment_failed`)
- Notificações por email para o cliente

---

Para mais informações sobre a API do Stripe, consulte a [documentação oficial](https://stripe.com/docs/api).
