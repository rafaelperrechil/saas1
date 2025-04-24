import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcryptjs from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Credenciais faltando');
            return null;
          }

          console.log('Buscando usuário:', credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              profile: true,
            },
          });

          if (!user) {
            console.log('Usuário não encontrado');
            return null;
          }

          console.log('Verificando senha');
          const passwordMatch = await bcryptjs.compare(credentials.password, user.password);

          if (!passwordMatch) {
            console.log('Senha incorreta');
            return null;
          }

          console.log('Login bem sucedido');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            profile: user.profile,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
};
