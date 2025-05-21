import api from './api';
import { Plan, CheckoutSession, ApiResponse } from './api.types';

export const planService = {
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    return api.get<Plan[]>('/api/plans', {
      requiresAuth: false,
    });
  },

  async getCurrentPlan(): Promise<ApiResponse<Plan>> {
    return api.get<Plan>('/api/plans/current', {
      requiresAuth: true,
    });
  },

  async getPlan(id: string): Promise<ApiResponse<Plan>> {
    return api.get<Plan>(`/api/plans/${id}`, {
      requiresAuth: true,
    });
  },

  async createPlan(data: Omit<Plan, 'id'>): Promise<ApiResponse<Plan>> {
    return api.post<Plan>('/api/plans', data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<ApiResponse<Plan>> {
    return api.put<Plan>(`/api/plans/${id}`, data, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async deletePlan(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.delete<{ success: boolean }>(`/api/plans/${id}`, {
      requiresAuth: true,
      requiresCSRF: true,
    });
  },

  async createCheckoutSession(planId: string): Promise<ApiResponse<CheckoutSession>> {
    return api.post<CheckoutSession>(
      '/api/checkout/session',
      { planId },
      {
        requiresAuth: true,
        requiresCSRF: true,
      }
    );
  },

  async getCheckoutSession(sessionId: string): Promise<ApiResponse<CheckoutSession>> {
    return api.get<CheckoutSession>(`/api/checkout/session/${sessionId}`, {
      requiresAuth: true,
    });
  },

  async cancelCheckoutSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return api.post<{ success: boolean }>(
      `/api/checkout/session/${sessionId}/cancel`,
      {},
      {
        requiresAuth: true,
        requiresCSRF: true,
      }
    );
  },

  async handleWebhook(data: any): Promise<ApiResponse<{ success: boolean }>> {
    return api.post<{ success: boolean }>('/api/webhook/checkout', data, {
      requiresCSRF: true,
    });
  },
};
