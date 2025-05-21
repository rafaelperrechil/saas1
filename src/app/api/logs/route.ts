import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logService } from '@/services';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const response = await logService.getLoginLogs();
    if (response.error) {
      throw new Error(response.error);
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de logins' }, { status: 500 });
  }
}
