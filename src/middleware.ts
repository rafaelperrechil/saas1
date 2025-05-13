import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Rotas públicas que não precisam passar pelo middleware
const publicRoutes = [
  '//',
  '/home',
  '/login',
  '/logout',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Rotas que não precisam verificar o wizard
const exemptRoutesPanel = ['/panel/wizard'];

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isLoginPage = pathname === '/login';
    const isAuthenticated = !!req.nextauth.token;
    const isPanelRoute = pathname.startsWith('/panel');

    // Permite acesso a rotas públicas
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redireciona usuário autenticado da página de login
    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/panel/dashboard', req.url));
    }

    // Verifica wizard apenas para rotas do painel
    if (isPanelRoute && isAuthenticated) {
      const token = req.nextauth.token as any;
      const branch = token.branch;

      // Se não está em uma rota isenta e o wizard não está completo, redireciona
      if (!exemptRoutesPanel.includes(pathname) && !branch?.wizardCompleted) {
        return NextResponse.redirect(new URL('/panel/wizard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Permite acesso a rotas públicas mesmo sem token
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }
        // Outras rotas precisam de autenticação
        return !!token;
      },
    },
  }
);

// Configurar quais rotas devem ser protegidas
// Qualquer rota que não esteja em publicRoutes e que precise de autenticação deve estar aqui
export const config = {
  matcher: [
    // Rotas do painel administrativo
    '/panel/:path*',

    // APIs protegidas (excluindo auth e verificação de email)
    '/api/((?!auth|check-email).*)',

    // Outras rotas protegidas específicas
    // '/pricing',
  ],
};
