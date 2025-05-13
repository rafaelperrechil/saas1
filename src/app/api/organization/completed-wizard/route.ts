import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface BranchData {
  id: string;
  name: string;
  organizationId: string;
  wizardCompleted: boolean;
  employeesCount: string;
  country: string;
  city: string;
  nicheId: string;
  departments: {
    id: string;
    name: string;
    responsibles: {
      user: {
        email: string;
        status: string;
      };
    }[];
  }[];
  environments: {
    id: string;
    name: string;
    position: number;
  }[];
}

interface UserWithOrganization {
  id: string;
  organization: {
    id: string;
    name: string;
    employeesCount: string;
    country: string;
    city: string;
    nicheId: string;
    branches: BranchData[];
  } | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca o usuário com sua organização
    const user = (await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            employeesCount: true,
            country: true,
            city: true,
            nicheId: true,
            branches: {
              where: {
                wizardCompleted: true,
              },
              select: {
                id: true,
                name: true,
                organizationId: true,
                wizardCompleted: true,
                departments: {
                  select: {
                    id: true,
                    name: true,
                    responsibles: {
                      select: {
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
                environments: {
                  select: {
                    id: true,
                    name: true,
                    position: true,
                  },
                  orderBy: {
                    position: 'asc',
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    })) as UserWithOrganization;

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    // Se encontrou uma filial com wizard completo, retorna os dados da organização
    if (user.organization.branches.length > 0) {
      const completedBranch = user.organization.branches[0];
      return NextResponse.json({
        hasCompletedWizard: true,
        organizationData: {
          name: user.organization.name,
          employeesCount: user.organization.employeesCount,
          country: user.organization.country,
          city: user.organization.city,
          nicheId: user.organization.nicheId,
          branch: {
            name: completedBranch.name,
          },
          departments: completedBranch.departments.map((dept) => ({
            name: dept.name,
            responsibles: dept.responsibles.map((resp) => ({
              email: resp.user.email,
              status: resp.user.status,
            })),
          })),
          environments: completedBranch.environments.map((env) => ({
            name: env.name,
            position: env.position,
          })),
        },
      });
    }

    return NextResponse.json({ hasCompletedWizard: false });
  } catch (error) {
    console.error('Erro ao buscar dados da organização:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados da organização' }, { status: 500 });
  }
}
