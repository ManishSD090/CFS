import apiClient from '../../../api/apiClient';

export const getWPRPreviewAPI = async (projectId, weekDate) => {
    try {
        const response = await apiClient.get(`/wpr`, { 
            params: { projectId, weekDate }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch WPR preview' };
    }
};

export const createWPRAPI = async (payload) => {
    try {
        const response = await apiClient.post(`/wpr`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to save WPR' };
    }
};

export const getProjectWPRsAPI = async (projectId) => {
    try {
        const response = await apiClient.get(`/wpr/list`, { 
            params: { projectId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch WPRs' };
    }
};

export const updateWPRStatusAPI = async (id, status, approvalNotes = '') => {
    try {
        const response = await apiClient.patch(`/wpr/${id}/status`, { status, approvalNotes });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to update WPR status' };
    }
};

export const deleteWPRAPI = async (id) => {
    try {
        const response = await apiClient.delete(`/wpr/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to delete WPR' };
    }
};
