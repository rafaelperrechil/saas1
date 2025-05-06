// Uso a configuração unificada de NextAuth de src/lib/auth.ts
import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
