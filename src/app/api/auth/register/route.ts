import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Dados obrigatórios faltando.' }, { status: 400 });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está em uso' }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar perfil
    const profile = await prisma.profile.create({
      data: {
        name: name,
      },
    });

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileId: profile.id,
      },
    });

    // Buscar o plano gratuito
    const freePlan = await prisma.plan.findFirst({
      where: {
        name: 'Free',
      },
    });

    if (!freePlan) {
      throw new Error('Plano gratuito não encontrado');
    }

    // Criar a assinatura gratuita
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      },
    });

    return NextResponse.json({ message: 'Usuário registrado com sucesso' }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ error: 'Erro ao registrar usuário' }, { status: 500 });
  }
}
