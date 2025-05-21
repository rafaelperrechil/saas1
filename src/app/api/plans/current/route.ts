import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar a assinatura ativa do usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      // Se não houver assinatura ativa, retorna o plano gratuito
      const freePlan = await prisma.plan.findFirst({
        where: {
          name: 'Free',
        },
      });

      if (!freePlan) {
        return NextResponse.json({ error: 'Plano gratuito não encontrado' }, { status: 404 });
      }

      return NextResponse.json(freePlan);
    }

    return NextResponse.json(subscription.plan);
  } catch (error: any) {
    console.error('Erro ao buscar plano atual:', error);
    return NextResponse.json(
      { error: `Erro ao buscar plano atual: ${error.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
