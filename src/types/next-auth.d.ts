import 'next-auth';
import { Profile, Branch } from '@prisma/client';
import { DefaultSession } from 'next-auth';

interface Branch {
  id: string;
  name: string;
  wizardCompleted: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      profile: {
        name: string;
        id: string;
      };
      branch?: {
        id: string;
        name: string;
        wizardCompleted: boolean;
      };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    profile: Profile;
    branch?: Branch | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    profile: Profile;
    branch?: Branch;
  }
}
