import api from './api';
import { ApiResponse } from './api.types';

export const stripeService = {
  async createCustomer(): Promise<ApiResponse<{ customerId: string }>> {
    return api.post<{ customerId: string }>(
      '/api/stripe/customer',
      {},
      {
        requiresAuth: true,
        requiresCSRF: true,
      }
    );
  },
};
