import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'fix-invalid-dates.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar o SQL
    await prisma.$executeRawUnsafe(sql);

    console.log('Datas inválidas corrigidas com sucesso!');
  } catch (error) {
    console.error('Erro ao corrigir datas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
