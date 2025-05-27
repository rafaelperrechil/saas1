const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes na ordem correta
  await prisma.ticketLabelOnTicket.deleteMany();
  await prisma.ticketStatusHistory.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketLabel.deleteMany();
  await prisma.checklistExecutionItem.deleteMany();
  await prisma.checklistExecution.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklistSection.deleteMany();
  await prisma.checklistUser.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.departmentResponsible.deleteMany();
  await prisma.department.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.loginLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.organizationUser.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.niche.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.checklistResponseType.deleteMany();

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

  console.log('Perfis criados com sucesso!');

  // Criar usuários
  console.log('Criando usuários...');
  const hashedPassword = await bcrypt.hash('123123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'rafaelperrechil@hotmail.com',
      name: 'Rafael Perrechil',
      password: hashedPassword,
      profileId: adminProfile.id,
    },
  });

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
    },
  });
  console.log('Organização criada com sucesso!');

  // Vincular usuários à organização via OrganizationUser
  console.log('Vinculando usuários à organização...');
  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      profileId: adminProfile.id, // Rafael é Admin nesta organização
    },
  });
  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: brunoUser.id,
      profileId: userProfile.id, // Bruno é User nesta organização
    },
  });
  console.log('Usuários vinculados à organização com sucesso!');

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
      maxChecklists: 3,
      extraUnitPrice: null,
      isCustom: false,
      maxInspections: 20,
      maxTickets: 20,
    },
    {
      name: 'Starter',
      price: 19,
      includedUnits: 1,
      maxUsers: 10,
      extraUserPrice: 5,
      maxChecklists: 15,
      extraUnitPrice: 19,
      isCustom: false,
      maxInspections: 150,
      maxTickets: 300,
    },
    {
      name: 'Business',
      price: 49,
      includedUnits: 1,
      maxUsers: 40,
      extraUserPrice: 4,
      maxChecklists: 50,
      extraUnitPrice: 29,
      isCustom: false,
      maxInspections: 500,
      maxTickets: 1500,
    },
    {
      name: 'Platinum',
      price: 129,
      includedUnits: 1,
      maxUsers: 100,
      extraUserPrice: 2,
      maxChecklists: 200,
      extraUnitPrice: 39,
      isCustom: false,
      maxInspections: 1500,
      maxTickets: 3500,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan,
    });
  }

  console.log('Planos criados com sucesso!');

  // Buscar o plano Free
  const freePlan = await prisma.plan.findFirst({
    where: {
      name: 'Free',
    },
  });

  if (!freePlan) {
    throw new Error('Plano Free não encontrado');
  }

  // Criar assinatura do plano Free para o usuário
  await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: freePlan.id,
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  console.log('Assinatura do plano Free criada com sucesso!');

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
      time: '08:00',
    },
  });
  console.log('Checklist criado com sucesso!');

  // Vincular Bruno ao checklist criado
  console.log('Vinculando Bruno ao checklist...');
  await prisma.checklistUser.create({
    data: {
      checklistId: checklist.id,
      userId: brunoUser.id,
    },
  });
  console.log('Bruno vinculado ao checklist com sucesso!');

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

  const createdItems = [];
  for (let i = 0; i < checklistItems.length; i++) {
    const item = await prisma.checklistItem.create({
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
    createdItems.push(item);
  }

  console.log('Itens do checklist criados com sucesso!');

  // Criar uma execução do checklist
  console.log('Criando execução do checklist...');
  const checklistExecution = await prisma.checklistExecution.create({
    data: {
      checklist: {
        connect: {
          id: checklist.id,
        },
      },
      performedBy: {
        connect: {
          id: brunoUser.id,
        },
      },
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  // Criar itens da execução
  console.log('Criando itens da execução...');
  for (const item of createdItems) {
    await prisma.checklistExecutionItem.create({
      data: {
        checklistExecution: {
          connect: {
            id: checklistExecution.id,
          },
        },
        checklistItem: {
          connect: {
            id: item.id,
          },
        },
        isPositive: ![1, 2].includes(createdItems.indexOf(item)), // as perguntas 2 e 3 são negativas
        note: [1, 2].includes(createdItems.indexOf(item))
          ? 'Problema identificado'
          : 'Item verificado e em conformidade',
      },
    });
  }

  // Marcar duas perguntas como negativas e criar tickets após execução criada
  const checklistItemsDb = await prisma.checklistItem.findMany({
    where: { checklistSectionId: section.id },
    orderBy: { position: 'asc' },
    include: { checklistSection: true },
  });

  const negativeItems = [checklistItemsDb[1], checklistItemsDb[2]];

  // Criar alguns ticket_labels
  const urgenteLabel = await prisma.ticketLabel.create({
    data: {
      name: 'Urgente',
      color: '#FF0000',
      organization: { connect: { id: organization.id } },
    },
  });
  const infraestruturaLabel = await prisma.ticketLabel.create({
    data: {
      name: 'Infraestrutura',
      color: '#1976D2',
      organization: { connect: { id: organization.id } },
    },
  });

  for (const item of negativeItems) {
    // Buscar a execução do checklist relacionada ao item
    const execution = await prisma.checklistExecution.findFirst({
      where: { checklistId: item.checklistSection.checklistId },
      orderBy: { startedAt: 'desc' },
    });

    if (!execution) {
      throw new Error(
        `Nenhuma execução encontrada para o checklistId: ${item.checklistSection.checklistId}`
      );
    }

    // Buscar o ChecklistExecutionItem correspondente ao item
    const executionItem = await prisma.checklistExecutionItem.findFirst({
      where: {
        checklistItemId: item.id,
        checklistExecutionId: execution.id,
      },
    });

    if (!executionItem) {
      throw new Error(
        `Nenhum ChecklistExecutionItem encontrado para itemId: ${item.id} e executionId: ${execution.id}`
      );
    }

    // Criar o ticket
    const ticket = await prisma.ticket.create({
      data: {
        title: `Problema: ${item.name}`,
        description: `Foi identificado um problema no item: ${item.name}`,
        status: 'OPEN',
        priority: 'HIGH',
        openedBy: { connect: { id: user.id } },
        organization: { connect: { id: organization.id } },
        branch: { connect: { id: branch.id } },
        environment: { connect: { id: escritorio01.id } },
        checklistExecution: { connect: { id: execution.id } },
        checklistExecutionItem: { connect: { id: executionItem.id } },
        labels: {
          create: [
            { label: { connect: { id: urgenteLabel.id } } },
            { label: { connect: { id: infraestruturaLabel.id } } },
          ],
        },
      },
    });

    // Adicionar um comentário ao ticket
    await prisma.ticketComment.create({
      data: {
        ticket: { connect: { id: ticket.id } },
        user: { connect: { id: user.id } },
        content: `Comentário automático: problema reportado em ${item.name}`,
      },
    });
  }

  // Criar filial Ubatuba
  console.log('Criando filial Ubatuba...');
  const branchUbatuba = await prisma.branch.create({
    data: {
      name: 'Ubatuba',
      wizardCompleted: true,
      organization: {
        connect: {
          id: organization.id,
        },
      },
    },
  });
  console.log('Filial Ubatuba criada com sucesso!');

  // Criar departamento Marketing na filial Ubatuba
  console.log('Criando departamento Marketing na filial Ubatuba...');
  await prisma.department.create({
    data: {
      name: 'Marketing',
      branch: {
        connect: {
          id: branchUbatuba.id,
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
  console.log('Departamento Marketing criado com sucesso!');

  console.log('#### SEGUNDO USUARIO ####');

  // ==== USUÁRIO FICTÍCIO DE HOTEL ====
  // Criar usuário gerente do hotel
  const hashedPasswordGerente = await bcrypt.hash('123123', 10);
  const gerenteHotel = await prisma.user.create({
    data: {
      email: 'gerente@hotelparaiso.com',
      name: 'Gerente Hotel Paraíso',
      password: hashedPasswordGerente,
      profileId: userProfile.id,
    },
  });

  // Criar organização Hotel Paraíso
  const hotelNiche = await prisma.niche.findFirst({ where: { name: 'Hotelaria e Turismo' } });
  const hotelOrg = await prisma.organization.create({
    data: {
      name: 'Hotel Paraíso',
      employeesCount: 10,
      country: 'Brasil',
      city: 'Rio de Janeiro',
      niche: { connect: { id: hotelNiche.id } },
    },
  });

  // Vincular gerente à organização
  await prisma.organizationUser.create({
    data: {
      organizationId: hotelOrg.id,
      userId: gerenteHotel.id,
      profileId: adminProfile.id,
    },
  });

  // Vincular o usuário principal à organização do Hotel Paraíso como perfil de usuário comum
  await prisma.organizationUser.create({
    data: {
      organizationId: hotelOrg.id,
      userId: user.id,
      profileId: userProfile.id, // perfil de usuário comum
    },
  });
  console.log('Usuário principal vinculado ao Hotel Paraíso como usuário!');

  // Criar filial Matriz Hotel Paraíso
  const hotelBranch = await prisma.branch.create({
    data: {
      name: 'Matriz Hotel Paraíso',
      wizardCompleted: true,
      organization: { connect: { id: hotelOrg.id } },
    },
  });

  // Criar departamento Recepção
  const hotelDept = await prisma.department.create({
    data: {
      name: 'Recepção',
      branch: { connect: { id: hotelBranch.id } },
      responsibles: {
        create: {
          user: { connect: { id: gerenteHotel.id } },
        },
      },
    },
  });

  // Criar ambiente Recepção Principal
  const hotelEnv = await prisma.environment.create({
    data: {
      name: 'Recepção Principal',
      branch: { connect: { id: hotelBranch.id } },
    },
  });

  // Criar checklist de recepção
  const checklistHotel = await prisma.checklist.create({
    data: {
      name: 'Checklist de Recepção',
      description: 'Checklist diário da recepção do hotel',
      branch: { connect: { id: hotelBranch.id } },
      environment: { connect: { id: hotelEnv.id } },
      actived: true,
      frequency: 'DAILY',
      daysOfWeek: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
      time: '07:00',
    },
  });

  // Vincular gerente ao checklist
  await prisma.checklistUser.create({
    data: {
      checklistId: checklistHotel.id,
      userId: gerenteHotel.id,
    },
  });

  // Criar seção do checklist
  const hotelSection = await prisma.checklistSection.create({
    data: {
      name: 'Recepção Geral',
      checklist: { connect: { id: checklistHotel.id } },
      position: 1,
    },
  });

  // Usar tipo de resposta Sim/Não já criado
  const simNaoType = responseTypes.find((rt) => rt.name === 'Sim/Não');

  // Criar itens do checklist
  const hotelChecklistItems = [
    'Balcão limpo e organizado?',
    'Computador ligado?',
    'Telefone funcionando?',
    'Material de registro disponível?',
    'Chaves organizadas?',
  ];
  for (let i = 0; i < hotelChecklistItems.length; i++) {
    await prisma.checklistItem.create({
      data: {
        name: hotelChecklistItems[i],
        description: null,
        checklistSection: { connect: { id: hotelSection.id } },
        position: i + 1,
        checklistResponseType: { connect: { id: simNaoType.id } },
        department: { connect: { id: hotelDept.id } },
        allowNotApplicable: true,
      },
    });
  }

  // Criar execução do checklist para o gerente do hotel
  console.log('Criando execução do checklist do Hotel Paraíso...');
  const checklistExecutionHotel = await prisma.checklistExecution.create({
    data: {
      checklist: { connect: { id: checklistHotel.id } },
      performedBy: { connect: { id: gerenteHotel.id } },
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  // Buscar os itens do checklist do hotel
  const createdHotelItems = await prisma.checklistItem.findMany({
    where: { checklistSectionId: hotelSection.id },
  });

  // Criar itens da execução
  for (const item of createdHotelItems) {
    await prisma.checklistExecutionItem.create({
      data: {
        checklistExecution: { connect: { id: checklistExecutionHotel.id } },
        checklistItem: { connect: { id: item.id } },
        isPositive: true,
        note: 'Item verificado e em conformidade',
      },
    });
  }

  console.log('Execução do checklist do Hotel Paraíso criada com sucesso!');

  console.log('Usuário fictício de hotel criado com sucesso!');

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
