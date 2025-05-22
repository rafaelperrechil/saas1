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
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se o usuário não tem uma organização, criar uma temporária com nome em branco
    if (!user.organization) {
      const organization = await prisma.organization.create({
        data: {
          name: '', // Nome em branco para ser preenchido depois no wizard
          employeesCount: 1, // Valor inicial mínimo
          country: 'Brasil', // Valor temporário
          city: 'São Paulo', // Valor temporário
          niche: {
            connect: { id: 'cmaysrevf0006n70rce4xzup1' },
          },
          users: {
            connect: { id: user.id },
          },
        },
      });

      // Atualizar o usuário com a nova organização
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { organization: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
      }
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'Usuário não possui uma conta Stripe' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL não está definida nas variáveis de ambiente');
    }

    if (!user.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
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
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/billing`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        planId: plan.id,
        organizationId: organization.id,
        userId: user.id,
      },
    });

    // Criar sessão de checkout no banco
    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        id: uuidv4(),
        status: 'pending',
        amount: Number(plan.price),
        currency: 'BRL',
        customerId: user.id,
        organizationId: organization.id,
        planId: plan.id,
        paymentMethod: 'card',
      },
    });

    return NextResponse.json({
      url: stripeSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: `Erro ao criar sessão de checkout: ${error.message}` },
      { status: 500 }
    );
  }
}
