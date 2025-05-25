import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const checklists = await prisma.checklist.findMany({
      where: {
        checklistUsers: {
          some: {
            userId: session.user.id,
          },
        },
        actived: true,
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ data: checklists });
  } catch (error: any) {
    console.error('Erro ao buscar checklists do usuário:', error);
    return NextResponse.json(
      { error: `Erro ao buscar checklists: ${error.message}` },
      { status: 500 }
    );
  }
}
