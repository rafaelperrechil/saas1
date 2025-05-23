const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes na ordem correta
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.departmentResponsible.deleteMany();
  await prisma.department.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.loginLog.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.niche.deleteMany();
  await prisma.plan.deleteMany();

  // Criar perfis
  console.log('Criando perfis...');
  const adminProfile = await prisma.profile.create({
    data: {
      name: 'Administrador',
    },
  });
  const userProfile = await prisma.profile.create({
    data: {
      name: 'User',
    },
  });

  //const userProfile = await prisma.profile.findFirst({ where: { name: 'Usuário' } });

  console.log('Perfis criados com sucesso!');

  // Criar usuário
  console.log('Criando usuário...');
  const hashedPassword = await bcrypt.hash('123123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'rafaelperrechil@hotmail.com',
      name: 'Rafael Perrechil',
      password: hashedPassword,
      profileId: userProfile.id,
    },
  });

  // Criar usuário Bruno
  console.log('Criando usuário Bruno...');
  const hashedPasswordBruno = await bcrypt.hash('123123', 10);
  const brunoUser = await prisma.user.create({
    data: {
      email: 'bruno@bol.com',
      name: 'Bruno',
      password: hashedPasswordBruno,
      profileId: userProfile.id,
    },
  });

  console.log('Usuáriso criados com sucesso!');

  // Criar nichos
  console.log('Criando nichos...');
  const niches = [
    { name: 'Indústria Alimentícia', description: 'Empresas do setor alimentício' },
    { name: 'Indústria Farmacêutica', description: 'Empresas do setor farmacêutico' },
    { name: 'Indústria Automotiva', description: 'Empresas do setor automotivo' },
    { name: 'Construção Civil', description: 'Empresas do setor de construção' },
    { name: 'Saúde', description: 'Empresas do setor de saúde' },
    { name: 'Educação', description: 'Empresas do setor educacional' },
    { name: 'Varejo', description: 'Empresas do setor varejista' },
    { name: 'Logística', description: 'Empresas do setor logístico' },
    { name: 'Tecnologia', description: 'Empresas do setor de tecnologia' },
    { name: 'Serviços Financeiros', description: 'Empresas do setor financeiro' },
    { name: 'Agronegócio', description: 'Empresas do setor agrícola' },
    { name: 'Hotelaria e Turismo', description: 'Empresas do setor hoteleiro e turístico' },
    { name: 'Energia', description: 'Empresas do setor energético' },
    { name: 'Telecomunicações', description: 'Empresas do setor de telecomunicações' },
    { name: 'Mineração', description: 'Empresas do setor de mineração' },
  ];

  for (const niche of niches) {
    await prisma.niche.upsert({
      where: { name: niche.name },
      update: { description: niche.description },
      create: niche,
    });
  }
  console.log('Nichos criados com sucesso!');

  // Criar organização
  console.log('Criando organização...');
  const technologyNiche = await prisma.niche.findFirst({
    where: {
      name: 'Tecnologia',
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: 'DEV House',
      employeesCount: 1,
      country: 'Brasil',
      city: 'São Paulo',
      niche: {
        connect: {
          id: technologyNiche.id,
        },
      },
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  console.log('Organização criada com sucesso!');

  // Atualizar usuários com a organização
  console.log('Atualizando usuários com a organização...');
  await prisma.user.update({
    where: { email: 'rafaelperrechil@hotmail.com' },
    data: {
      organizationId: organization.id,
    },
  });

  await prisma.user.update({
    where: { email: 'bruno@bol.com' },
    data: {
      organizationId: organization.id,
    },
  });
  console.log('Usuários atualizados com sucesso!');

  // Criar filial
  console.log('Criando filial...');
  const branch = await prisma.branch.create({
    data: {
      name: 'Ilhabela',
      wizardCompleted: true,
      organization: {
        connect: {
          id: organization.id,
        },
      },
    },
  });
  console.log('Filial criada com sucesso!');

  // Criar departamento
  console.log('Criando departamento...');
  const department = await prisma.department.create({
    data: {
      name: 'TI',
      branch: {
        connect: {
          id: branch.id,
        },
      },
      responsibles: {
        create: {
          user: {
            connect: {
              id: brunoUser.id,
            },
          },
        },
      },
    },
  });
  console.log('Departamento criado com sucesso!');

  // Criar ambientes
  console.log('Criando ambientes...');
  const environments = ['Sala', 'Escritorio 01'];
  for (const envName of environments) {
    await prisma.environment.create({
      data: {
        name: envName,
        branch: {
          connect: {
            id: branch.id,
          },
        },
      },
    });
  }
  console.log('Ambientes criados com sucesso!');

  // Criar planos
  console.log('Criando planos...');
  const plans = [
    {
      name: 'Free',
      price: 0,
      includedUnits: 1,
      maxUsers: 2,
      extraUserPrice: null,
      maxChecklists: 1,
      extraUnitPrice: null,
      isCustom: false,
    },
    {
      name: 'Starter',
      price: 49,
      includedUnits: 1,
      maxUsers: 5,
      extraUserPrice: 9,
      maxChecklists: 5,
      extraUnitPrice: 19,
      isCustom: false,
    },
    {
      name: 'Business',
      price: 119,
      includedUnits: 1,
      maxUsers: 15,
      extraUserPrice: 7,
      maxChecklists: 15,
      extraUnitPrice: 29,
      isCustom: false,
    },
    {
      name: 'Platinum',
      price: 249,
      includedUnits: 1,
      maxUsers: 50,
      extraUserPrice: 5,
      maxChecklists: null, // Ilimitado
      extraUnitPrice: 49,
      isCustom: false,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan,
    });
  }

  console.log('Planos criados com sucesso!');

  console.log('Criando tipos de resposta...');
  const responseTypesData = [
    {
      name: 'Sim/Não',
      positiveLabel: 'Sim',
      negativeLabel: 'Não',
      description: 'Resposta padrão Sim ou Não',
    },
    {
      name: 'Conforme/Não Conforme',
      positiveLabel: 'Conforme',
      negativeLabel: 'Não Conforme',
      description: 'Verificar se o item está em conformidade',
    },
    {
      name: 'Funcionando/Com Defeito',
      positiveLabel: 'Funcionando',
      negativeLabel: 'Com Defeito',
      description: 'Verificar se o item está operando corretamente',
    },
    {
      name: 'Limpo/Sujo',
      positiveLabel: 'Limpo',
      negativeLabel: 'Sujo',
      description: 'Avaliar condições de limpeza',
    },
    {
      name: 'Presente/Ausente',
      positiveLabel: 'Presente',
      negativeLabel: 'Ausente',
      description: 'Checar se o item está disponível ou ausente',
    },
  ];

  const responseTypes = [];

  for (const type of responseTypesData) {
    const createdType = await prisma.checklistResponseType.create({
      data: type,
    });
    responseTypes.push(createdType);
  }

  console.log('Tipos de resposta criados com sucesso!');

  // Buscar ambiente 'Escritorio 01'
  const escritorio01 = await prisma.environment.findFirst({
    where: {
      name: 'Escritorio 01',
    },
  });

  if (!escritorio01) {
    throw new Error('Ambiente "Escritorio 01" não encontrado');
  }

  // Criar checklist
  console.log('Criando checklist...');
  const checklist = await prisma.checklist.create({
    data: {
      name: 'Checklist de Inspeção - Escritorio 01',
      description: 'Checklist padrão de inspeção para o escritório 01',
      branch: {
        connect: {
          id: branch.id,
        },
      },
      environment: {
        connect: {
          id: escritorio01.id,
        },
      },
      actived: true,
      frequency: 'DAILY',
      daysOfWeek: JSON.stringify([1, 2, 3, 4, 5]), // Segunda a Sexta
      time: '08:00'
    },
  });
  console.log('Checklist criado com sucesso!');

  // Criar seção
  console.log('Criando seção...');
  const section = await prisma.checklistSection.create({
    data: {
      name: 'Checklist Geral',
      checklist: {
        connect: {
          id: checklist.id,
        },
      },
      position: 1,
    },
  });
  console.log('Seção criada com sucesso!');

  // Criar itens do checklist
  console.log('Criando itens do checklist...');
  const checklistItems = [
    'Computadores estão funcionando?',
    'Internet está operando normalmente?',
    'Ar-condicionado funcionando?',
    'Mesa de trabalho limpa?',
    'Luzes funcionando corretamente?',
  ];

  const simNaoResponseType = responseTypes.find((rt) => rt.name === 'Sim/Não');
  if (!simNaoResponseType) {
    throw new Error('Tipo de resposta "Sim/Não" não encontrado');
  }

  for (let i = 0; i < checklistItems.length; i++) {
    await prisma.checklistItem.create({
      data: {
        name: checklistItems[i],
        description: null,
        checklistSection: {
          connect: {
            id: section.id,
          },
        },
        position: i + 1,
        checklistResponseType: {
          connect: {
            id: simNaoResponseType.id,
          },
        },
        department: {
          connect: {
            id: department.id,
          },
        },
        allowNotApplicable: true,
      },
    });
  }

  console.log('Itens do checklist criados com sucesso!');

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
