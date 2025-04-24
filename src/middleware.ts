import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isLoginPage = req.nextUrl.pathname === '/login';
    const isAuthenticated = !!req.nextauth.token;

    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso público ao /login
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // Exigir autenticação para outras rotas
        return !!token;
      },
    },
  }
);

// Configurar quais rotas devem ser protegidas
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
