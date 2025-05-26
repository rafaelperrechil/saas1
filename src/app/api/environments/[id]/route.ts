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

    const branchId = session.user.branch?.id;
    if (!branchId) {
      return NextResponse.json({ error: 'Filial não selecionada' }, { status: 400 });
    }

    // Verificar se o ambiente pertence ao branch selecionado
    const environment = await prisma.environment.findUnique({
      where: { id },
    });
    if (!environment || environment.branchId !== branchId) {
      return NextResponse.json({ error: 'Ambiente não encontrado ou não pertence à filial selecionada' }, { status: 404 });
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
