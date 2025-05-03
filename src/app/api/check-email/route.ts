import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ exists: false });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  return NextResponse.json({ exists: !!user });
}
