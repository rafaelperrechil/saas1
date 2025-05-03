import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// Função para obter o IP real do usuário
function getClientIP(headersList: Headers): string {
  // Se estiver em localhost, retorna 127.0.0.1
  const host = headersList.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return '127.0.0.1';
  }

  // Lista de headers que podem conter o IP
  const ipHeaders = [
    'x-real-ip',
    'x-forwarded-for',
    'x-client-ip',
    'cf-connecting-ip',
    'true-client-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  // Tenta encontrar o IP em cada header
  for (const header of ipHeaders) {
    const ip = headersList.get(header);
    if (ip) {
      // Se houver múltiplos IPs (como em x-forwarded-for), pega o primeiro
      return ip.split(',')[0].trim();
    }
  }

  // Se não encontrar em nenhum header, retorna o host
  return host.split(':')[0] || '127.0.0.1';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true },
          });

          if (!user) {
            throw new Error('Email ou senha inválidos');
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error('Email ou senha inválidos');
          }

          // Registrar o login
          const headersList = headers();
          const userAgent = headersList.get('user-agent') || '';
          const ip = getClientIP(headersList);

          console.log('Detalhes do login:', {
            userId: user.id,
            userAgent,
            ip,
            host: headersList.get('host'),
            headers: Object.fromEntries(headersList.entries()),
          });

          await prisma.loginLog.create({
            data: {
              userId: user.id,
              userAgent,
              ip,
            },
          });

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            profile: user.profile,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.profile = user.profile;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.profile = token.profile;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
