import { NextResponse } from 'next/server';
import { userService } from '@/services';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const response = await userService.getUserByEmail(email);
    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json({ exists: !!response.data });
  } catch (err) {
    console.error('Erro ao verificar e-mail:', err);
    return NextResponse.json(
      { exists: false, error: 'Erro ao verificar e-mail.' },
      { status: 500 }
    );
  }
}
