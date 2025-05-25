import 'next-auth';
// import { Profile, Branch } from '@prisma/client'; // Comentado ou removido se Profile do Prisma não for o desejado aqui
import { DefaultSession } from 'next-auth';

// Definindo os tipos que serão usados na sessão e JWT
// Este Profile corresponde ao de api.types.ts ou ao que authService.login efetivamente retorna
interface AppProfile {
  id: string;
  name: string;
}

// Ajustando AppBranch para corresponder ao que authService.login retorna
interface AppBranch {
  id: string;
  name: string;
  organizationId: string;
  environments?: Array<{
    id: string;
    name: string;
    position: number;
  }>;
  // wizardCompleted é opcional já que não vem do authService.login
  wizardCompleted?: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      profile: AppProfile; // Usar o tipo AppProfile definido localmente
      branch?: AppBranch;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    profile: AppProfile; // Usar o tipo AppProfile definido localmente
    branch?: AppBranch | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    profile: AppProfile; // Usar o tipo AppProfile definido localmente
    branch?: AppBranch; // Presumindo que Branch aqui também é AppBranch
  }
}
