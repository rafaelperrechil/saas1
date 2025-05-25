import api from './api';

export async function getChecklistsByBranch(branchId: string) {
  const response = await api.get(`/api/checklists?branchId=${encodeURIComponent(branchId)}`);
  return response.data.data;
}

export async function toggleChecklistStatus(checklistId: string) {
  const response = await api.patch(`/api/checklists/${checklistId}/toggle-status`, {});
  return response.data.data;
}
