import api from './api';
import { Profile, ApiResponse } from './api.types';

export const profileService = {
  async getProfiles(): Promise<ApiResponse<Profile[]>> {
    return api.get<Profile[]>('/api/profiles', {
      requiresAuth: true,
      headers: {
        Accept: 'application/json',
      },
    });
  },

  async getProfileById(id: string): Promise<ApiResponse<Profile>> {
    return api.get<Profile>(`/api/profiles/${id}`, {
      requiresAuth: true,
      headers: {
        Accept: 'application/json',
      },
    });
  },

  async createProfile(data: { name: string }): Promise<ApiResponse<Profile>> {
    return api.post<Profile>('/api/profiles', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async updateProfile(id: string, data: { name: string }): Promise<ApiResponse<Profile>> {
    return api.put<Profile>(`/api/profiles/${id}`, data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async deleteProfile(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.delete<{ success: boolean }>(`/api/profiles/${id}`, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },
};
