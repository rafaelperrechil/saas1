import api from './api';
import { ApiResponse, Webhook, CreateWebhookData, UpdateWebhookData } from './api.types';

class WebhookService {
  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    return api.get('/api/webhooks');
  }

  async getWebhook(id: string): Promise<ApiResponse<Webhook>> {
    return api.get(`/api/webhooks/${id}`);
  }

  async createWebhook(data: CreateWebhookData): Promise<ApiResponse<Webhook>> {
    return api.post('/api/webhooks', data);
  }

  async updateWebhook(id: string, data: UpdateWebhookData): Promise<ApiResponse<Webhook>> {
    return api.put(`/api/webhooks/${id}`, data);
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/webhooks/${id}`);
  }

  async regenerateSecret(id: string): Promise<ApiResponse<Webhook>> {
    return api.post(`/api/webhooks/${id}/regenerate-secret`);
  }
}

export const webhookService = new WebhookService();
