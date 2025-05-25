import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { checklistId, items, status, completedAt } = body;

    if (!checklistId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Criar a execução do checklist
    const execution = await prisma.checklistExecution.create({
      data: {
        checklistId,
        performedById: user.id,
        status,
        completedAt: new Date(completedAt),
        items: {
          create: items.map((item: any) => ({
            checklistItemId: item.checklistItemId,
            isPositive: item.isPositive,
            note: item.note,
          })),
        },
      },
    });

    return NextResponse.json(execution);
  } catch (error) {
    console.error('Erro ao salvar execução:', error);
    return NextResponse.json({ error: 'Erro ao salvar execução do checklist' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('Usuário não encontrado', { status: 404 });
    }

    const executions = await prisma.checklistExecution.findMany({
      where: {
        performedById: user.id,
      },
      include: {
        checklist: true,
        items: {
          include: {
            checklistItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json(executions);
  } catch (error) {
    console.error('Erro ao buscar execuções:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
