import { NextResponse } from 'next/server';
import { userService } from '@/services';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log('Iniciando processo de recuperação para:', email);

    const response = await userService.forgotPassword(email);
    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json(
      { message: 'Se o email existir em nossa base, você receberá as instruções de recuperação' },
      { status: 200 }
    );
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
