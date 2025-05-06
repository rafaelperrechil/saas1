import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

// Inicializa a instância do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15' as Stripe.StripeConfig['apiVersion'],
});

// O segredo de assinatura do webhook para verificar se os eventos vêm realmente do Stripe
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Função para verificar requisições sem webhook secret (apenas para desenvolvimento)
function verifyRequestWithoutSecret(request: Request, body: string) {
  // Em produção, nunca aceite requisições sem verificar a assinatura
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️ Tentativa de processar webhook sem secret em produção');
    return null;
  }

  try {
    // No desenvolvimento, podemos simplesmente aceitar o JSON
    const event = JSON.parse(body);
    console.warn('⚠️ Webhook processado sem verificação de assinatura - NÃO USE EM PRODUÇÃO!');
    return event;
  } catch (err) {
    console.error('Erro ao analisar payload do webhook:', err);
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature') || '';

  let event;

  try {
    // Verificar a assinatura do evento para garantir que ele vem do Stripe
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      // Usar a função auxiliar para validar requisições sem webhook secret
      event = verifyRequestWithoutSecret(request, body);
      if (!event) {
        return NextResponse.json({ error: 'Webhook sem secret não é permitido' }, { status: 400 });
      }
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Evento recebido: ${event.type}`);

  try {
    // Processar o evento com base no tipo
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Recuperar o PaymentIntent associado à sessão
        const paymentIntentId = session.payment_intent as string;

        if (!paymentIntentId) {
          console.error('Sessão não tem PaymentIntent associado');
          break;
        }

        // Encontrar o registro de pagamento temporário com o prefixo 'sess_'
        const tempPayment = await (prisma as any).payment.findFirst({
          where: {
            stripePaymentIntentId: `sess_${session.id}`,
          },
          include: {
            subscription: true,
          },
        });

        if (!tempPayment) {
          console.error(`Pagamento com ID sess_${session.id} não encontrado`);
          break;
        }

        // Atualizar o registro com o PaymentIntent real
        await (prisma as any).payment.update({
          where: { id: tempPayment.id },
          data: {
            stripePaymentIntentId: paymentIntentId,
            status: 'SUCCEEDED',
            paidAt: new Date(),
          },
        });

        // Também podemos atualizar a assinatura para confirmar que está ativa
        if (tempPayment.subscription) {
          await (prisma as any).subscription.update({
            where: { id: tempPayment.subscription.id },
            data: {
              // Define a data de término para 1 ano no futuro (ou outro período conforme seu modelo de negócios)
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
        }

        console.log(`✅ Pagamento atualizado com PaymentIntent: ${paymentIntentId}`);
        break;
      }

      case 'payment_intent.succeeded': {
        // Pode ser usado para confirmar pagamentos que não vêm de Checkout Sessions
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Tentar encontrar um pagamento com este ID (se já foi atualizado pelo checkout.session.completed)
        const payment = await (prisma as any).payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          // Atualizar status se ainda não for SUCCEEDED
          if (payment.status !== 'SUCCEEDED') {
            await (prisma as any).payment.update({
              where: { id: payment.id },
              data: {
                status: 'SUCCEEDED',
                paidAt: new Date(),
              },
            });
            console.log(`✅ Status do pagamento atualizado para SUCCEEDED: ${payment.id}`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Encontrar o pagamento associado
        const payment = await (prisma as any).payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          await (prisma as any).payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
            },
          });
          console.log(`❌ Pagamento falhou: ${payment.id}`);
        }
        break;
      }

      // Adicione mais manipuladores de eventos conforme necessário

      default:
        // Eventos não tratados
        console.log(`Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error('Erro ao processar evento do webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar evento' }, { status: 500 });
  }

  // Responder ao Stripe com sucesso
  return NextResponse.json({ received: true });
}
