import axiosInstance from "../../../api/apiClient";

// Core
export const createBudget = async (data) => (await axiosInstance.post('/budgets', data)).data;
export const getProjectBudgets = async (projectId) => (await axiosInstance.get(`/budgets/projects/${projectId}/budgets`)).data;
export const getBudgetById = async (id) => (await axiosInstance.get(`/budgets/${id}`)).data;
export const updateBudget = async (id, data) => (await axiosInstance.put(`/budgets/${id}`, data)).data;
export const deleteBudget = async (id) => (await axiosInstance.delete(`/budgets/${id}`)).data;
export const updateBudgetStatus = async (id, status) => (await axiosInstance.patch(`/budgets/${id}/status`, { status })).data;

// Categories
export const addBudgetCategory = async (budgetId, data) => (await axiosInstance.post(`/budgets/${budgetId}/categories`, data)).data;
export const updateBudgetCategory = async (budgetId, catId, data) => (await axiosInstance.put(`/budgets/${budgetId}/categories/${catId}`, data)).data;
export const deleteBudgetCategory = async (budgetId, catId) => (await axiosInstance.delete(`/budgets/${budgetId}/categories/${catId}`)).data;
export const transferBudgetAmount = async (budgetId, catId, data) => (await axiosInstance.post(`/budgets/${budgetId}/categories/${catId}/transfer`, data)).data;
export const getBudgetCategories = async (budgetId) => (await axiosInstance.get(`/budgets/${budgetId}/categories`)).data;

// Revisions
export const getBudgetRevisions = async (budgetId) => (await axiosInstance.get(`/budgets/${budgetId}/revisions`)).data;
export const createBudgetRevision = async (budgetId, data) => (await axiosInstance.post(`/budgets/${budgetId}/revisions`, data)).data;
export const submitRevisionForApproval = async (revisionId, data = {}) => (await axiosInstance.post(`/budgets/revisions/${revisionId}/submit`, data)).data;
export const approveRejectRevision = async (revisionId, data) => (await axiosInstance.post(`/budgets/revisions/${revisionId}/approve-reject`, data)).data;
export const applyRevision = async (revisionId, data = {}) => (await axiosInstance.post(`/budgets/revisions/${revisionId}/apply`, data)).data;

// Audit
export const getBudgetAuditTrail = async (budgetId) => (await axiosInstance.get(`/budgets/audit/${budgetId}`)).data;

// Approvals
export const approveRejectBudget = async (budgetId, data) => {
    if (data.isApproved) {
        return (await axiosInstance.post(`/budgets/approvals/${budgetId}/approve`)).data;
    } else {
        return (await axiosInstance.post(`/budgets/approvals/${budgetId}/reject`, { reason: data.reason })).data;
    }
};

// Transactions
export const getBudgetTransactions = async (budgetId) => (await axiosInstance.get(`/budgets/${budgetId}/transactions`)).data;
export const createCommitment = async (budgetId, data) => (await axiosInstance.post(`/budgets/${budgetId}/commitments`, data)).data;
export const createExpenseTransaction = async (budgetId, data) => (await axiosInstance.post(`/budgets/${budgetId}/expenses`, data)).data;
export const transferBetweenCategories = async (budgetId, data) => (await axiosInstance.post(`/budgets/${budgetId}/transfer`, data)).data;
export const updateBudgetTransactionStatus = async (transactionId, status) => (await axiosInstance.patch(`/transactions/${transactionId}/status`, { status })).data;
export const convertCommitmentToExpense = async (transactionId, data) => (await axiosInstance.post(`/transactions/${transactionId}/convert`, data)).data;
