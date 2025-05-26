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
        branchId: { label: 'BranchId', type: 'text', optional: true },
        trigger: { label: 'Trigger', type: 'text', optional: true },
      },
      async authorize(credentials, _req) {
        try {
          // Se for uma atualização de sessão (trigger: 'update'), não precisa de senha
          if (credentials?.trigger === 'update' && credentials?.email) {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
              include: {
                profile: true,
              },
            });

            if (!user) {
              console.log('[Auth] Usuário não encontrado na atualização');
              return null;
            }

            // Buscar todas as organizações do usuário via OrganizationUser
            const orgUsers = await prisma.organizationUser.findMany({
              where: { userId: user.id },
              include: {
                organization: {
                  include: {
                    branches: true,
                  },
                },
                profile: true,
              },
            });

            // Montar lista de organizações com branches e perfil do usuário em cada
            const organizations = orgUsers.map((orgUser) => ({
              id: orgUser.organization.id,
              name: orgUser.organization.name,
              profile: orgUser.profile,
              branches: orgUser.organization.branches.map((branch) => ({
                id: branch.id,
                name: branch.name,
                organizationId: orgUser.organization.id,
                wizardCompleted: branch.wizardCompleted,
              })),
            }));

            // Encontrar a organização e branch selecionados
            const selectedBranchId = credentials.branchId;
            let selectedBranch = null;
            let selectedOrg = null;
            for (const org of organizations) {
              const found = org.branches.find(b => b.id === selectedBranchId);
              if (found) {
                selectedBranch = found;
                selectedOrg = org;
                break;
              }
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name || '',
              profile: user.profile,
              organizations,
              organization: selectedOrg,
              branch: selectedBranch,
            } as any;
          }

          // Autenticação normal (login)
          if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Credenciais faltando:', {
              email: !!credentials?.email,
              password: !!credentials?.password,
            });
            return null;
          }

          //console.log('[Auth] Iniciando autenticação para:', credentials.email);

          // Buscar usuário no banco de dados
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              profile: true,
            },
          });

          if (!user) {
            console.log('[Auth] Usuário não encontrado');
            return null;
          }

          // console.log('[Auth] Usuário encontrado:', {
          //   id: user.id,
          //   hasProfile: !!user.profile,
          //   hasOrganization: !!user.organization,
          //   branchCount: user.organization?.branches.length || 0,
          // });

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

          if (!user?.profile) {
            console.log('[Auth] Perfil não encontrado para:', credentials.email);
            return null;
          }

          // Buscar todas as organizações do usuário via OrganizationUser
          const orgUsers = await prisma.organizationUser.findMany({
            where: { userId: user.id },
            include: {
              organization: {
                include: {
                  branches: true,
                },
              },
              profile: true,
            },
          });

          // Montar lista de organizações com branches e perfil do usuário em cada
          const organizations = orgUsers.map((orgUser) => ({
            id: orgUser.organization.id,
            name: orgUser.organization.name,
            profile: orgUser.profile, // perfil do usuário nesta organização
            branches: orgUser.organization.branches.map((branch) => ({
              id: branch.id,
              name: branch.name,
              organizationId: orgUser.organization.id,
              wizardCompleted: branch.wizardCompleted,
            })),
          }));

          // Selecionar organização e branch padrão (primeira da lista)
          const defaultOrg = organizations[0];
          const defaultBranch = defaultOrg?.branches[0];

          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            profile: user.profile as AppProfile,
            organizations,
            organization: defaultOrg,
            branch: defaultBranch,
          } as any;
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
        token.id = user.id;
        token.profile = user.profile;
        (token as any).organizations = (user as any).organizations;
        (token as any).organization = (user as any).organization;
        token.branch = (user as any).branch || undefined;
      }

      if (trigger === 'update' && session?.user?.branch) {
        token.branch = session.user.branch;
        (token as any).organization = (session.user as any).organization;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        profile: token.profile as AppProfile,
        organizations: (token as any).organizations,
        organization: (token as any).organization,
        branch: token.branch as AppBranch | undefined,
      } as any;
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
