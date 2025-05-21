import api from './api';
import { Notification } from './api.types';

// TODO: Implementar as rotas de notificação na API
// As seguintes rotas precisam ser implementadas:
// - GET /api/notifications
// - PUT /api/notifications/:id/read
// - PUT /api/notifications/read-all
// - DELETE /api/notifications/:id
// - PUT /api/notifications/preferences

export const notificationService = {
  async getNotifications() {
    return api.get<Notification[]>('/api/notifications');
  },

  async markAsRead(notificationId: string) {
    return api.put<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead() {
    return api.put<{ success: boolean }>('/api/notifications/read-all', {});
  },

  async deleteNotification(notificationId: string) {
    return api.delete<{ success: boolean }>(`/api/notifications/${notificationId}`);
  },

  async updateNotificationPreferences(preferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  }) {
    return api.put<{ success: boolean }>('/api/notifications/preferences', preferences);
  },
};
