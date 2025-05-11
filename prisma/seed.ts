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
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.niche.deleteMany();
  await prisma.plan.deleteMany();

  // Criar perfis
  console.log('Criando perfis...');
  const adminProfile = await prisma.profile.create({
    data: {
      name: 'Administrador',
    },
  });

  const userProfile = await prisma.profile.findFirst({ where: { name: 'Usuário' } });

  console.log('Perfis criados com sucesso!');

  // Criar usuário
  console.log('Criando usuário...');
  const hashedPassword = await bcrypt.hash('123123', 10);

  await prisma.user.create({
    data: {
      email: 'rafaelperrechil@hotmail.com',
      name: 'Rafael Perrechil',
      password: hashedPassword,
      profileId: adminProfile.id,
    },
  });

  console.log('Usuário criado com sucesso!');

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
      name: 'Enterprise',
      price: 249,
      includedUnits: 1,
      maxUsers: 50,
      extraUserPrice: 5,
      maxChecklists: null, // Ilimitado
      extraUnitPrice: 49,
      isCustom: false,
    },
    {
      name: 'Platinum',
      price: 0, // Sob consulta
      includedUnits: 999999, // Praticamente ilimitado
      maxUsers: 999999, // Praticamente ilimitado
      extraUserPrice: 0, // Incluído
      maxChecklists: null, // Ilimitado
      extraUnitPrice: 0, // Incluído
      isCustom: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan,
    });
  }

  console.log('Planos criados com sucesso!');

  const niches = [
    { name: 'Indústria Alimentícia' },
    { name: 'Indústria Farmacêutica' },
    { name: 'Indústria Automotiva' },
    { name: 'Construção Civil' },
    { name: 'Saúde' },
    { name: 'Educação' },
    { name: 'Varejo' },
    { name: 'Logística' },
    { name: 'Tecnologia' },
    { name: 'Serviços Financeiros' },
    { name: 'Agronegócio' },
    { name: 'Hotelaria e Turismo' },
    { name: 'Energia' },
    { name: 'Telecomunicações' },
    { name: 'Mineração' },
  ];

  for (const niche of niches) {
    await prisma.niche.upsert({
      where: { name: niche.name },
      update: {},
      create: niche,
    });
  }

  console.log('Nichos de mercado inseridos com sucesso!');

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
