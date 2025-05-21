import { NextResponse } from 'next/server';
import { userService } from '@/services';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token e senha são obrigatórios' }, { status: 400 });
    }

    const response = await userService.resetPassword(token, password);
    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json({ message: 'Senha redefinida com sucesso' }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
