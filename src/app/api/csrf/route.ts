import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/csrf';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const csrfToken = generateToken();

  return NextResponse.json({ csrfToken });
}
