import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Buscar o usuário com sua organização
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            branches: true,
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: user.organization.branches });
  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    return NextResponse.json({ error: 'Erro ao buscar filiais' }, { status: 500 });
  }
}
