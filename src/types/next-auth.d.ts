import 'next-auth';
import { Profile } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      profile: Profile;
    };
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
