import apiClient from "../../../api/apiClient";

export const getRolesAPI = async (params = { page: 1, limit: 50 }) => {
    try {
        const response = await apiClient.get('/roles', { params });
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const createRoleAPI = async (payload) => {
    try {
        const response = await apiClient.post('/roles', payload);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const getRoleByIdAPI = async (id) => {
    try {
        const response = await apiClient.get(`/roles/${id}`);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const updateRoleAPI = async (id, payload) => {
    try {
        const response = await apiClient.put(`/roles/${id}`, payload);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const updateRolePermissionsAPI = async (id, permissions) => {
    try {
        const response = await apiClient.put(`/roles/${id}/permissions`, { permissions });
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};

export const deleteRoleAPI = async (id) => {
    try {
        const response = await apiClient.delete(`/roles/${id}`);
        return response.data;
    } catch (error) { throw error.response?.data || error; }
};
