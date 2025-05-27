/**
 * Script para testar diretamente o endpoint de webhook local
 * Este script envia um evento simulado diretamente para o endpoint local
 */

const http = require('http');
const crypto = require('crypto');

// URL do webhook local
const WEBHOOK_URL = 'http://localhost:3003/api/webhook';

// Obter o webhook secret do argumento de linha de comando ou usar o padrão
const WEBHOOK_SECRET =
  process.argv[2] || '1338702931b6b4c0dc1ac99622773e583748ab0f4792d019fb4f89a44d5d9823';

// Gerar ID aleatório para o teste
const generateId = (prefix) => `${prefix}_${crypto.randomBytes(12).toString('hex')}`;

// Criar evento simulado de checkout.session.completed
const sessionId = generateId('cs');
const paymentIntentId = generateId('pi');

const event = {
  id: generateId('evt'),
  object: 'event',
  api_version: '2022-11-15',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: sessionId,
      object: 'checkout.session',
      payment_intent: paymentIntentId,
      payment_status: 'paid',
      status: 'complete',
      client_reference_id: generateId('sub'),
      customer: generateId('cus'),
      customer_details: {
        email: 'test@example.com',
        name: 'Test User',
      },
      metadata: {
        userId: generateId('user'),
        planId: generateId('plan'),
        subscriptionId: generateId('sub'),
      },
    },
  },
  type: 'checkout.session.completed',
};

// Criar assinatura para o webhook
const timestamp = Math.floor(Date.now() / 1000);
const payload = JSON.stringify(event);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(signedPayload).digest('hex');

// Parsear a URL do webhook
const parsedUrl = new URL(WEBHOOK_URL);

// Configurar a requisição
const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 80,
  path: parsedUrl.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Stripe-Signature': `t=${timestamp},v1=${signature}`,
  },
};

console.log('=============================================');
console.log('🧪 TESTE DIRETO DO WEBHOOK LOCAL');
console.log('=============================================');
console.log(`\n📤 Enviando evento diretamente para: ${WEBHOOK_URL}`);
console.log(`\n🔐 Usando signing secret: ${WEBHOOK_SECRET}`);

// Enviar a requisição
const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n📥 Resposta [${res.statusCode}]:`, data);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Webhook processado com sucesso!');
    } else {
      console.error('❌ Erro ao processar webhook');
    }
  });
});

req.on('error', (error) => {
  console.error(`\n❌ Erro ao enviar requisição: ${error.message}`);

  if (error.code === 'ECONNREFUSED') {
    console.log('\n⚠️ Verifique se seu servidor está rodando na porta especificada.');
    console.log('  Execute: npm run dev');
  }
});

// Enviar o payload
req.write(payload);
req.end();

console.log('\n🔄 Requisição enviada, aguardando resposta...');
