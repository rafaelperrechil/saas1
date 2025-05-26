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

    // Buscar estatísticas
    const stats = {
      totalUsers: await prisma.organizationUser.count({
        where: {
          organizationId: organizationId,
        },
      }),
      totalDepartments: await prisma.department.count({
        where: {
          branch: {
            organizationId: organizationId,
          },
        },
      }),
      totalEnvironments: await prisma.environment.count({
        where: {
          branch: {
            organizationId: organizationId,
          },
        },
      }),
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
