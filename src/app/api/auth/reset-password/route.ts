import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

const messages = {
  pt: {
    required: 'Token, senha e confirmação de senha são obrigatórios',
    passwordMismatch: 'As senhas não coincidem',
    invalidToken: 'Token inválido',
    expiredToken: 'O link de redefinição de senha é inválido ou expirou.',
    success: 'Senha redefinida com sucesso!',
    generic: 'Erro ao redefinir senha',
  },
  en: {
    required: 'Token, password and password confirmation are required',
    passwordMismatch: 'Passwords do not match',
    invalidToken: 'Invalid token',
    expiredToken: 'The password reset link is invalid or has expired.',
    success: 'Password reset successfully!',
    generic: 'Error resetting password',
  },
  es: {
    required: 'Se requieren token, contraseña y confirmación de contraseña',
    passwordMismatch: 'Las contraseñas no coinciden',
    invalidToken: 'Token inválido',
    expiredToken: 'El enlace de restablecimiento de contraseña es inválido o ha expirado.',
    success: '¡Contraseña restablecida con éxito!',
    generic: 'Error al restablecer la contraseña',
  },
};

export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword, lang = 'pt' } = await request.json();
    console.log('Iniciando redefinição de senha com token:', token);

    // Seleciona o idioma das mensagens (padrão: português)
    const t = messages[lang as keyof typeof messages] || messages.pt;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        {
          error: true,
          message: t.required,
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error: true,
          message: t.passwordMismatch,
        },
        { status: 400 }
      );
    }

    // Busca o token de redefinição
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      console.log('Token não encontrado:', token);
      return NextResponse.json(
        {
          error: true,
          message: t.invalidToken,
        },
        { status: 400 }
      );
    }

    // Verifica se o token expirou
    if (resetToken.expiresAt < new Date()) {
      console.log('Token expirado:', token);
      // Remove o token expirado
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        {
          error: true,
          message: t.expiredToken,
        },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hash(password, 10);

    // Atualiza a senha do usuário e o token em uma única transação
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Remove o token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    console.log('Senha redefinida com sucesso para o usuário:', resetToken.user.email);

    return NextResponse.json(
      {
        error: false,
        message: t.success,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      {
        error: true,
        message: error.message || messages.pt.generic,
      },
      { status: 500 }
    );
  }
}
