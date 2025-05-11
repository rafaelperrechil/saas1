import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const niches = await prisma.niche.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(niches);
  } catch (error) {
    console.error('Erro ao buscar nichos:', error);
    return NextResponse.json({ error: 'Erro ao buscar nichos' }, { status: 500 });
  }
}
