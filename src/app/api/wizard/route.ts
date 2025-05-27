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

    // Verifica se o usuário já tem uma organização vinculada
    const existingOrgUser = await prisma.organizationUser.findFirst({
      where: { userId: session.user.id },
    });
    if (existingOrgUser) {
      return NextResponse.json(
        { error: 'Wizard já foi concluído para este usuário.' },
        { status: 400 }
      );
    }

    // Buscar o perfil 'User' e 'Administrador'
    const profileUser = await prisma.profile.findFirst({
      where: {
        name: 'User',
      },
    });

    const profileAdmin = await prisma.profile.findFirst({
      where: {
        name: 'Administrador',
      },
    });

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
              // Verificar se o usuário já existe
              let user = await prisma.user.findUnique({
                where: { email: resp.email },
              });

              if (!user) {
                // Criar o usuário com perfil
                user = await prisma.user.create({
                  data: {
                    email: resp.email,
                    name: resp.email.split('@')[0], // Nome temporário baseado no email
                    password: '', // Senha temporária
                    status: resp.status,
                    profile: {
                      connect: {
                        id: profileUser?.id,
                      },
                    },
                  },
                });
              }

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

    // Criar vínculo do usuário logado com a organização na tabela intermediária
    if (!profileAdmin?.id) {
      throw new Error('Perfil Administrador não encontrado');
    }
    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        profileId: profileAdmin.id,
      },
    });

    // Atualizar o branch para marcar o wizard como completo
    await prisma.branch.update({
      where: { id: branch.id },
      data: {
        wizardCompleted: true,
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
