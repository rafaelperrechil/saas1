/**
 * Script para testar o simulador do Stripe Listen
 * Este script simula um evento checkout.session.completed e envia para o servidor simulador
 */

const http = require('http');
const crypto = require('crypto');

// URL do servidor simulador (ajuste conforme necessário)
const SIMULADOR_URL = 'http://localhost:4242/webhook';

// Gerar ID aleatório para o teste
const generateId = (prefix) => `${prefix}_${crypto.randomBytes(12).toString('hex')}`;

// Gerar um evento de teste checkout.session.completed
const createCheckoutCompletedEvent = () => {
  const sessionId = generateId('cs');
  const paymentIntentId = generateId('pi');

  return {
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
        client_reference_id: generateId('sub'), // Normalmente o ID da assinatura
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
};

// Menu de eventos disponíveis para teste
const eventTypes = {
  1: { label: 'checkout.session.completed', generator: createCheckoutCompletedEvent },
  2: {
    label: 'payment_intent.succeeded',
    generator: () => ({
      id: generateId('evt'),
      object: 'event',
      api_version: '2022-11-15',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: generateId('pi'),
          object: 'payment_intent',
          amount: 2000,
          currency: 'brl',
          status: 'succeeded',
          customer: generateId('cus'),
        },
      },
      type: 'payment_intent.succeeded',
    }),
  },
  3: {
    label: 'customer.subscription.created',
    generator: () => ({
      id: generateId('evt'),
      object: 'event',
      api_version: '2022-11-15',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: generateId('sub'),
          object: 'subscription',
          status: 'active',
          customer: generateId('cus'),
          items: {
            data: [
              {
                id: generateId('si'),
                price: {
                  id: generateId('price'),
                  product: generateId('prod'),
                },
              },
            ],
          },
        },
      },
      type: 'customer.subscription.created',
    }),
  },
};

// Mostrar menu de eventos
console.log('=============================================');
console.log('🔄 TESTE DO SIMULADOR DO STRIPE LISTEN');
console.log('=============================================');
console.log('Escolha um tipo de evento para enviar:');
for (const [key, event] of Object.entries(eventTypes)) {
  console.log(`${key} - ${event.label}`);
}

// Ler a escolha do usuário (simulado para o exemplo)
const escolha = process.argv[2] || '1';
const eventoEscolhido = eventTypes[escolha];

if (!eventoEscolhido) {
  console.error('❌ Escolha inválida!');
  console.log('Uso: node scripts/test-webhook-simulador.js [1-3]');
  process.exit(1);
}

// Criar evento de teste
const testEvent = eventoEscolhido.generator();

// Mostrar o evento que será enviado
console.log(`\n📤 Enviando evento: ${eventoEscolhido.label}`);
console.log(JSON.stringify(testEvent, null, 2));

// Converter o evento para string
const eventData = JSON.stringify(testEvent);

// Parsear a URL do simulador
const parsedUrl = new URL(SIMULADOR_URL);

// Opções da requisição
const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 80,
  path: parsedUrl.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(eventData),
  },
};

// Fazer a requisição HTTP para o simulador
const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`\n📥 Resposta [${res.statusCode}]:`, responseData);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Evento processado com sucesso!');
    } else {
      console.error('❌ Erro ao processar evento:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro ao enviar requisição:', error.message);
});

// Enviar os dados do evento
req.write(eventData);
req.end();

console.log(`\n🔄 Evento enviado para ${SIMULADOR_URL}`);
console.log('Aguardando resposta...');
