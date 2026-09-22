import apiClient from '../../../api/apiClient';

export const dprService = {
  // ==========================================
  // DPR CORE
  // ==========================================
  
  createDPR: async (dprData) => {
    const response = await apiClient.post('/dpr', dprData);
    return response.data;
  },

  getDPRsByProject: async (projectId, params = {}) => {
    const queryParams = {
      projectId: projectId,
      page: params.page || 1,
      limit: params.limit || 100,
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.status && { status: params.status })
    };

    const response = await apiClient.get('/dpr', { params: queryParams });
    return response.data;
  },

  getDPRById: async (id) => {
    const response = await apiClient.get(`/dpr/${id}`);
    return response.data;
  },

  updateDPR: async (id, updateData) => {
    const response = await apiClient.put(`/dpr/${id}`, updateData);
    return response.data;
  },

  deleteDPR: async (id) => {
    const response = await apiClient.delete(`/dpr/${id}`);
    return response.data;
  },

  // ==========================================
  // MEDIA UPLOADS
  // ==========================================
  
  uploadDPRPhoto: async (dprId, file, title = '', description = '') => {
    const formData = new FormData();
    formData.append('dprId', dprId);
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await apiClient.post('/dpr-photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDPRPhotos: async (dprId) => {
    const response = await apiClient.get(`/dpr-photos/dpr/${dprId}`);
    return response.data;
  },

  // ==========================================
  // DEPENDENCIES
  // ==========================================

  getAttendanceSummary: async (projectId, date) => {
    const response = await apiClient.get('/attendance/by-date', { params: { projectId, date } });
    return response.data;
  },

  getProjectTasks: async (projectId) => {
    const response = await apiClient.get('/tasks', { params: { projectId, limit: 100 } });
    return response.data;
  },

  getProjectMaterials: async (projectId) => {
    const response = await apiClient.get(`/inventory/project/${projectId}`, { params: { limit: 100 } });
    return response.data;
  },

  getProjectEquipment: async (projectId) => {
    const response = await apiClient.get('/inventory/equipment', { params: { projectId, location: 'PROJECT', limit: 100 } });
    return response.data;
  },

  getProjectSubcontractors: async (projectId) => {
    const response = await apiClient.get(`/subcontractors/projects/all`, { params: { projectId, limit: 100 } });
    return response.data;
  }
};
