import api from './api';
import { WizardStep, ApiResponse } from './api.types';

interface WizardData {
  organization: {
    name: string;
    employeesCount: number;
    country: string;
    city: string;
    nicheId: string;
  };
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
}

export const wizardService = {
  async getSteps(): Promise<ApiResponse<WizardStep[]>> {
    return api.get<WizardStep[]>('/api/wizard/steps', {
      requiresAuth: true,
    });
  },

  async updateStep(id: string, data: { completed: boolean }): Promise<ApiResponse<WizardStep>> {
    return api.put<WizardStep>(`/api/wizard/steps/${id}`, data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async completeStep(id: string): Promise<ApiResponse<WizardStep>> {
    return api.post<WizardStep>(
      `/api/wizard/steps/${id}/complete`,
      {},
      {
        requiresAuth: true,
        requiresCSRF: true,
      }
    );
  },

  async resetWizard(): Promise<ApiResponse<{ success: boolean }>> {
    return api.post<{ success: boolean }>(
      '/api/wizard/reset',
      {},
      {
        requiresAuth: true,
        requiresCSRF: true,
      }
    );
  },

  async processWizardData(userId: string, data: WizardData): Promise<ApiResponse<any>> {
    return api.post('/api/wizard/process', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async saveWizardData(data: WizardData): Promise<ApiResponse<{ success: boolean }>> {
    return api.post<{ success: boolean }>('/api/wizard', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },
};
