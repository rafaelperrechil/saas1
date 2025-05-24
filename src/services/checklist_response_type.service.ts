import api from './api';

export async function getChecklistResponseTypes() {
  const response = await api.get('/api/checklist_response_types');
  return response.data.data;
}
