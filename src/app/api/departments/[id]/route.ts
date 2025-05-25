import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: department });
  } catch (error: any) {
    console.error('Erro ao buscar departamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar departamento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Buscar o departamento atual para obter o branchId
    const currentDepartment = await prisma.department.findUnique({
      where: { id: params.id },
    });

    if (!currentDepartment) {
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }

    // Verificar se já existe outro departamento com o mesmo nome na mesma filial
    const existingDepartment = await prisma.department.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: name,
            },
          },
          {
            branchId: currentDepartment.branchId,
          },
          {
            id: {
              not: params.id,
            },
          },
        ],
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Já existe um departamento com este nome nesta filial' },
        { status: 200 }
      );
    }

    const department = await prisma.department.update({
      where: {
        id: params.id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({ data: department });
  } catch (error: any) {
    console.error('Erro ao atualizar departamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar departamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.department.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ data: null });
  } catch (error: any) {
    console.error('Erro ao excluir departamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir departamento' }, { status: 500 });
  }
}
