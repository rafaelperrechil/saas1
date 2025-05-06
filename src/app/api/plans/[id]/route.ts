import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: params.id } });
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (err) {
    console.error(`Erro ao buscar plano ${params.id}:`, err);
    return NextResponse.json({ error: 'Erro ao buscar plano.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const plan = await prisma.plan.update({ where: { id: params.id }, data });
    return NextResponse.json(plan);
  } catch (err) {
    console.error(`Erro ao atualizar plano ${params.id}:`, err);
    return NextResponse.json({ error: 'Erro ao atualizar plano.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.plan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`Erro ao excluir plano ${params.id}:`, err);
    return NextResponse.json({ error: 'Erro ao excluir plano.' }, { status: 500 });
  }
}
