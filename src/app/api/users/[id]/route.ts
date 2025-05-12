import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Buscar usuário específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Atualizar usuário
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const params = await context.params;
    const { id } = params;

    // Validação dos campos obrigatórios
    if (!data.name || !data.email || !data.profileId) {
      return NextResponse.json({ error: 'Nome, email e perfil são obrigatórios' }, { status: 400 });
    }

    // Verificar se o email já existe (exceto para o próprio usuário)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
    }

    // Preparar dados para atualização
    const updateData: any = {
      name: data.name,
      email: data.email,
      profileId: data.profileId,
    };

    // Se uma nova senha foi fornecida, fazer o hash
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Remover usuário
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    // Verificar se é o último administrador
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.profile.name === 'Administrador') {
      const adminCount = await prisma.user.count({
        where: {
          profile: { name: 'Administrador' },
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Não é possível excluir o último administrador' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json({ error: 'Erro ao remover usuário' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
