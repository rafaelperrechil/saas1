import api from './api';

export async function getTicketsByBranch(branchId) {
  const response = await api.get(`/api/tickets?branchId=${encodeURIComponent(branchId)}`);
  return response.data.data;
}
