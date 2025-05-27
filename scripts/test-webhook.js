/**
 * Script para testar o webhook do Stripe localmente sem o CLI do Stripe
 * Este script simula um evento checkout.session.completed e envia para seu webhook local
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

// URL do webhook (ajuste conforme necessário)
const webhookUrl = 'http://localhost:3003/api/webhook';

// Gerar ID aleatório para o teste
const generateId = (prefix) => `${prefix}_${crypto.randomBytes(12).toString('hex')}`;

// Gerar um evento de teste checkout.session.completed
const createCheckoutCompletedEvent = () => {
  const sessionId = generateId('cs');
  const paymentIntentId = generateId('pi');

  // Verificar se temos um ID de sessão armazenado no banco de dados
  // Para este teste, vamos assumir que usamos 'sess_' + sessionId como o ID temporário

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

// Criar evento de teste
const testEvent = createCheckoutCompletedEvent();

// Mostrar o evento que será enviado
console.log('Enviando evento de teste:', JSON.stringify(testEvent, null, 2));

// Converter o evento para string
const eventData = JSON.stringify(testEvent);

// Determinar qual biblioteca usar com base na URL
const client = webhookUrl.startsWith('https') ? https : http;

// Opções da requisição
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(eventData),
    // Normalmente precisaríamos da assinatura, mas nosso código foi modificado para aceitar
    // requisições sem assinatura em desenvolvimento
    'Stripe-Signature': 'teste_sem_verificacao',
  },
};

const parsedUrl = new URL(webhookUrl);

// Adicionar host e path às opções
options.hostname = parsedUrl.hostname;
options.port = parsedUrl.port || (webhookUrl.startsWith('https') ? 443 : 80);
options.path = parsedUrl.pathname;

// Fazer a requisição HTTP para seu webhook
const req = client.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Resposta do webhook [${res.statusCode}]:`, responseData);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Webhook processado com sucesso!');
    } else {
      console.error('❌ Erro ao processar webhook:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro ao enviar requisição:', error.message);
});

// Enviar os dados do evento
req.write(eventData);
req.end();

console.log(`Evento enviado para ${webhookUrl}`);
console.log('Aguardando resposta...');
