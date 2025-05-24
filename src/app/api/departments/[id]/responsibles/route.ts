import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 });
    }

    // Aguarda os parâmetros da rota
    const { id: departmentId } = await Promise.resolve(params);

    // Verifica se o departamento existe
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }

    // Verifica se o usuário já existe
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Se o usuário não existe, cria um novo
    if (!user) {
      // Gera uma senha aleatória
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          profile: {
            create: {
              name,
            },
          },
        },
      });
    }

    // Verifica se o usuário já é responsável deste departamento
    const existingResponsible = await prisma.departmentResponsible.findUnique({
      where: {
        departmentId_userId: {
          departmentId,
          userId: user.id,
        },
      },
    });

    if (existingResponsible) {
      return NextResponse.json(
        { error: 'Este usuário já é responsável deste departamento' },
        { status: 400 }
      );
    }

    // Adiciona o usuário como responsável do departamento
    await prisma.departmentResponsible.create({
      data: {
        departmentId,
        userId: user.id,
      },
    });

    // Busca o departamento atualizado com os responsáveis
    const updatedDepartment = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      include: {
        responsibles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...updatedDepartment,
        responsibles: updatedDepartment?.responsibles.map((r) => r.user),
      },
    });
  } catch (error: any) {
    console.error('Erro ao adicionar responsável:', error);
    return NextResponse.json({ error: 'Erro ao adicionar responsável' }, { status: 500 });
  }
}
