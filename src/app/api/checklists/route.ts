import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChecklistFrequency } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return NextResponse.json({ error: 'ID da filial é obrigatório' }, { status: 400 });
    }

    const checklists = await prisma.checklist.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
        executions: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    // Transformar os dados para incluir a contagem de itens e execuções
    const checklistsWithCounts = checklists.map((checklist) => ({
      ...checklist,
      itemCount: checklist.sections.reduce((total, section) => total + section.items.length, 0),
      completedExecutionsCount: checklist.executions.length,
    }));

    return NextResponse.json({ data: checklistsWithCounts });
  } catch (error: any) {
    console.error('Erro ao buscar checklists:', error);
    return NextResponse.json({ error: 'Erro ao buscar checklists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.branch?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Dados recebidos:', data);

    const {
      name,
      description,
      frequency,
      time,
      daysOfWeek,
      responsibles,
      sections,
      environmentId,
    } = data;

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!frequency) missingFields.push('frequency');
    if (!time) missingFields.push('time');
    if (!daysOfWeek) missingFields.push('daysOfWeek');
    if (!responsibles) missingFields.push('responsibles');
    if (!sections) missingFields.push('sections');
    if (!environmentId) missingFields.push('environmentId');

    if (missingFields.length > 0) {
      console.log('Campos faltando:', missingFields);
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Criar o checklist com suas seções e itens
    const checklist = await prisma.checklist.create({
      data: {
        name,
        description,
        frequency: frequency as ChecklistFrequency,
        time,
        daysOfWeek,
        branchId: session.user.branch.id,
        environmentId,
        sections: {
          create: sections.map((section: any, index: number) => ({
            name: section.name,
            position: index,
            items: {
              create: section.questions.map((question: any, qIndex: number) => ({
                name: question.text,
                position: qIndex,
                departmentId: question.department,
                checklistResponseTypeId: question.responseType,
                allowNotApplicable: true,
              })),
            },
          })),
        },
        checklistUsers: {
          create: responsibles.map((user: any) => ({
            userId: user.id,
          })),
        },
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
        checklistUsers: true,
      },
    });

    return NextResponse.json({ data: checklist }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar checklist:', error);
    return NextResponse.json(
      { error: `Erro ao criar checklist: ${error.message}` },
      { status: 500 }
    );
  }
}
