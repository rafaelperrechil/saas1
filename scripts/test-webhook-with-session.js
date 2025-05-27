/**
 * Script para testar o webhook do Stripe com uma sessão real do banco de dados
 * Este script:
 * 1. Cria diretamente um registro de assinatura e pagamento no banco MySQL
 * 2. Simula um evento checkout.session.completed para este registro
 * 3. Envia para seu webhook local
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

// URL do webhook (ajuste conforme necessário)
const webhookUrl = 'http://localhost:3003/api/webhook';

// Gerar ID aleatório para o teste
const generateId = (prefix) => `${prefix}_${crypto.randomBytes(12).toString('hex')}`;

// Função principal
async function runTest() {
  try {
    console.log('Iniciando teste do webhook com dados reais...');

    // 1. Buscar um usuário e um plano reais do banco de dados
    console.log('Buscando usuário e plano no banco de dados...');

    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('Nenhum usuário encontrado no banco de dados.');
      return;
    }

    const plan = await prisma.plan.findFirst();
    if (!plan) {
      console.error('Nenhum plano encontrado no banco de dados.');
      return;
    }

    console.log(`Usuário encontrado: ${user.id} (${user.email})`);
    console.log(`Plano encontrado: ${plan.id} (${plan.name})`);

    // 2. Criar uma assinatura no banco de dados
    console.log('Criando assinatura no banco de dados...');
    const subscription = await prisma.subscription.create({
      data: {
        status: 'ACTIVE',
        user: { connect: { id: user.id } },
        plan: { connect: { id: plan.id } },
      },
    });
    console.log(`Assinatura criada: ${subscription.id}`);

    // 3. Gerar IDs para o teste
    const sessionId = generateId('cs');
    const paymentIntentId = generateId('pi');

    // 4. Criar um registro de pagamento temporário
    console.log('Criando registro de pagamento temporário...');
    const payment = await prisma.payment.create({
      data: {
        amount: plan.price,
        currency: 'BRL',
        status: 'REQUIRES_PAYMENT_METHOD',
        stripePaymentIntentId: `sess_${sessionId}`, // ID temporário com prefixo sess_
        user: { connect: { id: user.id } },
        subscription: { connect: { id: subscription.id } },
      },
    });
    console.log(`Pagamento criado: ${payment.id}`);

    // 5. Gerar evento de teste
    const testEvent = {
      id: generateId('evt'),
      object: 'event',
      api_version: '2022-11-15',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: sessionId, // Usar o mesmo ID de sessão armazenado no banco prefixado com sess_
          object: 'checkout.session',
          payment_intent: paymentIntentId,
          payment_status: 'paid',
          status: 'complete',
          client_reference_id: subscription.id,
          customer: generateId('cus'),
          customer_details: {
            email: user.email,
            name: user.name || 'Test User',
          },
          metadata: {
            userId: user.id,
            planId: plan.id,
            subscriptionId: subscription.id,
          },
        },
      },
      type: 'checkout.session.completed',
    };

    // 6. Enviar o evento para o webhook
    console.log('Enviando evento para o webhook...');
    await sendWebhookEvent(testEvent);

    // 7. Esperar um pouco para o webhook processar
    await new Promise((resolve) => setTimeout(resolve, 3003));

    // 8. Verificar se o pagamento foi atualizado
    console.log('Verificando se o pagamento foi atualizado...');
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });

    if (updatedPayment.stripePaymentIntentId === paymentIntentId) {
      console.log('✅ SUCESSO: O ID do PaymentIntent foi atualizado corretamente!');
      console.log(`ID original: sess_${sessionId}`);
      console.log(`ID novo: ${updatedPayment.stripePaymentIntentId}`);
      console.log(`Status atual: ${updatedPayment.status}`);
    } else {
      console.log('❌ FALHA: O ID do PaymentIntent não foi atualizado.');
      console.log('Detalhes do pagamento:', updatedPayment);
    }
  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para enviar evento para o webhook
async function sendWebhookEvent(event) {
  return new Promise((resolve, reject) => {
    const eventData = JSON.stringify(event);

    // Determinar qual biblioteca usar com base na URL
    const client = webhookUrl.startsWith('https') ? https : http;

    // Opções da requisição
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(eventData),
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
          resolve(responseData);
        } else {
          console.error('❌ Erro ao processar webhook:', responseData);
          reject(new Error(`Erro HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro ao enviar requisição:', error.message);
      reject(error);
    });

    // Enviar os dados do evento
    req.write(eventData);
    req.end();

    console.log(`Evento enviado para ${webhookUrl}`);
  });
}

// Executar o teste
runTest().catch(console.error);
