import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log('Iniciando processo de recuperação para:', email);

    // Verifica se existe algum usuário com email similar
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: email },
          { email: { contains: email.split('@')[0] } }, // Busca por emails com o mesmo nome de usuário
        ],
      },
      select: { id: true, email: true },
    });

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado com email similar a:', email);
      return NextResponse.json(
        {
          error: true,
          message:
            'Não encontramos nenhum usuário com este email. Por favor, verifique o email digitado.',
        },
        { status: 404 }
      );
    }

    // Se encontrou mais de um usuário, usa o primeiro
    const user = users[0];
    console.log('Usuário encontrado:', user.email);

    // Gera um token de recuperação
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    // Salva o token no banco
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    console.log('Token salvo no banco, preparando envio do email');

    // Envia o email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Recuperação de senha',
        text: `Para redefinir sua senha, acesse: ${resetUrl}`,
        html: `
          <p>Para redefinir sua senha, clique no link abaixo:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Este link é válido por 1 hora.</p>
        `,
      });
      console.log('Email enviado com sucesso para:', user.email);
      return NextResponse.json(
        {
          error: false,
          message: 'Email de recuperação enviado com sucesso!',
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      return NextResponse.json(
        {
          error: true,
          message: 'Erro ao enviar email de recuperação. Por favor, tente novamente mais tarde.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erro detalhado no processo:', {
      error,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: true,
        message: 'Erro ao processar solicitação',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
