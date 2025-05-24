import api from './api';
import { Environment } from './api.types';

export const environmentService = {
  getEnvironments: async () => {
    try {
      const response = await api.get<{ data: Environment[] }>('/api/environments');
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.message || 'Erro ao buscar ambientes' };
    }
  },

  createEnvironment: async (data: { name: string; position: number }) => {
    try {
      const response = await api.post<{ data: Environment }>('/api/environments', data);
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.message || 'Erro ao criar ambiente' };
    }
  },

  updateEnvironment: async (id: string, data: { name: string; position: number }) => {
    try {
      const response = await api.put<{ data: Environment }>(`/api/environments/${id}`, data);
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.message || 'Erro ao atualizar ambiente' };
    }
  },

  deleteEnvironment: async (id: string) => {
    try {
      await api.delete(`/api/environments/${id}`);
      return { data: true };
    } catch (error: any) {
      return { error: error.message || 'Erro ao excluir ambiente' };
    }
  },
};
