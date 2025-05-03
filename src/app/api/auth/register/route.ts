import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Dados obrigatórios faltando.' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: 'Email já cadastrado.' }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  // Buscar o perfil de Administrador
  const adminProfile = await prisma.profile.findFirst({ where: { name: 'Administrador' } });
  if (!adminProfile) {
    return NextResponse.json(
      { message: 'Perfil de Administrador não encontrado.' },
      { status: 500 }
    );
  }
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      profileId: adminProfile.id,
    },
  });
  return NextResponse.json({ success: true });
}
