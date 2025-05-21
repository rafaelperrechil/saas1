import api from './api';
import { ApiResponse, Log, CreateLogData, LogFilters } from './api.types';

class LogService {
  async getLogs(filters?: LogFilters): Promise<ApiResponse<Log[]>> {
    return api.get('/api/logs', { params: filters });
  }

  async getLog(id: string): Promise<ApiResponse<Log>> {
    return api.get(`/api/logs/${id}`);
  }

  async createLog(data: CreateLogData): Promise<ApiResponse<Log>> {
    return api.post('/api/logs', data);
  }

  async deleteLog(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/logs/${id}`);
  }
}

export const logService = new LogService();
