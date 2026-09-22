import apiClient from "../../../api/apiClient";

export const getUsersAPI = async (params = { page: 1, limit: 50, includeProjects: true }) => {
    try {
        const response = await apiClient.get('/users', { params });
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const createUserAPI = async (payload) => {
    try {
        const response = await apiClient.post('/users', payload);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const toggleUserStatusAPI = async (id, isActive) => {
    try {
        const response = await apiClient.patch(`/users/${id}/status`, { isActive, reason: 'Admin toggle' });
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const deleteUserAPI = async (id) => {
    try {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const getUserByIdAPI = async (id) => {
    try {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const updateUserAPI = async (id, payload) => {
    try {
        const response = await apiClient.put(`/users/${id}`, payload);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const updateUserRoleAPI = async (id, roleId) => {
    try {
        const response = await apiClient.patch(`/users/${id}/role`, { roleId });
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const resetUserPasswordAPI = async (id, password) => {
    try {
        const response = await apiClient.post(`/users/${id}/reset-password`, { newPassword: password });
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};
