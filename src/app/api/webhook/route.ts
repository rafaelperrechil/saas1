import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Configurações importantes para o webhook
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    console.log('=== WEBHOOK INICIADO ===');
    console.log('Headers:', Object.fromEntries(headersList.entries()));
    console.log('Signature:', signature);

    if (!signature) {
      console.error('Assinatura não encontrada');
      return new Response('Assinatura não encontrada', { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Webhook secret não configurado');
      return new Response('Webhook secret não configurado', { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Evento recebido:', event.type);

    // Salvar evento
    await prisma.webhookEvent.create({
      data: {
        type: event.type,
        stripeId: event.id,
        data: JSON.parse(JSON.stringify(event.data.object)),
        processed: false,
      },
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Sessão:', session.id);

      if (!session.metadata?.userId || !session.metadata?.planId) {
        throw new Error('Metadados incompletos');
      }

      // Atualizar checkout
      const checkout = await prisma.checkoutSession.findFirst({
        where: {
          customerId: session.metadata.userId,
          planId: session.metadata.planId,
          status: 'pending',
        },
      });

      if (!checkout) {
        throw new Error('Checkout não encontrado');
      }

      await prisma.checkoutSession.update({
        where: { id: checkout.id },
        data: { status: 'completed' },
      });

      // Atualizar todas as assinaturas ativas do usuário para EXPIRED
      await prisma.subscription.updateMany({
        where: {
          userId: session.metadata.userId,
          status: 'ACTIVE',
        },
        data: {
          status: 'EXPIRED',
        },
      });

      // Criar assinatura
      const subscription = await prisma.subscription.create({
        data: {
          status: 'ACTIVE',
          planId: session.metadata.planId,
          userId: session.metadata.userId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Criar pagamento
      if (session.payment_intent && typeof session.payment_intent === 'string') {
        await prisma.payment.create({
          data: {
            userId: session.metadata.userId,
            subscriptionId: subscription.id,
            stripePaymentIntentId: session.payment_intent,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'brl',
            status: 'SUCCEEDED',
            paidAt: new Date(),
          },
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Pagamento falhou:', paymentIntent.id);

      // Buscar o checkout relacionado
      const checkout = await prisma.checkoutSession.findFirst({
        where: {
          customerId: paymentIntent.metadata?.userId,
          status: 'pending',
        },
      });

      if (checkout) {
        // Atualizar status do checkout
        await prisma.checkoutSession.update({
          where: { id: checkout.id },
          data: { status: 'failed' },
        });

        // Criar registro de pagamento com falha
        await prisma.payment.create({
          data: {
            userId: paymentIntent.metadata?.userId || '',
            stripePaymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
            currency: paymentIntent.currency || 'brl',
            status: 'FAILED',
            error: paymentIntent.last_payment_error?.message || 'Pagamento falhou',
          },
        });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Erro:', error.message);
    return new Response(error.message, { status: 400 });
  }
}

// Adicionar handler para OPTIONS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
