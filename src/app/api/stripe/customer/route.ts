import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.stripeCustomerId) {
      return NextResponse.json({ error: 'Usuário já possui uma conta Stripe' }, { status: 400 });
    }

    // Criar cliente no Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });

    // Atualizar usuário com o ID do cliente Stripe
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (error: any) {
    console.error('Erro ao criar cliente no Stripe:', error);
    return NextResponse.json(
      { error: `Erro ao criar cliente no Stripe: ${error.message}` },
      { status: 500 }
    );
  }
}
