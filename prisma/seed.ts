const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
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
