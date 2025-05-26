import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Busca a filial e sua organização
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { organization: true },
    });

    if (!branch) {
      return NextResponse.json({ error: 'Filial não encontrada' }, { status: 404 });
    }

    // Verifica se o usuário está vinculado à organização da filial
    const orgUser = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: branch.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: 'Filial não encontrada ou não pertence à sua organização' },
        { status: 403 }
      );
    }

    // Retorna os dados da branch para o frontend atualizar a sessão
    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error('Erro ao selecionar filial:', error);
    return NextResponse.json({ error: 'Erro ao selecionar filial' }, { status: 500 });
  }
}
