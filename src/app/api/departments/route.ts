import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const departments = await prisma.department.findMany({
      where: {
        branchId,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        responsibles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: departments });
  } catch (error: any) {
    console.error('Erro ao buscar departamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar departamentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, branchId } = body;

    if (!name || !branchId) {
      return NextResponse.json({ error: 'Nome e ID da filial são obrigatórios' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        branchId,
      },
    });

    return NextResponse.json({ data: department });
  } catch (error: any) {
    console.error('Erro ao criar departamento:', error);
    return NextResponse.json({ error: 'Erro ao criar departamento' }, { status: 500 });
  }
}
