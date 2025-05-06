import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const plans = await prisma.plan.findMany();
    return NextResponse.json(plans);
  } catch (err) {
    console.error('Erro ao buscar planos:', err);
    return NextResponse.json({ error: 'Erro ao buscar planos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const plan = await prisma.plan.create({ data });
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar plano:', err);
    return NextResponse.json({ error: 'Erro ao criar plano.' }, { status: 500 });
  }
}
