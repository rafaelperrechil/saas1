import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se o perfil de Administrador já existe
    const existingAdminProfile = await prisma.profile.findFirst({
      where: { name: 'Administrador' },
    });

    // Criar o perfil de Administrador se não existir
    const adminProfile = existingAdminProfile
      ? existingAdminProfile
      : await prisma.profile.create({
          data: {
            name: 'Administrador',
          },
        });

    console.log('Perfil de Administrador criado:', adminProfile);

    // Criar o usuário admin se não existir
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        profileId: adminProfile.id,
      },
    });

    console.log('Usuário admin criado:', adminUser);
    console.log('Credenciais:');
    console.log('Email: admin@example.com');
    console.log('Senha: admin123');
  } catch (error) {
    console.error('Erro ao criar usuário inicial:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
