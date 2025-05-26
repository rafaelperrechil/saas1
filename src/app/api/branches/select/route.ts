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

    // Busca a filial e verifica se pertence à organização do usuário
    const orgUser = await prisma.organizationUser.findFirst({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: { branches: true }
        }
      }
    });

    if (!orgUser?.organization?.branches.some((b) => b.id === branchId)) {
      return NextResponse.json(
        { error: 'Filial não encontrada ou não pertence à sua organização' },
        { status: 403 }
      );
    }

    // Busca os dados da branch selecionada
    const branch = orgUser.organization.branches.find((b) => b.id === branchId);
    if (!branch) {
      return NextResponse.json({ error: 'Filial não encontrada' }, { status: 404 });
    }

    // Atualiza o JWT (token) do usuário na sessão (NextAuth usa JWT, então precisa trigger update no frontend)
    // Aqui apenas retorna os dados da branch para o frontend atualizar a sessão
    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error('Erro ao selecionar filial:', error);
    return NextResponse.json({ error: 'Erro ao selecionar filial' }, { status: 500 });
  }
}
