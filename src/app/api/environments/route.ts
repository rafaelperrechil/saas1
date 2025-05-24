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

    // Buscar o usuário com sua organização e branch
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            branches: {
              include: {
                environments: {
                  orderBy: {
                    position: 'asc'
                  }
                },
              },
            },
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    const branch = user.organization.branches[0];
    if (!branch) {
      return NextResponse.json({ error: 'Branch não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: branch.environments });
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

    const data = await req.json();

    // Buscar o usuário com sua organização e branch
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            branches: {
              include: {
                environments: {
                  orderBy: {
                    position: 'asc'
                  }
                },
              },
            },
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    const branch = user.organization.branches[0];
    if (!branch) {
      return NextResponse.json({ error: 'Branch não encontrado' }, { status: 404 });
    }

    // Se não for especificada uma posição, coloca no final
    if (!data.position) {
      const lastEnvironment = branch.environments[branch.environments.length - 1];
      data.position = lastEnvironment ? lastEnvironment.position + 1 : 1;
    }

    const environment = await prisma.environment.create({
      data: {
        name: data.name,
        position: data.position,
        branchId: branch.id,
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
