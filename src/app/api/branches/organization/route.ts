import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Buscar o usuário com sua organização
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    // Buscar todas as filiais da organização
    const branches = await prisma.branch.findMany({
      where: {
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        name: true,
        wizardCompleted: true,
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    return NextResponse.json({ error: 'Erro ao buscar filiais' }, { status: 500 });
  }
}
