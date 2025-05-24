import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const id = params.id;
    const data = await req.json();

    // Atualizar apenas o ambiente movido
    const updatedEnvironment = await prisma.environment.update({
      where: { id },
      data: {
        name: data.name,
        position: data.position,
      },
    });

    return NextResponse.json({ data: updatedEnvironment });
  } catch (error: any) {
    console.error('Erro ao atualizar ambiente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar ambiente' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const id = params.id;

    // Buscar o usuário com sua organização e branch
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            branches: {
              include: {
                environments: {
                  orderBy: {
                    position: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    const branch = user.organization.branches[0];
    if (!branch) {
      return NextResponse.json({ error: 'Branch não encontrado' }, { status: 404 });
    }

    // Verificar se o ambiente pertence ao branch do usuário
    const environment = branch.environments.find((env) => env.id === id);
    if (!environment) {
      return NextResponse.json({ error: 'Ambiente não encontrado' }, { status: 404 });
    }

    // Excluir o ambiente
    await prisma.environment.delete({
      where: { id },
    });

    return NextResponse.json({ data: true });
  } catch (error: any) {
    console.error('Erro ao excluir ambiente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir ambiente' },
      { status: 500 }
    );
  }
}
