import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Busca o token no banco
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    return NextResponse.json({ valid: !!resetToken }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
