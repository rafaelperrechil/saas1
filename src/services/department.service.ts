import api from './api';
import { ApiResponse } from './api.types';

export interface DepartmentResponsible {
  id: string;
  email: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  responsibles?: DepartmentResponsible[];
}

export interface CreateDepartmentData {
  name: string;
  branchId: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {}

export interface ResponsibleData {
  name: string;
  email: string;
}

export const departmentService = {
  async getDepartments(branchId: string): Promise<ApiResponse<Department[]>> {
    const response = await api.get<ApiResponse<Department[]>>(
      `/api/departments?branchId=${branchId}&include=responsibles`
    );
    return {
      ...response,
      data: response.data?.data?.map((department: any) => ({
        ...department,
        responsibles: department.responsibles?.map((r: { user: DepartmentResponsible }) => r.user),
      })),
    };
  },

  async getDepartment(id: string): Promise<ApiResponse<Department>> {
    return api.get(`/api/departments/${id}`);
  },

  async createDepartment(data: CreateDepartmentData): Promise<ApiResponse<Department>> {
    return api.post('/api/departments', data);
  },

  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<ApiResponse<Department>> {
    return api.put(`/api/departments/${id}`, data);
  },

  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/departments/${id}`);
  },

  async addResponsible(
    departmentId: string,
    data: ResponsibleData
  ): Promise<ApiResponse<Department>> {
    return api.post(`/api/departments/${departmentId}/responsibles`, data);
  },

  async removeResponsible(departmentId: string, userId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/departments/${departmentId}/responsibles/${userId}`);
  },
};
