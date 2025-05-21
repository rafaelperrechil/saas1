import api from './api';
import { ApiResponse, Branch, CreateBranchData, UpdateBranchData } from './api.types';

class BranchService {
  async getBranches(): Promise<ApiResponse<Branch[]>> {
    return api.get('/api/branches');
  }

  async getBranch(id: string): Promise<ApiResponse<Branch>> {
    return api.get(`/api/branches/${id}`);
  }

  async getOrganizationBranches(userId: string): Promise<ApiResponse<Branch[]>> {
    return api.get(`/api/branches/organization`, {
      requiresAuth: true,
      isServer: true,
    });
  }

  async createBranch(data: CreateBranchData): Promise<ApiResponse<Branch>> {
    return api.post('/api/branches', data);
  }

  async updateBranch(id: string, data: UpdateBranchData): Promise<ApiResponse<Branch>> {
    return api.put(`/api/branches/${id}`, data);
  }

  async deleteBranch(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/branches/${id}`);
  }
}

export const branchService = new BranchService();
