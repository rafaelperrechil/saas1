import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Buscar dados do perfil do usuário
export async function GET() {
  try {
    console.log('Iniciando busca do perfil do usuário');
    const session = await getServerSession(authOptions);
    console.log('Sessão obtida:', session ? 'Sessão ativa' : 'Sem sessão');

    if (!session?.user?.id) {
      console.log('Usuário não autenticado ou sem ID');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('ID do usuário:', userId);

    try {
      // Buscar dados do usuário diretamente com SQL bruto
      console.log('Tentando buscar usuário com SQL bruto');

      // Consulta SQL personalizada para obter todos os campos, incluindo company e phone
      const users = await prisma.$queryRaw`
        SELECT id, name, email, company, phone 
        FROM users 
        WHERE id = ${userId}
      `;

      const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
      console.log('Resultado da busca:', user ? 'Usuário encontrado' : 'Usuário não encontrado');

      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      // Retornar todos os dados disponíveis
      return NextResponse.json(user);
    } catch (dbError: any) {
      console.error('Erro ao consultar o banco de dados:', dbError);

      // Fallback para o método tradicional do Prisma
      try {
        const defaultUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        return NextResponse.json({
          id: defaultUser?.id,
          name: defaultUser?.name,
          email: defaultUser?.email,
          company: '',
          phone: '',
        });
      } catch (fallbackErr) {
        console.error('Erro no método fallback durante a consulta:', fallbackErr);
        return NextResponse.json(
          { error: `Erro na consulta ao banco de dados: ${dbError.message}` },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Erro ao buscar perfil de usuário:', error);
    return NextResponse.json(
      {
        error: `Erro ao buscar dados do usuário: ${error.message || 'Erro desconhecido'}`,
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do perfil do usuário
export async function PUT(request: Request) {
  try {
    console.log('Iniciando atualização do perfil do usuário');
    const session = await getServerSession(authOptions);
    console.log('Sessão obtida:', session ? 'Sessão ativa' : 'Sem sessão');

    if (!session?.user?.id) {
      console.log('Usuário não autenticado ou sem ID');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('ID do usuário:', userId);

    const data = await request.json();
    console.log('Dados recebidos:', data);

    // Validar dados recebidos
    const { name, company, phone } = data;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    try {
      // Tentar atualizar com o Prisma normal primeiro
      console.log('Tentando atualizar nome com Prisma');
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
      });

      // Tentar atualizar company e phone com SQL bruto
      console.log('Tentando atualizar company e phone com SQL bruto');
      await prisma.$executeRaw`
        UPDATE users 
        SET company = ${company || null}, phone = ${phone || null} 
        WHERE id = ${userId}
      `;

      console.log('Usuário atualizado com sucesso (nome via Prisma, company/phone via SQL)');

      // Buscar o usuário atualizado
      const users = await prisma.$queryRaw`
        SELECT id, name, email, company, phone 
        FROM users 
        WHERE id = ${userId}
      `;

      const updatedFullUser =
        Array.isArray(users) && users.length > 0
          ? users[0]
          : {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              company: company || '',
              phone: phone || '',
            };

      return NextResponse.json(updatedFullUser);
    } catch (dbError: any) {
      console.error('Erro ao atualizar o usuário no banco de dados:', dbError);

      // Fallback: retornar apenas com o nome atualizado
      try {
        const defaultUpdate = await prisma.user.update({
          where: { id: userId },
          data: { name },
        });

        return NextResponse.json({
          id: defaultUpdate.id,
          name: defaultUpdate.name,
          email: defaultUpdate.email,
          company: company || '',
          phone: phone || '',
          message: 'Apenas o nome foi atualizado. Ocorreu um erro ao atualizar empresa e telefone.',
        });
      } catch (fallbackErr) {
        console.error('Erro no método fallback durante a atualização:', fallbackErr);
        return NextResponse.json(
          { error: `Erro na atualização do banco de dados: ${dbError.message}` },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Erro ao atualizar perfil de usuário:', error);
    return NextResponse.json(
      {
        error: `Erro ao atualizar dados do usuário: ${error.message || 'Erro desconhecido'}`,
      },
      { status: 500 }
    );
  }
}
