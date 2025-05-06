import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: Request) {
  const { planId } = await request.json();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // buscar dados do plano
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

  // criar subscription (conectando via relação para garantir userId e planId)
  const subscription = await (prisma as any).subscription.create({
    data: {
      status: 'ACTIVE',
      user: { connect: { id: userId } },
      plan: { connect: { id: planId } },
    },
  });

  // Criar uma sessão de Checkout do Stripe
  // O PaymentIntent será criado automaticamente pela sessão
  // para sincronizar o status de pagamento
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: { name: plan.name },
          unit_amount: plan.price.times(100).toNumber(),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: {
      subscriptionId: subscription.id,
      userId: userId,
      planId: planId,
    },
    client_reference_id: subscription.id,
  });

  // Criar registro de pagamento com um ID temporário baseado na sessão
  // Em produção, este ID seria atualizado via webhook quando o pagamento for concluído
  await (prisma as any).payment.create({
    data: {
      amount: plan.price,
      currency: 'BRL',
      status: 'REQUIRES_PAYMENT_METHOD',
      // Usamos um prefixo 'sess_' para indicar que este é um ID temporário
      // que será atualizado para o PaymentIntent real quando o pagamento for concluído
      stripePaymentIntentId: `sess_${stripeSession.id}`,
      user: { connect: { id: userId } },
      subscription: { connect: { id: subscription.id } },
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}
