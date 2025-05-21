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

    // Busca o usuário com sua organização e branch
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            branches: {
              include: {
                departments: {
                  include: {
                    responsibles: {
                      include: {
                        user: {
                          select: {
                            email: true,
                            status: true,
                          },
                        },
                      },
                    },
                  },
                },
                environments: true,
              },
            },
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ hasCompletedWizard: false });
    }

    const branch = user.organization.branches[0];
    if (!branch) {
      return NextResponse.json({ hasCompletedWizard: false });
    }

    return NextResponse.json({
      hasCompletedWizard: branch.wizardCompleted,
      organizationData: {
        name: user.organization.name,
        employeesCount: user.organization.employeesCount.toString(),
        country: user.organization.country,
        city: user.organization.city,
        nicheId: user.organization.nicheId,
        branch: {
          name: branch.name,
        },
        departments: branch.departments.map((dept) => ({
          name: dept.name,
          responsibles: dept.responsibles.map((resp) => ({
            email: resp.user.email,
            status: resp.user.status,
          })),
        })),
        environments: branch.environments.map((env) => ({
          name: env.name,
          position: env.position,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados da organização:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados da organização' }, { status: 500 });
  }
}
