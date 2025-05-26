import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Buscar todas as organizações do usuário via OrganizationUser
    const orgUsers = await prisma.organizationUser.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: {
            branches: true,
          },
        },
        profile: true,
      },
    });

    if (!orgUsers || orgUsers.length === 0) {
      return NextResponse.json({ error: 'Nenhuma organização encontrada para o usuário' }, { status: 404 });
    }

    // Montar resposta: lista de organizações com branches e perfil do usuário em cada
    const organizations = orgUsers.map((orgUser) => ({
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      profile: orgUser.profile, // perfil do usuário nesta organização
      branches: orgUser.organization.branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        wizardCompleted: branch.wizardCompleted,
      })),
    }));

    return NextResponse.json({ data: organizations });
  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    return NextResponse.json({ error: 'Erro ao buscar filiais' }, { status: 500 });
  }
}
