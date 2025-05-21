import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc',
      },
    });

    // Adiciona features baseadas nos campos do plano
    const plansWithFeatures = plans.map((plan) => ({
      ...plan,
      price: Number(plan.price),
      features: [
        `${plan.includedUnits} unidades incluídas`,
        `Até ${plan.maxUsers} usuários`,
        plan.maxChecklists ? `Até ${plan.maxChecklists} checklists` : 'Checklists ilimitados',
        plan.extraUserPrice
          ? `R$ ${Number(plan.extraUserPrice).toFixed(2)} por usuário adicional`
          : 'Usuários adicionais inclusos',
        plan.extraUnitPrice
          ? `R$ ${Number(plan.extraUnitPrice).toFixed(2)} por unidade adicional`
          : 'Unidades adicionais inclusas',
      ],
    }));

    return NextResponse.json(plansWithFeatures);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
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
