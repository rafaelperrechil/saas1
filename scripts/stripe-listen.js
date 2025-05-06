/**
 * Script para simular o comando 'stripe listen' sem a CLI do Stripe
 * Esse script cria um servidor proxy que recebe eventos do Stripe e os encaminha para seu endpoint local
 */

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');

// Configurações
const PORT = 4242;
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/webhook'; // Ajuste para seu endpoint
const SECRET_KEY = process.argv[2]; // Passe sua chave secreta do Stripe como argumento

// Verificar se a chave foi fornecida
if (!SECRET_KEY) {
  console.error('❌ Erro: Chave do Stripe não fornecida!');
  console.log('Uso: node scripts/stripe-listen.js SUA_CHAVE_STRIPE');
  process.exit(1);
}

// Inicializar o Stripe
const stripe = require('stripe')(SECRET_KEY);

// Inicializar o servidor Express
const app = express();
app.use(bodyParser.json());

// Gerar um webhook signing secret para verificação local
const WEBHOOK_SECRET = crypto.randomBytes(32).toString('hex');

// Endpoint que recebe eventos do Stripe e os encaminha para o webhook local
app.post('/webhook', async (req, res) => {
  const event = req.body;

  try {
    console.log(`🔔 Evento recebido: ${event.type}`);

    // Computar assinatura para o webhook local (similar ao que o Stripe faria)
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify(event);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    // Enviar para o webhook local
    const response = await axios.post(LOCAL_WEBHOOK_URL, event, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`,
      },
    });

    console.log(`✅ Evento encaminhado para ${LOCAL_WEBHOOK_URL}`);
    console.log(`   Resposta: ${response.status} ${response.statusText}`);

    // Responder ao Stripe
    res.status(200).send({ received: true });
  } catch (error) {
    console.error(`❌ Erro ao encaminhar evento: ${error.message}`);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Iniciar o servidor
app.listen(PORT, async () => {
  console.log('=============================================');
  console.log('🚀 SIMULADOR DO STRIPE LISTEN');
  console.log('=============================================');
  console.log(`✅ Servidor iniciado na porta ${PORT}`);
  console.log(`✅ Encaminhando eventos para: ${LOCAL_WEBHOOK_URL}`);
  console.log(`✅ Webhook signing secret: ${WEBHOOK_SECRET}`);
  console.log('\n⚠️ IMPORTANTE: Você precisa configurar esse signing secret no seu código!');
  console.log('\n📋 Para testar, você pode enviar eventos de teste:');
  console.log('   node scripts/test-webhook.js');

  // Verificar a conexão com o Stripe
  try {
    const account = await stripe.accounts.retrieve();
    console.log(`\n✅ Conectado à conta Stripe: ${account.id} (${account.email})`);
  } catch (error) {
    console.error(`\n❌ Erro ao conectar com o Stripe: ${error.message}`);
  }

  console.log('\n🔍 Aguardando eventos... (Ctrl+C para sair)');
});

// Adicionar endpoint para testar a conexão
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Simulador do Stripe Listen</title></head>
      <body>
        <h1>Simulador do Stripe Listen</h1>
        <p>O servidor está funcionando e pronto para encaminhar eventos para ${LOCAL_WEBHOOK_URL}</p>
        <p>Webhook signing secret: ${WEBHOOK_SECRET}</p>
      </body>
    </html>
  `);
});
