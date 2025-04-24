import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const [totalUsers, totalProfiles] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProfiles,
      totalLogins: 0, // Implementar contagem de logins depois
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
