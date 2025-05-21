import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkoutService } from '@/services';

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await checkoutService.createCheckoutSession(session.user.id, planId);
    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json({ url: response.data.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout' }, { status: 500 });
  }
}
