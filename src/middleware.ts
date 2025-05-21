import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { generateToken, csrfMiddleware } from './lib/csrf';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas que não precisam passar pelo middleware
const publicRoutes = [
  '//',
  '/home',
  '/login',
  '/logout',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/pricing',
];

// Rotas que não precisam verificar o wizard
const exemptRoutesPanel = ['/panel/wizard'];

// Rotas de API que são públicas
const publicApiRoutes = ['/api/auth', '/api/check-email', '/api/plans'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Se não estiver autenticado, redireciona para o login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver na página do wizard, verifica se já completou
  if (request.nextUrl.pathname === '/panel/wizard') {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/organization/completed-wizard`, {
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || '',
        },
      });

      const data = await response.json();

      if (data.data?.hasCompletedWizard) {
        return NextResponse.redirect(new URL('/panel/dashboard', request.url));
      }
    } catch (error) {
      console.error('Erro ao verificar status do wizard:', error);
    }
  }

  return NextResponse.next();
}

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));
    const isLoginPage = pathname === '/login';
    const isAuthenticated = !!req.nextauth.token;
    const isPanelRoute = pathname.startsWith('/panel');
    const isApiRoute = pathname.startsWith('/api');

    // Se for uma rota de API que precisa de CSRF
    if (isApiRoute && !isPublicApiRoute && req.method !== 'GET') {
      const isValid = await csrfMiddleware(req);
      if (!isValid) {
        return NextResponse.json(
          { error: 'CSRF token inválido ou não fornecido' },
          { status: 403 }
        );
      }
    }

    // Permite acesso a rotas públicas
    if (isPublicRoute || isPublicApiRoute) {
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

    // Adiciona o CSRF token no header da resposta para rotas autenticadas
    const response = NextResponse.next();
    if (isAuthenticated && !isPublicRoute) {
      response.headers.set('x-csrf-token', generateToken());
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Permite acesso a rotas públicas mesmo sem token
        if (
          publicRoutes.some((route) => pathname.startsWith(route)) ||
          publicApiRoutes.some((route) => pathname.startsWith(route))
        ) {
          return true;
        }
        // Outras rotas precisam de autenticação
        return !!token;
      },
    },
  }
);

// Configurar quais rotas devem ser protegidas
export const config = {
  matcher: [
    // Rotas do painel administrativo
    '/panel/:path*',

    // APIs protegidas (excluindo auth, verificação de email e plans)
    '/api/((?!auth|check-email|plans).*)',
  ],
};
