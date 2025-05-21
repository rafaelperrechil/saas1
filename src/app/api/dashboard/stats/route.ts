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
        organization: true,
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    // Buscar estatísticas
    const stats = {
      totalUsers: await prisma.user.count({
        where: {
          organizationId: user.organization.id,
        },
      }),
      totalDepartments: await prisma.department.count({
        where: {
          branch: {
            organizationId: user.organization.id,
          },
        },
      }),
      totalEnvironments: await prisma.environment.count({
        where: {
          branch: {
            organizationId: user.organization.id,
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
