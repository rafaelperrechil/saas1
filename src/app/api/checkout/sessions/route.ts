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

    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return NextResponse.json(
      { error: `Erro ao buscar histórico de pagamentos: ${error.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
