import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ exists: false });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return NextResponse.json(
      { exists: false, error: 'Erro ao verificar e-mail.' },
      { status: 500 }
    );
  }
}
