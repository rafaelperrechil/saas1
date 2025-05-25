import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const execution = await prisma.checklistExecution.findUnique({
      where: {
        id: context.params.id,
      },
      include: {
        items: {
          include: {
            checklistItem: {
              include: {
                checklistResponseType: true,
              },
            },
          },
        },
        checklist: true,
      },
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execução não encontrada' }, { status: 404 });
    }

    return NextResponse.json(execution);
  } catch (error) {
    console.error('Erro ao buscar execução:', error);
    return NextResponse.json({ error: 'Erro ao buscar execução' }, { status: 500 });
  }
}
