import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useCsrf() {
  const { data: session } = useSession();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Só busca o token se houver uma sessão ativa
    if (session) {
      // Função para buscar o token CSRF
      const fetchCsrfToken = async () => {
        try {
          const response = await fetch('/api/csrf');
          if (response.ok) {
            const data = await response.json();
            setCsrfToken(data.csrfToken);
          }
        } catch (error) {
          console.error('Erro ao buscar CSRF token:', error);
        }
      };

      fetchCsrfToken();
    }
  }, [session]);

  // Função para adicionar o token CSRF aos headers
  const addCsrfToken = (headers: HeadersInit = {}): HeadersInit => {
    if (csrfToken) {
      return {
        ...headers,
        'x-csrf-token': csrfToken,
      };
    }
    return headers;
  };

  return { csrfToken, addCsrfToken };
}
