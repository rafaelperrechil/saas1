import { ApiResponse } from './api.types';

interface ApiOptions {
  requiresAuth?: boolean;
  requiresCSRF?: boolean;
  headers?: Record<string, string>;
}

class Api {
  private baseUrl: string;

  constructor() {
    // Em desenvolvimento, usa a URL base do servidor
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window === 'undefined' ? 'http://localhost:3003' : '');
  }

  private getFullUrl(endpoint: string): string {
    // Se a URL já for absoluta, retorna ela mesma
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Se a URL começar com /, é uma rota da API
    if (endpoint.startsWith('/')) {
      return `${this.baseUrl}${endpoint}`;
    }

    // Caso contrário, concatena com a URL base
    return `${this.baseUrl}/${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { requiresAuth = false, requiresCSRF = false, headers = {}, ...fetchOptions } = options;

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      } as Record<string, string>;

      if (requiresAuth) {
        try {
          const session = await fetch(`${this.baseUrl}/api/auth/session`).then((res) => res.json());
          if (session?.user) {
            requestHeaders['Authorization'] = `Bearer ${session.user.id}`;
          }
        } catch (error) {
          console.error('Erro ao obter sessão:', error);
          return { error: 'Erro de autenticação' };
        }
      }

      if (requiresCSRF) {
        const csrfToken = await this.getCsrfToken();
        if (csrfToken) {
          requestHeaders['X-CSRF-Token'] = csrfToken;
        }
      }

      const fullUrl = this.getFullUrl(endpoint);
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers: requestHeaders,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
        return { error: error.message || 'Erro na requisição' };
      }

      const data = await response.json();
      if (data && data.error) {
        return { error: data.error };
      }
      return { data };
    } catch (error) {
      console.error('Erro na requisição:', error);
      return { error: 'Erro na requisição' };
    }
  }

  private async getCsrfToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/csrf');
      const data = await response.json();
      return data.csrfToken;
    } catch {
      return null;
    }
  }

  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new Api();
