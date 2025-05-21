import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { webhookService } from '@/services';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature') || '';

  try {
    const response = await webhookService.handleWebhookEvent(body, signature);
    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar evento do webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
