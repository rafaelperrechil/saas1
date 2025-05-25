import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const checklistId = params.id;

    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist não encontrado' }, { status: 404 });
    }

    const updatedChecklist = await prisma.checklist.update({
      where: { id: checklistId },
      data: { actived: !checklist.actived },
    });

    return NextResponse.json({ data: updatedChecklist });
  } catch (error) {
    console.error('Erro ao atualizar status do checklist:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status do checklist' }, { status: 500 });
  }
}
