import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configuração do transporter do Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use a senha de aplicativo do Gmail
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log('Iniciando processo de recuperação para:', email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Usuário não encontrado:', email);
      return NextResponse.json(
        { message: 'Se o email existir em nossa base, você receberá as instruções de recuperação' },
        { status: 200 }
      );
    }

    // Gerar token de recuperação
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    console.log('Token gerado:', resetToken);

    // Salvar o token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    console.log('Token salvo no banco de dados');

    // Enviar email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    console.log('Link de recuperação:', resetLink);

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
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
      };

      console.log('Tentando enviar email com dados:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', info.messageId);

      return NextResponse.json(
        { message: 'Email de recuperação enviado com sucesso' },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error('Erro detalhado ao enviar email:', {
        error: emailError,
        message: emailError.message,
        stack: emailError.stack,
      });
      return NextResponse.json(
        {
          message: 'Erro ao enviar email de recuperação',
          error: emailError.message,
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
        message: 'Erro ao processar solicitação',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
