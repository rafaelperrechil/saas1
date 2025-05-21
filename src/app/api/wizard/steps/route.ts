import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WizardStep } from '@/services/api.types';

const steps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo',
    description: 'Bem-vindo ao assistente de configuração',
    completed: false,
    order: 0,
  },
  {
    id: 'organization',
    title: 'Organização',
    description: 'Configure os dados da sua organização',
    completed: false,
    order: 1,
  },
  {
    id: 'branch',
    title: 'Unidade',
    description: 'Configure a unidade principal',
    completed: false,
    order: 2,
  },
  {
    id: 'departments',
    title: 'Departamentos',
    description: 'Configure os departamentos',
    completed: false,
    order: 3,
  },
  {
    id: 'environments',
    title: 'Ambientes',
    description: 'Configure os ambientes',
    completed: false,
    order: 4,
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    return NextResponse.json({
      data: steps,
      error: null,
    });
  } catch (error) {
    console.error('Erro ao buscar passos do wizard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar passos do wizard', data: null },
      { status: 500 }
    );
  }
}
