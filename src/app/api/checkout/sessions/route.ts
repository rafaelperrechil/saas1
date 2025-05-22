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

    const checkoutSessions = await prisma.checkoutSession.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(checkoutSessions);
  } catch (error: any) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return NextResponse.json(
      { error: `Erro ao buscar histórico de pagamentos: ${error.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
