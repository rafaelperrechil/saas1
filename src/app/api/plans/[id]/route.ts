import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;

    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (err) {
    console.error('Erro ao buscar plano:', err);
    return NextResponse.json({ error: 'Erro ao buscar plano.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await request.json();

    const plan = await prisma.plan.update({ where: { id }, data });
    return NextResponse.json(plan);
  } catch (err) {
    console.error('Erro ao atualizar plano:', err);
    return NextResponse.json({ error: 'Erro ao atualizar plano.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;

    await prisma.plan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro ao excluir plano:', err);
    return NextResponse.json({ error: 'Erro ao excluir plano.' }, { status: 500 });
  }
}
