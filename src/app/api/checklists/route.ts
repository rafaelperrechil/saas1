import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChecklistFrequency } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Pega o branchId da query string
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return NextResponse.json({ error: 'branchId não informado' }, { status: 400 });
    }

    // Busca checklists do branch
    const checklistsByBranch = await prisma.checklist.findMany({
      where: {
        branchId: branchId,
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
    });

    // Busca checklists vinculados ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    let checklistsByUser: any[] = [];
    if (user) {
      checklistsByUser = await prisma.checklist.findMany({
        where: {
          checklistUsers: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          sections: {
            include: {
              items: true,
            },
          },
          _count: {
            select: {
              executions: true,
            },
          },
        },
      });
    }

    // Unir ambos, sem duplicados (por id)
    const allChecklistsMap = new Map();
    for (const checklist of [...checklistsByBranch, ...checklistsByUser]) {
      allChecklistsMap.set(checklist.id, checklist);
    }
    let allChecklists = Array.from(allChecklistsMap.values());

    // Adicionar campos itemCount e completedExecutionsCount para cada checklist
    allChecklists = allChecklists.map((checklist: any) => {
      const itemCount = (checklist.sections || []).reduce(
        (acc: number, section: any) => acc + (section.items ? section.items.length : 0),
        0
      );
      return {
        ...checklist,
        itemCount,
        completedExecutionsCount: checklist._count?.executions || 0,
      };
    });

    return NextResponse.json({ data: allChecklists });
  } catch (error) {
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
