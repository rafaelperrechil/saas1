/**
 * Script para registrar um webhook no Stripe
 * Este script registra um endpoint de webhook no Stripe, para receber eventos em produção
 */

// Obter a chave do Stripe a partir de argumentos da linha de comando
const stripeKey = process.argv[2];
const webhookUrl = process.argv[3];

if (!stripeKey || !webhookUrl) {
  console.error('❌ Erro: Parâmetros insuficientes!');
  console.log(
    'Uso: node scripts/registrar-webhook.js SUA_CHAVE_STRIPE https://seu-site.com/api/webhook'
  );
  process.exit(1);
}

// Inicializar o Stripe
const stripe = require('stripe')(stripeKey);

// Eventos que queremos ouvir
const eventos = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

async function registrarWebhook() {
  try {
    console.log('=============================================');
    console.log('🔐 REGISTRAR WEBHOOK NO STRIPE');
    console.log('=============================================');
    console.log(`\n🔍 Verificando webhooks existentes para ${webhookUrl}...`);

    // Verificar se já existe um webhook com esta URL
    const webhooks = await stripe.webhookEndpoints.list();
    const webhookExistente = webhooks.data.find((w) => w.url === webhookUrl);

    if (webhookExistente) {
      console.log(`\n⚠️ Um webhook já existe para esta URL: ${webhookExistente.id}`);
      console.log('Eventos configurados:');
      webhookExistente.enabled_events.forEach((evento) => {
        console.log(`   - ${evento}`);
      });

      // Perguntar se deseja atualizar
      console.log('\n⚠️ Você deseja atualizar este webhook? (Digite S para Sim)');
      console.log(
        'Como não podemos receber input neste script, vamos prosseguir com a atualização.'
      );

      // Atualizar webhook existente
      const webhookAtualizado = await stripe.webhookEndpoints.update(webhookExistente.id, {
        enabled_events: eventos,
      });

      console.log('\n✅ Webhook atualizado com sucesso!');
      console.log(`   ID: ${webhookAtualizado.id}`);
      console.log(`   Secret: ${webhookAtualizado.secret}`);
      console.log('   Eventos configurados:');
      webhookAtualizado.enabled_events.forEach((evento) => {
        console.log(`   - ${evento}`);
      });
    } else {
      // Criar um novo webhook
      console.log(`\n🔄 Criando novo webhook para ${webhookUrl}...`);

      const novoWebhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: eventos,
        description: 'Webhook para receber eventos do Stripe (criado por script)',
      });

      console.log('\n✅ Webhook criado com sucesso!');
      console.log(`   ID: ${novoWebhook.id}`);
      console.log(`   Secret: ${novoWebhook.secret}`);
      console.log('   Eventos configurados:');
      novoWebhook.enabled_events.forEach((evento) => {
        console.log(`   - ${evento}`);
      });

      console.log('\n⚠️ IMPORTANTE: Guarde o secret em um local seguro!');
      console.log(`   Você precisará dele para verificar as assinaturas dos eventos.`);
    }
  } catch (error) {
    console.error('\n❌ Erro ao registrar webhook:', error.message);
  }
}

// Executar a função
registrarWebhook();
