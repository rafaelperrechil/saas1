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
