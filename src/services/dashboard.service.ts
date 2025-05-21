import api from './api';
import { DashboardStats, LoginLog, ApiResponse } from './api.types';

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return api.get<DashboardStats>('/api/dashboard/stats', {
      requiresAuth: true,
    });
  },

  async getLoginLogs(): Promise<ApiResponse<LoginLog[]>> {
    return api.get<LoginLog[]>('/api/logs/login', {
      requiresAuth: true,
    });
  },

  async getActivityLogs(): Promise<
    ApiResponse<
      Array<{
        id: string;
        action: string;
        userId: string;
        details: any;
        createdAt: string;
      }>
    >
  > {
    return api.get<
      Array<{
        id: string;
        action: string;
        userId: string;
        details: any;
        createdAt: string;
      }>
    >('/api/logs/activity', {
      requiresAuth: true,
    });
  },
};
