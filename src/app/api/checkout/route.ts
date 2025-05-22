import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { v4 as uuidv4 } from 'uuid';

interface CheckoutSession {
  id: string;
  status: string;
  amount: number;
  currency: string;
  customerId: string;
  organizationId: string;
  planId: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    // Buscar a organização do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: 'Usuário não pertence a uma organização' },
        { status: 400 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Usuário não possui uma conta Stripe' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL não está definida nas variáveis de ambiente');
    }

    const organization = user.organization;

    // Criar sessão de checkout no Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: `Plano ${plan.name} - ${plan.includedUnits} unidades incluídas`,
            },
            unit_amount: Math.round(Number(plan.price) * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        planId: plan.id,
        organizationId: organization.id,
        userId: user.id,
      },
    });

    // Criar sessão de checkout no banco
    const checkoutSession = await prisma.$transaction(async (tx) => {
      const result = await tx.$queryRaw<CheckoutSession[]>`
        INSERT INTO checkout_sessions (
          id, status, amount, currency, customer_id, organization_id, plan_id, payment_method, created_at, updated_at
        ) VALUES (
          ${uuidv4()},
          'pending',
          ${Number(plan.price)},
          'BRL',
          ${user.id},
          ${organization.id},
          ${plan.id},
          'card',
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return result[0];
    });

    return NextResponse.json({
      url: stripeSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    
    // Melhor tratamento de erros
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erro ao processar checkout: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao processar checkout' },
      { status: 500 }
    );
  }
}
