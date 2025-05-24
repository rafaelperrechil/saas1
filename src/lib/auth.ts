import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { AppProfile, AppBranch } from '@/types/next-auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

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
            console.log('[Auth] Credenciais faltando:', {
              email: !!credentials?.email,
              password: !!credentials?.password,
            });
            return null;
          }

          console.log('[Auth] Iniciando autenticação para:', credentials.email);

          // Buscar usuário no banco de dados
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              profile: true,
              organization: {
                include: {
                  branches: true,
                },
              },
            },
          });

          if (!user) {
            console.log('[Auth] Usuário não encontrado');
            return null;
          }

          console.log('[Auth] Usuário encontrado:', {
            id: user.id,
            hasProfile: !!user.profile,
            hasOrganization: !!user.organization,
            branchCount: user.organization?.branches.length || 0,
          });

          // Verificar e corrigir data inválida
          if (!user.updatedAt || user.updatedAt < new Date('2000-01-01')) {
            console.log('[Auth] Corrigindo data inválida para o usuário:', user.id);
            await prisma.user.update({
              where: { id: user.id },
              data: { updatedAt: new Date() },
            });
            user.updatedAt = new Date();
          }

          // Verificar senha
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.log('[Auth] Senha inválida para:', credentials.email);
            return null;
          }

          if (!user.profile) {
            console.log('[Auth] Perfil não encontrado para:', credentials.email);
            return null;
          }

          // Pega a primeira branch da organização (se existir)
          const branch = user.organization?.branches[0];

          console.log('[Auth] Login bem sucedido:', {
            userId: user.id,
            hasBranch: !!branch,
            branchId: branch?.id,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            profile: user.profile as AppProfile,
            branch: branch || undefined,
          };
        } catch (error) {
          console.error('[Auth] Erro na autenticação:', error);
          if (error instanceof Error) {
            console.error('[Auth] Detalhes do erro:', {
              message: error.message,
              stack: error.stack,
            });
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        console.log('[Auth] Atualizando token com dados do usuário:', {
          userId: user.id,
          hasProfile: !!user.profile,
          hasBranch: !!user.branch,
        });
        token.id = user.id;
        token.profile = user.profile;
        token.branch = user.branch || undefined;
      }

      if (trigger === 'update' && session?.user?.branch) {
        console.log('[Auth] Atualizando branch no token');
        token.branch = session.user.branch;
      }

      return token;
    },
    async session({ session, token }) {
      // console.log('[Auth] Atualizando sessão com dados do token:', {
      //   userId: token.id,
      //   hasProfile: !!token.profile,
      //   hasBranch: !!token.branch,
      // });

      session.user = {
        ...session.user,
        id: token.id as string,
        profile: token.profile as AppProfile,
        branch: token.branch as AppBranch | undefined,
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
  debug: true, // Ativando debug para mais informações
};
