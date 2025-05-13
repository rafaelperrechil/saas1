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
      async authorize(credentials, _req) {
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
              organization: {
                include: {
                  branches: {
                    take: 1,
                  },
                },
              },
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

          // Pega a primeira branch da organização (se existir)
          const branch = user.organization?.branches[0];

          console.log('Login bem sucedido');
          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            profile: user.profile,
            branch: branch || undefined,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.profile = user.profile;
        token.branch = user.branch;
      }

      // Se a sessão foi atualizada, atualiza o token também
      if (trigger === 'update' && session?.user?.branch) {
        token.branch = session.user.branch;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        profile: token.profile as typeof token.profile,
        branch: token.branch as typeof token.branch,
      };
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
