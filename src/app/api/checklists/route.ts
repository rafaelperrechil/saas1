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

    const checklists = await prisma.checklist.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: checklists });
  } catch (error: any) {
    console.error('Erro ao buscar checklists:', error);
    return NextResponse.json({ error: 'Erro ao buscar checklists' }, { status: 500 });
  }
}
