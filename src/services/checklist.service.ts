import api from './api';

export async function getChecklistsByBranch(branchId: string) {
  const response = await api.get(`/api/checklists?branchId=${encodeURIComponent(branchId)}`);
  return response.data.data;
}
