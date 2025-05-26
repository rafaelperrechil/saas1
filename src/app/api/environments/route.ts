import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const branchId = session.user.branch?.id;
    if (!branchId) {
      return NextResponse.json({ error: 'Filial não selecionada' }, { status: 400 });
    }

    const environments = await prisma.environment.findMany({
      where: { branchId },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({ data: environments });
  } catch (error: any) {
    console.error('Erro ao buscar ambientes:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ambientes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const branchId = session.user.branch?.id;
    if (!branchId) {
      return NextResponse.json({ error: 'Filial não selecionada' }, { status: 400 });
    }

    const data = await req.json();

    // Buscar o último position para o branch
    const lastEnvironment = await prisma.environment.findFirst({
      where: { branchId },
      orderBy: { position: 'desc' },
    });
    if (!data.position) {
      data.position = lastEnvironment ? lastEnvironment.position + 1 : 1;
    }

    const environment = await prisma.environment.create({
      data: {
        name: data.name,
        position: data.position,
        branchId: branchId,
      },
    });

    return NextResponse.json({ data: environment });
  } catch (error: any) {
    console.error('Erro ao criar ambiente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar ambiente' },
      { status: 500 }
    );
  }
}
