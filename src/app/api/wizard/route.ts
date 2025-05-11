import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Dados recebidos:', data);

    // Iniciar uma transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar a organização e conectar com o usuário
      const organization = await tx.organization.create({
        data: {
          name: data.organization.name,
          employeesCount: parseInt(data.organization.employeesCount),
          country: data.organization.country,
          city: data.organization.city,
          nicheId: data.organization.nicheId,
          users: {
            connect: [{ id: session.user.id }],
          },
        },
      });

      // 2. Criar a filial
      const branch = await tx.branch.create({
        data: {
          name: data.branch.name,
          organizationId: organization.id,
        },
      });

      // 3. Criar os departamentos e seus responsáveis
      const departments = [];
      for (const dept of data.departments) {
        const department = await tx.department.create({
          data: {
            name: dept.name,
            branchId: branch.id,
          },
        });

        // Processar responsáveis do departamento
        for (const responsible of dept.responsibles) {
          const user = await tx.user.findUnique({
            where: { email: responsible.email },
          });

          if (user) {
            await tx.departmentResponsible.create({
              data: {
                departmentId: department.id,
                userId: user.id,
              },
            });
          }
        }

        departments.push(department);
      }

      // 4. Criar os ambientes
      const environments = await Promise.all(
        data.environments.map(async (env: { name: string; position: number }) => {
          return tx.environment.create({
            data: {
              name: env.name,
              position: env.position,
              branchId: branch.id,
            },
          });
        })
      );

      // 5. Atualizar o status do wizard do usuário
      await tx.user.update({
        where: { id: session.user.id },
        data: { wizardCompleted: true },
      });

      return {
        organization,
        branch,
        departments,
        environments,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro ao processar wizard:', error);
    return NextResponse.json({ error: 'Erro ao processar os dados do wizard' }, { status: 500 });
  }
}
