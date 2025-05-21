import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { csrfMiddleware } from '@/lib/csrf';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Verifica o token CSRF
    const isCsrfValid = await csrfMiddleware(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: 'Token CSRF inválido ou não fornecido' }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o perfil do usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 400 });
    }

    const data = await req.json();
    console.log('Dados recebidos:', data);

    // Criar a organização
    const organization = await prisma.organization.create({
      data: {
        name: data.organization.name,
        employeesCount: parseInt(data.organization.employeesCount, 10),
        country: data.organization.country,
        city: data.organization.city,
        nicheId: data.organization.nicheId,
      },
    });

    // Criar a filial
    const branch = await prisma.branch.create({
      data: {
        name: data.branch.name,
        organizationId: organization.id,
      },
    });

    // Criar os departamentos e seus responsáveis
    const departments = await Promise.all(
      data.departments.map(
        async (dept: { name: string; responsibles: Array<{ email: string; status: string }> }) => {
          // Primeiro criar o departamento
          const department = await prisma.department.create({
            data: {
              name: dept.name,
              branchId: branch.id,
            },
          });

          // Depois criar os usuários responsáveis e vinculá-los ao departamento
          await Promise.all(
            dept.responsibles.map(async (resp: { email: string; status: string }) => {
              // Criar o usuário com perfil
              const user = await prisma.user.create({
                data: {
                  email: resp.email,
                  name: resp.email.split('@')[0], // Nome temporário baseado no email
                  password: '', // Senha temporária
                  status: resp.status,
                  profile: {
                    connect: {
                      id: currentUser.profile.id,
                    },
                  },
                },
              });

              // Vincular o usuário ao departamento
              await prisma.departmentResponsible.create({
                data: {
                  departmentId: department.id,
                  userId: user.id,
                },
              });

              return user;
            })
          );

          return department;
        }
      )
    );

    // Criar os ambientes
    const environments = await Promise.all(
      data.environments.map(async (env: { name: string; position: number }) => {
        return prisma.environment.create({
          data: {
            name: env.name,
            position: env.position,
            branchId: branch.id,
          },
        });
      })
    );

    // Atualizar o usuário com a filial
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        organization,
        branch,
        departments,
        environments,
      },
    });
  } catch (error) {
    console.error('Erro ao processar wizard:', error);
    return NextResponse.json({ error: 'Erro ao processar os dados do wizard' }, { status: 500 });
  }
}
