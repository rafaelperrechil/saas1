import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Iniciando busca de nichos...');

    const session = await getServerSession(authOptions);
    console.log('Sessão:', session ? 'Encontrada' : 'Não encontrada');

    if (!session?.user?.id) {
      console.log('Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('Verificando conexão com o banco de dados...');
    try {
      await prisma.$connect();
      console.log('Conexão com o banco de dados estabelecida');
    } catch (error) {
      console.error('Erro ao conectar com o banco de dados:', error);
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 });
    }

    console.log('Buscando nichos no banco de dados...');
    try {
      const niches = await prisma.niche.findMany({
        orderBy: {
          name: 'asc',
        },
      });
      console.log(`Encontrados ${niches.length} nichos`);
      return NextResponse.json(niches);
    } catch (error) {
      console.error('Erro ao buscar nichos:', error);
      return NextResponse.json(
        {
          error: 'Erro ao buscar nichos',
          details: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
      console.log('Conexão com o banco de dados encerrada');
    }
  } catch (error) {
    console.error('Erro detalhado ao buscar nichos:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar nichos',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
