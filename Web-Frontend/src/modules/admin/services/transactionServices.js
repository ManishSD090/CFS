import apiClient from "../../../api/apiClient";

export const getTransactions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return (await apiClient.get(`/transactions${query ? '?' + query : ''}`)).data;
};

export const createTransactionEntry = async (data) => 
  (await apiClient.post('/transactions', data)).data;

export const getProjectTransactionSummary = async (projectId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return (await apiClient.get(`/transactions/summary/project/${projectId}${query ? '?' + query : ''}`)).data;
};

export const getProjectCashboxBalance = async (projectId) => 
  (await apiClient.get(`/transactions/cashbox/project/${projectId}`)).data;

export const getProjectCashboxStatement = async (projectId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return (await apiClient.get(`/transactions/cashbox/project/${projectId}/statement${query ? '?' + query : ''}`)).data;
};

export const getTransactionById = async (id) => 
  (await apiClient.get(`/transactions/${id}`)).data;

export const updateTransactionEntry = async (id, data) => 
  (await apiClient.put(`/transactions/${id}`, data)).data;

export const approveTransactionEntry = async (id, payload) => 
  (await apiClient.patch(`/transactions/${id}/approve`, payload)).data;

export const rejectTransactionEntry = async (id, payload) => 
  (await apiClient.patch(`/transactions/${id}/reject`, payload)).data;

export const voidTransactionEntry = async (id, payload) => 
  (await apiClient.patch(`/transactions/${id}/void`, payload)).data;
