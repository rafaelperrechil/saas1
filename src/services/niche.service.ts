import api from './api';
import { Niche, ApiResponse } from './api.types';

export const nicheService = {
  async getNiches(): Promise<ApiResponse<Niche[]>> {
    try {
      const response = await api.get<Niche[]>('/api/niches', {
        requiresAuth: true,
      });

      if (response.error) {
        console.error('Erro ao buscar nichos:', response.error);
        return { error: 'Erro ao buscar nichos' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao buscar nichos:', error);
      return { error: 'Erro ao buscar nichos' };
    }
  },

  async getNiche(id: string): Promise<ApiResponse<Niche>> {
    try {
      const response = await api.get<Niche>(`/api/niches/${id}`, {
        requiresAuth: true,
      });

      if (response.error) {
        console.error('Erro ao buscar nicho:', response.error);
        return { error: 'Erro ao buscar nicho' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao buscar nicho:', error);
      return { error: 'Erro ao buscar nicho' };
    }
  },

  async createNiche(data: { name: string; description?: string }): Promise<ApiResponse<Niche>> {
    try {
      const response = await api.post<Niche>('/api/niches', data, {
        requiresAuth: true,
        requiresCSRF: true,
      });

      if (response.error) {
        console.error('Erro ao criar nicho:', response.error);
        return { error: 'Erro ao criar nicho' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao criar nicho:', error);
      return { error: 'Erro ao criar nicho' };
    }
  },

  async updateNiche(
    id: string,
    data: { name: string; description?: string }
  ): Promise<ApiResponse<Niche>> {
    try {
      const response = await api.put<Niche>(`/api/niches/${id}`, data, {
        requiresAuth: true,
        requiresCSRF: true,
      });

      if (response.error) {
        console.error('Erro ao atualizar nicho:', response.error);
        return { error: 'Erro ao atualizar nicho' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao atualizar nicho:', error);
      return { error: 'Erro ao atualizar nicho' };
    }
  },

  async deleteNiche(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await api.delete<{ success: boolean }>(`/api/niches/${id}`, {
        requiresAuth: true,
        requiresCSRF: true,
      });

      if (response.error) {
        console.error('Erro ao excluir nicho:', response.error);
        return { error: 'Erro ao excluir nicho' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao excluir nicho:', error);
      return { error: 'Erro ao excluir nicho' };
    }
  },
};
