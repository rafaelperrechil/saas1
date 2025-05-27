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

    // Buscar o organizationId da organização selecionada na sessão
    const organizationId = session.user.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    // Buscar todos os branchIds da organização
    const branches = await prisma.branch.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const branchIds = branches.map((b) => b.id);

    // Buscar estatísticas
    const stats = {
      totalUsers: await prisma.organizationUser.count({
        where: {
          organizationId: organizationId,
        },
      }),
      totalChecklists: await prisma.checklist.count({
        where: {
          branchId: { in: branchIds },
        },
      }),
      totalInspections: await prisma.checklistExecution.count({
        where: {
          checklist: {
            branchId: { in: branchIds },
          },
        },
      }),
      totalTickets: await prisma.ticket.count({
        where: {
          branchId: { in: branchIds },
        },
      }),
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
