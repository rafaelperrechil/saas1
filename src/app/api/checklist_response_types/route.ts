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

    const responseTypes = await prisma.checklistResponseType.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: responseTypes });
  } catch (error: any) {
    console.error('Erro ao buscar tipos de resposta:', error);
    return NextResponse.json({ error: 'Erro ao buscar tipos de resposta' }, { status: 500 });
  }
}
