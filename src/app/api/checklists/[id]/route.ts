import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ChecklistUser {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
  checklistResponseTypeId: string;
  departmentId: string | null;
  checklistResponseType: {
    id: string;
    name: string;
    positiveLabel: string;
    negativeLabel: string;
  };
}

interface ChecklistSection {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const checklist = await prisma.checklist.findUnique({
      where: {
        id: id,
      },
      include: {
        sections: {
          include: {
            items: {
              include: {
                checklistResponseType: true,
              },
            },
          },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist não encontrado' }, { status: 404 });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Erro ao buscar checklist:', error);
    return NextResponse.json({ error: 'Erro ao buscar checklist' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Primeiro, atualizar o checklist
    const updatedChecklist = await prisma.checklist.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        time: data.time,
        daysOfWeek: data.daysOfWeek,
        environmentId: data.environmentId,
      },
    });

    // Buscar seções e itens existentes
    const existingSections = await prisma.checklistSection.findMany({
      where: {
        checklistId: id,
      },
      include: {
        items: {
          include: {
            executionItems: true,
          },
        },
      },
    });

    // Mapear seções e itens existentes por ID
    const existingSectionsMap = new Map(existingSections.map((section) => [section.id, section]));
    const existingItemsMap = new Map(
      existingSections.flatMap((section) => section.items.map((item) => [item.id, item]))
    );

    // Atualizar ou criar seções
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      const existingSection = existingSectionsMap.get(section.id);

      if (existingSection) {
        // Atualizar seção existente
        await prisma.checklistSection.update({
          where: { id: section.id },
          data: {
            name: section.name,
            position: i,
          },
        });

        // Mapear itens existentes na seção atual
        const existingSectionItems = new Map(existingSection.items.map((item) => [item.id, item]));

        // Atualizar itens existentes e criar novos
        for (let j = 0; j < section.questions.length; j++) {
          const question = section.questions[j];
          const existingItem = existingItemsMap.get(question.id);

          if (existingItem) {
            // Atualizar item existente
            await prisma.checklistItem.update({
              where: { id: question.id },
              data: {
                name: question.text,
                position: j,
                departmentId: question.department,
                checklistResponseTypeId: question.responseType,
              },
            });
            // Remover do mapa de itens existentes para não ser excluído depois
            existingSectionItems.delete(question.id);
          } else {
            // Criar novo item
            await prisma.checklistItem.create({
              data: {
                name: question.text,
                position: j,
                departmentId: question.department,
                checklistResponseTypeId: question.responseType,
                allowNotApplicable: true,
                checklistSectionId: section.id,
              },
            });
          }
        }

        // Remover itens que não existem mais na seção
        const itemsToDelete = Array.from(existingSectionItems.entries());
        for (const [itemId, item] of itemsToDelete) {
          // Verificar se o item tem respostas
          if (item.executionItems.length === 0) {
            await prisma.checklistItem.delete({
              where: { id: itemId },
            });
          }
        }
      } else {
        // Criar nova seção com seus itens
        await prisma.checklistSection.create({
          data: {
            name: section.name,
            position: i,
            checklistId: id,
            items: {
              create: section.questions.map((question: any, j: number) => ({
                name: question.text,
                position: j,
                departmentId: question.department,
                checklistResponseTypeId: question.responseType,
                allowNotApplicable: true,
              })),
            },
          },
        });
      }
    }

    // Remover seções que não existem mais
    const currentSectionIds = new Set(data.sections.map((s: any) => s.id));
    const sectionsToDelete = existingSections.filter(
      (section) => !currentSectionIds.has(section.id)
    );

    for (const section of sectionsToDelete) {
      // Verificar se alguma seção tem itens com respostas
      const hasItemsWithResponses = section.items.some((item) => item.executionItems.length > 0);

      if (!hasItemsWithResponses) {
        await prisma.checklistSection.delete({
          where: { id: section.id },
        });
      }
    }

    // Atualizar responsáveis
    await prisma.checklistUser.deleteMany({
      where: {
        checklistId: id,
      },
    });

    await prisma.checklistUser.createMany({
      data: data.responsibles.map((responsible: any) => ({
        checklistId: id,
        userId: responsible.id,
      })),
    });

    return NextResponse.json({ message: 'Checklist atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar checklist:', error);
    return NextResponse.json({ error: 'Erro ao atualizar checklist' }, { status: 500 });
  }
}
