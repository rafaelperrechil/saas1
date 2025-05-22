import api from './api';
import { User, UserProfile, ApiResponse, Profile } from './api.types';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  profileId: string;
}

interface UpdateProfileData extends Partial<UserProfile> {
  currentPassword?: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateAvatarResponse {
  avatarUrl: string;
  message: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  profileId?: string;
}

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return api.get<User[]>('/api/users', {
      requiresAuth: true,
      headers: {
        Accept: 'application/json',
      },
    });
  },

  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    return api.get<User>(`/api/users/email/${email}`, {
      requiresAuth: true,
    });
  },

  async getProfiles(): Promise<ApiResponse<Profile[]>> {
    return api.get<Profile[]>('/api/profiles', {
      requiresAuth: true,
    });
  },

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return api.post<User>('/api/users', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    return api.put<User>(`/api/users/${id}`, data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.delete<{ success: boolean }>(`/api/users/${id}`, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return api.get<User>('/api/user/profile', {
      requiresAuth: true,
    });
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<User>('/api/user/profile', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async updatePassword(data: UpdatePasswordData): Promise<ApiResponse<{ message: string }>> {
    return api.put<{ message: string }>('/api/users/password', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async updateAvatar(formData: FormData): Promise<ApiResponse<UpdateAvatarResponse>> {
    return api.put<UpdateAvatarResponse>('/api/users/avatar', formData, {
      requiresAuth: true,
      requiresCSRF: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>('/api/users/account', {
      requiresAuth: true,
      requiresCSRF: true,
      body: JSON.stringify({ password }),
    });
  },

  async getLoginHistory(): Promise<
    ApiResponse<{ logs: Array<{ date: string; ip: string; device: string }> }>
  > {
    return api.get<{ logs: Array<{ date: string; ip: string; device: string }> }>(
      '/api/users/login-history',
      {
        requiresAuth: true,
      }
    );
  },

  async updatePreferences(preferences: { [key: string]: any }): Promise<ApiResponse<User>> {
    return api.put<User>('/api/users/preferences', preferences, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/api/auth/reset-password', { token, password });
  },

  async registerUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    try {
      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return { error: 'E-mail já cadastrado' };
      }

      // Buscar perfil padrão 'User'
      const profile = await prisma.profile.findFirst({
        where: { name: 'User' },
      });

      if (!profile) {
        return { error: 'Perfil padrão não encontrado' };
      }

      // Hash da senha
      const hashedPassword = await hash(data.password, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          profileId: profile.id,
        },
        include: {
          profile: true,
        },
      });

      return { data: user };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { error: 'Erro ao registrar usuário' };
    }
  },
};
