// src/modules/admin/services/transaction.service.js

import apiClient from "../../../api/apiClient";

// 🔹 Get all transactions
export const getTransactions = async (params = {}) => {
  const res = await apiClient.get("/transactions", { params });

  // return ONLY actual list
  return res.data?.data || [];
};

// 🔹 Get single transaction
export const getTransactionById = async (id) => {
  const res = await apiClient.get(`/transactions/${id}`);
  return res.data?.data || null;
};

// 🔹 Create transaction
export const createTransaction = async (payload) => {
  const res = await apiClient.post("/transactions", payload);
  return res.data?.data || null;
};

// 🔹 Update transaction
export const updateTransaction = async (id, payload) => {
  const res = await apiClient.put(`/transactions/${id}`, payload);
  return res.data?.data || null;
};

// 🔹 Approve
export const approveTransaction = async (id, payload) => {
  const res = await apiClient.patch(`/transactions/${id}/approve`, payload);
  return res.data?.data || null;
};

// 🔹 Reject
export const rejectTransaction = async (id, payload) => {
  const res = await apiClient.patch(`/transactions/${id}/reject`, payload);
  return res.data?.data || null;
};

// 🔹 Void
export const voidTransaction = async (id, payload) => {
  const res = await apiClient.patch(`/transactions/${id}/void`, payload);
  return res.data?.data || null;
};

// 🔹 Summary
export const getTransactionSummary = async (projectId, params = {}) => {
  const res = await apiClient.get(
    `/transactions/summary/project/${projectId}`,
    { params }
  );

  // return ONLY summary object
  return res.data?.data?.summary || null;
};

// 🔹 Cashbox Balance
export const getCashboxBalance = async (projectId) => {
  const res = await apiClient.get(
    `/transactions/cashbox/project/${projectId}`
  );
  return res.data?.data || null;
};

// 🔹 Cashbox Statement
export const getCashboxStatement = async (projectId, params = {}) => {
  const res = await apiClient.get(
    `/transactions/cashbox/project/${projectId}/statement`,
    { params }
  );
  return res.data?.data || null;
};