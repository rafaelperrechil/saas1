import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get('branchId');
    if (!branchId) {
      return NextResponse.json({ error: 'branchId não informado' }, { status: 400 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: tickets });
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return NextResponse.json({ error: 'Erro ao buscar tickets' }, { status: 500 });
  }
}
