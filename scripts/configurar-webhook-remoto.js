/**
 * Script para configurar corretamente o webhook no Stripe utilizando uma URL pública
 * Para usar este script, você precisa:
 * 1. Instalar o ngrok (https://ngrok.com/download)
 * 2. Executar: ngrok http 3000
 * 3. Copiar a URL fornecida pelo ngrok (ex: https://1234-123-123-123-123.ngrok.io)
 * 4. Executar: node scripts/configurar-webhook-remoto.js SUA_CHAVE_STRIPE URL_NGROK/api/webhook
 */

// Obter a chave do Stripe e a URL do webhook a partir de argumentos da linha de comando
const stripeKey = process.argv[2];
const webhookUrl = process.argv[3];

if (!stripeKey || !webhookUrl) {
  console.error('❌ Erro: Parâmetros insuficientes!');
  console.log(`
=============================================
🔧 COMO CONFIGURAR O WEBHOOK REMOTO
=============================================

Para executar este script, siga os passos abaixo:

1. Instale o ngrok (https://ngrok.com/download) se ainda não tiver instalado.

2. Em um terminal separado, execute o ngrok para expor seu servidor local:
   ngrok http 3000

3. Copie a URL HTTPS fornecida pelo ngrok (ex: https://a1b2c3d4.ngrok.io).

4. Execute este script com sua chave do Stripe e a URL completa do webhook:
   node scripts/configurar-webhook-remoto.js SUA_CHAVE_STRIPE https://a1b2c3d4.ngrok.io/api/webhook

5. Configure o mesmo webhook signing secret no seu código.
`);
  process.exit(1);
}

// Inicializar o Stripe
const stripe = require('stripe')(stripeKey);

// Eventos que queremos ouvir (os mais comuns para pagamentos/assinaturas)
const eventos = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.succeeded',
  'charge.failed',
];

async function configurarWebhook() {
  try {
    console.log('=============================================');
    console.log('🔐 CONFIGURAR WEBHOOK REMOTO NO STRIPE');
    console.log('=============================================');

    // Verificar se a URL é válida
    if (!webhookUrl.startsWith('https://')) {
      console.error('❌ ERRO: A URL do webhook deve usar HTTPS!');
      console.log('O Stripe só aceita URLs HTTPS para webhooks.');
      console.log('Use o ngrok para gerar uma URL HTTPS para seu servidor local.');
      return;
    }

    console.log(`\n🔍 Verificando se a URL ${webhookUrl} é acessível...`);

    // Verificar se já existe um webhook com esta URL
    console.log('\n🔍 Verificando webhooks existentes...');
    const webhooks = await stripe.webhookEndpoints.list();

    console.log(`\n📋 Webhooks encontrados: ${webhooks.data.length}`);
    if (webhooks.data.length > 0) {
      webhooks.data.forEach((w) => {
        console.log(`   - ${w.id}: ${w.url} (${w.enabled_events.length} eventos)`);
      });
    }

    const webhookExistente = webhooks.data.find((w) => w.url === webhookUrl);

    let webhookFinal;

    if (webhookExistente) {
      console.log(`\n⚠️ Um webhook já existe para esta URL: ${webhookExistente.id}`);
      console.log('\nEventos configurados:');
      webhookExistente.enabled_events.forEach((evento) => {
        console.log(`   - ${evento}`);
      });

      console.log('\n🔄 Atualizando configuração do webhook...');

      // Atualizar webhook existente
      webhookFinal = await stripe.webhookEndpoints.update(webhookExistente.id, {
        enabled_events: eventos,
      });

      console.log('\n✅ Webhook atualizado com sucesso!');
    } else {
      // Criar um novo webhook
      console.log(`\n🔄 Criando novo webhook para ${webhookUrl}...`);

      webhookFinal = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: eventos,
        description: 'Webhook para receber eventos do Stripe (configurado via script)',
      });

      console.log('\n✅ Webhook criado com sucesso!');
    }

    console.log('\n📋 DETALHES DO WEBHOOK:');
    console.log(`   ID: ${webhookFinal.id}`);
    console.log(`   URL: ${webhookFinal.url}`);
    console.log(`   Status: ${webhookFinal.status}`);
    console.log(`   Secret: ${webhookFinal.secret}`);
    console.log('   Eventos configurados:');
    webhookFinal.enabled_events.forEach((evento) => {
      console.log(`   - ${evento}`);
    });

    console.log('\n⚠️ INFORMAÇÕES IMPORTANTES:');
    console.log('1. Guarde o webhook signing secret em um local seguro.');
    console.log('2. Configure esse secret no seu código para validar os eventos recebidos.');
    console.log('3. Lembre-se que a URL do ngrok muda cada vez que você reinicia o ngrok.');
    console.log('4. Para produção, use uma URL permanente em vez do ngrok.');
  } catch (error) {
    console.error('\n❌ Erro ao configurar webhook:', error.message);

    if (error.message.includes('Invalid URL')) {
      console.log('\n⚠️ A URL do webhook é inválida. Certifique-se de:');
      console.log('1. Usar uma URL HTTPS completa (ex: https://example.com/api/webhook)');
      console.log('2. Verificar se a URL está acessível e não está bloqueada por firewall');
    }
  }
}

// Executar a função
configurarWebhook();
