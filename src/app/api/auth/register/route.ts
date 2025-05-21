import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Dados obrigatórios faltando.' }, { status: 400 });
    }

    const response = await userService.registerUser({ name, email, password });
    if (response.error) {
      return NextResponse.json({ message: response.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
