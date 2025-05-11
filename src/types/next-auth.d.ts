import 'next-auth';
import { Profile } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      wizardCompleted: boolean;
      profile: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
      };
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    profile: Profile;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    profile: Profile;
  }
}
