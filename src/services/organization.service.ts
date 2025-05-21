import api from './api';
import { Organization, Branch, ApiResponse } from './api.types';

export const organizationService = {
  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    try {
      const response = await api.get<Organization[]>('/api/organization', {
        requiresAuth: true,
      });

      if (response.error) {
        console.error('Erro ao buscar organizações:', response.error);
        return { error: 'Erro ao buscar organizações' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
      return { error: 'Erro ao buscar organizações' };
    }
  },

  async getOrganization(id: string): Promise<ApiResponse<Organization>> {
    return api.get<Organization>(`/api/organization/${id}`, {
      requiresAuth: true,
    });
  },

  async getCompletedWizardData(userId: string): Promise<
    ApiResponse<{
      hasCompletedWizard: boolean;
      organizationData?: {
        name: string;
        employeesCount: string;
        country: string;
        city: string;
        nicheId: string;
        branch: {
          name: string;
        };
        departments: Array<{
          name: string;
          responsibles: Array<{
            email: string;
            status: string;
          }>;
        }>;
        environments: Array<{
          name: string;
          position: number;
        }>;
      };
    }>
  > {
    try {
      console.log('Buscando dados do wizard para usuário:', userId);
      const response = await api.get<{
        hasCompletedWizard: boolean;
        organizationData?: {
          name: string;
          employeesCount: string;
          country: string;
          city: string;
          nicheId: string;
          branch: {
            name: string;
          };
          departments: Array<{
            name: string;
            responsibles: Array<{
              email: string;
              status: string;
            }>;
          }>;
          environments: Array<{
            name: string;
            position: number;
          }>;
        };
      }>('/api/organization/completed-wizard', {
        requiresAuth: true,
      });

      if (response.error) {
        console.error('Erro ao buscar dados do wizard:', response.error);
        return { error: 'Erro ao buscar dados do wizard' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao buscar dados do wizard:', error);
      return { error: 'Erro ao buscar dados do wizard' };
    }
  },

  async createOrganization(data: {
    name: string;
    employeesCount: string;
    country: string;
    city: string;
    nicheId: string;
  }): Promise<ApiResponse<Organization>> {
    try {
      const response = await api.post<Organization>('/api/organization', data, {
        requiresAuth: true,
        requiresCSRF: true,
      });

      if (response.error) {
        console.error('Erro ao criar organização:', response.error);
        return { error: 'Erro ao criar organização' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      return { error: 'Erro ao criar organização' };
    }
  },

  async updateOrganization(
    id: string,
    data: {
      name?: string;
      employeesCount?: string;
      country?: string;
      city?: string;
      nicheId?: string;
    }
  ): Promise<ApiResponse<Organization>> {
    try {
      const response = await api.put<Organization>(`/api/organization/${id}`, data, {
        requiresAuth: true,
        requiresCSRF: true,
      });

      if (response.error) {
        console.error('Erro ao atualizar organização:', response.error);
        return { error: 'Erro ao atualizar organização' };
      }

      return response;
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      return { error: 'Erro ao atualizar organização' };
    }
  },

  async deleteOrganization(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.delete<{ success: boolean }>(`/api/organization/${id}`, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  // Branches
  async getBranches(organizationId: string): Promise<ApiResponse<Branch[]>> {
    return api.get<Branch[]>(`/api/organization/${organizationId}/branches`, {
      requiresAuth: true,
    });
  },

  async createBranch(organizationId: string, data: { name: string }): Promise<ApiResponse<Branch>> {
    return api.post<Branch>(`/api/organization/${organizationId}/branches`, data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async updateBranch(branchId: string, data: { name: string }): Promise<ApiResponse<Branch>> {
    return api.put<Branch>(`/api/branches/${branchId}`, data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async deleteBranch(branchId: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.delete<{ success: boolean }>(`/api/branches/${branchId}`, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },
};
