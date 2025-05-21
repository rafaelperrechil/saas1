import { NextResponse } from 'next/server';
import { userService } from '@/services';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const response = await userService.loginUser({
      email,
      password,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
