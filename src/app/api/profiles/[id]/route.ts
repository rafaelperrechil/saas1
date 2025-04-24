import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Buscar perfil específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: params.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Atualizar perfil
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const profile = await prisma.profile.update({
      where: { id: params.id },
      data: { name: data.name },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Remover perfil
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se existem usuários vinculados ao perfil
    const usersWithProfile = await prisma.user.count({
      where: { profileId: params.id },
    });

    if (usersWithProfile > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um perfil que possui usuários vinculados' },
        { status: 400 }
      );
    }

    await prisma.profile.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Perfil removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover perfil:', error);
    return NextResponse.json({ error: 'Erro ao remover perfil' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
