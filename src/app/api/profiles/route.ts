import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Listar todos os perfis
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profiles = await prisma.profile.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Erro ao buscar perfis:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfis' }, { status: 500 });
  }
}

// POST - Criar novo perfil
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 });
  }
}
