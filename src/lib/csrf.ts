// Lista de rotas que não precisam de proteção CSRF
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/check-email',
  '/api/plans',
];

// Função para gerar um token aleatório compatível com Edge Runtime
function generateRandomToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateToken() {
  return generateRandomToken();
}

export function verifyToken(token: string) {
  if (!token) return false;
  return token.length === 64; // Verifica se o token tem o tamanho correto
}

export async function csrfMiddleware(req: Request) {
  // Ignora métodos GET e HEAD
  if (req.method === 'GET' || req.method === 'HEAD') {
    return true;
  }

  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some((route) => req.url.includes(route));
  if (isPublicRoute) {
    return true;
  }

  // Obtém o token do cabeçalho
  const csrfToken = req.headers.get('x-csrf-token');

  // Se não houver token, bloqueia a requisição
  if (!csrfToken) {
    return false;
  }

  // Verifica se o token é válido
  return verifyToken(csrfToken);
}
