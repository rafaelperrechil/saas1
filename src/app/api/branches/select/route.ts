import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { branchId } = await request.json();

    if (!branchId) {
      return NextResponse.json({ error: 'ID da filial não fornecido' }, { status: 400 });
    }

    // Buscar o usuário com sua organização
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    // Verificar se a filial existe e pertence à organização do usuário
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        name: true,
        wizardCompleted: true,
      },
    });

    if (!branch) {
      return NextResponse.json(
        { error: 'Filial não encontrada ou acesso não autorizado' },
        { status: 404 }
      );
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error('Erro ao selecionar filial:', error);
    return NextResponse.json({ error: 'Erro ao selecionar filial' }, { status: 500 });
  }
}
