import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Buscar dados do perfil do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        timezone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Erro ao buscar perfil de usuário:', error);
    return NextResponse.json(
      {
        error: `Erro ao buscar dados do usuário: ${error.message || 'Erro desconhecido'}`,
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do perfil do usuário
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    // Validar dados recebidos
    const { name, phone, country, timezone } = data;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: phone || null,
        country: country || null,
        timezone: timezone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        timezone: true,
      },
    });

    return NextResponse.json({
      ...updatedUser,
      message: 'Perfil atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil de usuário:', error);
    return NextResponse.json(
      {
        error: `Erro ao atualizar dados do usuário: ${error.message || 'Erro desconhecido'}`,
      },
      { status: 500 }
    );
  }
}
