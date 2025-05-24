import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Aguarda os parâmetros da rota
    const { id, userId } = await context.params;

    // Verifica se o departamento existe
    const department = await prisma.department.findUnique({
      where: {
        id,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }

    // Remove o responsável do departamento
    await prisma.departmentResponsible.delete({
      where: {
        departmentId_userId: {
          departmentId: id,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ data: null });
  } catch (error: any) {
    console.error('Erro ao remover responsável:', error);
    return NextResponse.json({ error: 'Erro ao remover responsável' }, { status: 500 });
  }
}
