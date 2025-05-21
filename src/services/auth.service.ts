import api from './api';
import { User, ApiResponse } from './api.types';
import { signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profile: any;
  };
  branch?: any;
}

export const authService = {
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        return { error: result.error };
      }

      const session = (await fetch('/api/auth/session').then((res) => res.json())) as Session;

      return {
        data: session?.user
          ? {
              user: {
                id: session.user.id,
                email: session.user.email as string,
                name: session.user.name as string,
                profile: session.user.profile,
              },
              branch: session.user.branch,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro ao fazer login' };
    }
  },

  async register(data: RegisterData): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Primeiro verifica se o e-mail já existe
      const checkResponse = await this.checkEmail(data.email);
      if (checkResponse.error) {
        return { error: checkResponse.error };
      }
      if (checkResponse.data?.exists) {
        return { error: 'E-mail já cadastrado' };
      }

      // Se o e-mail não existe, prossegue com o registro
      const response = await api.post<{ success: boolean }>('/api/auth/register', data, {
        requiresCSRF: true,
      });

      if (response.error) {
        return { error: response.error };
      }

      return response;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { error: 'Erro ao registrar usuário' };
    }
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>(
      '/api/auth/forgot-password',
      { email },
      {
        requiresCSRF: true,
      }
    );
  },

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/api/auth/reset-password', data, {
      requiresCSRF: true,
    });
  },

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      const response = await api.post<{ exists: boolean }>('/api/check-email', { email });

      if (response.error) {
        console.error('Erro ao verificar e-mail:', response.error);
        return { error: 'Erro ao verificar e-mail' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      return { error: 'Erro ao verificar e-mail' };
    }
  },

  async logout(): Promise<void> {
    await signOut({ redirect: false });
  },
};
