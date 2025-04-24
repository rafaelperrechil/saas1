import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir em nossa base, você receberá as instruções de recuperação' },
        { status: 200 }
      );
    }

    // Gerar token de recuperação
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar o token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Enviar email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: 'SaaS Platform <noreply@seudominio.com>',
        to: email,
        subject: 'Recuperação de Senha',
        html: `
          <h1>Recuperação de Senha</h1>
          <p>Olá ${user.name},</p>
          <p>Você solicitou a recuperação de senha. Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="${resetLink}">Redefinir Senha</a></p>
          <p>Este link é válido por 1 hora.</p>
          <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
        `,
      });

      return NextResponse.json(
        { message: 'Email de recuperação enviado com sucesso' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      return NextResponse.json({ message: 'Erro ao enviar email de recuperação' }, { status: 500 });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
