import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!user });
  } catch (err) {
    console.error('Erro ao verificar e-mail:', err);
    return NextResponse.json(
      { exists: false, error: 'Erro ao verificar e-mail.' },
      { status: 500 }
    );
  }
}
