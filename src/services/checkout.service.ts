import api from './api';
import { ApiResponse } from './api.types';

export interface CheckoutSession {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  customerId: string;
  organizationId: string;
  planId: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutSessionData {
  amount: number;
  currency: string;
  customerId: string;
  organizationId: string;
  planId: string;
  paymentMethod: string;
}

export interface UpdateCheckoutSessionData {
  status?: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
}

class CheckoutService {
  async getCheckoutSessions(): Promise<ApiResponse<CheckoutSession[]>> {
    return api.get('/api/checkout/sessions');
  }

  async getCheckoutSession(id: string): Promise<ApiResponse<CheckoutSession>> {
    return api.get(`/api/checkout/sessions/${id}`);
  }

  async createCheckoutSession(
    data: CreateCheckoutSessionData
  ): Promise<ApiResponse<CheckoutSession>> {
    return api.post('/api/checkout/sessions', data);
  }

  async updateCheckoutSession(
    id: string,
    data: UpdateCheckoutSessionData
  ): Promise<ApiResponse<CheckoutSession>> {
    return api.put(`/api/checkout/sessions/${id}`, data);
  }

  async cancelCheckoutSession(id: string): Promise<ApiResponse<void>> {
    return api.post(`/api/checkout/sessions/${id}/cancel`);
  }
}

export const checkoutService = new CheckoutService();
