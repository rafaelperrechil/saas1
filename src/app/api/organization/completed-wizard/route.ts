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

    // Buscar todas as organizações do usuário via OrganizationUser
    const orgUsers = await prisma.organizationUser.findMany({
      where: { userId: session.user.id },
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

    if (!orgUsers || orgUsers.length === 0) {
      return NextResponse.json({ hasCompletedWizard: false });
    }

    // Procurar por uma organização e branch com wizardCompleted = true
    let foundOrg = null;
    let foundBranch = null;
    for (const orgUser of orgUsers) {
      const org = orgUser.organization;
      if (!org) continue;
      const branch = org.branches.find((b) => b.wizardCompleted);
      if (branch) {
        foundOrg = org;
        foundBranch = branch;
        break;
      }
    }

    if (!foundOrg || !foundBranch) {
      return NextResponse.json({ hasCompletedWizard: false });
    }

    return NextResponse.json({
      hasCompletedWizard: true,
      organizationData: {
        name: foundOrg.name,
        employeesCount: foundOrg.employeesCount.toString(),
        country: foundOrg.country,
        city: foundOrg.city,
        nicheId: foundOrg.nicheId,
        branch: {
          name: foundBranch.name,
        },
        departments: foundBranch.departments.map((dept) => ({
          name: dept.name,
          responsibles: dept.responsibles.map((resp) => ({
            email: resp.user.email,
            status: resp.user.status,
          })),
        })),
        environments: foundBranch.environments.map((env) => ({
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
