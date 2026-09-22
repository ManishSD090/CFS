// src/modules/admin/services/payrollServices.js
// All endpoints verified against payroll.routes.js
// Mount path: /api/v1/payroll (confirmed via app.js)

import apiClient from '../../../api/apiClient';

// ==================== Shift Types ====================
// GET /payroll/shift-types
export const getShiftTypes = async () => {
  const res = await apiClient.get('/payroll/shift-types');
  return res.data?.data || res.data || [];
};

// POST /payroll/shift-types  body: { name, multiplier, description? }
export const createShiftType = async (data) => {
  const res = await apiClient.post('/payroll/shift-types', data);
  return res.data;
};

// DELETE /payroll/shift-types/:id
export const deleteShiftType = async (id) => {
  const res = await apiClient.delete(`/payroll/shift-types/${id}`);
  return res.data;
};

// Bulk delete convenience (Flutter uses per-id loop)
export const bulkDeleteShiftTypes = async (ids) =>
  Promise.all(ids.map((id) => deleteShiftType(id)));

// ==================== Labour Rates ====================
// GET /payroll/labour-rates   query: { isCurrent?, workerType?, workerId? }
export const getLabourRates = async (params = {}) => {
  const res = await apiClient.get('/payroll/labour-rates', { params });
  return res.data?.data || res.data || [];
};

// POST /payroll/labour-rates
// body: { workerType, rate, effectiveFrom, siteStaffId?, subcontractorWorkerId? }
export const createLabourRate = async (data) => {
  const res = await apiClient.post('/payroll/labour-rates', data);
  return res.data;
};

// PATCH /payroll/labour-rates/:id
export const updateLabourRate = async (id, data) => {
  const res = await apiClient.patch(`/payroll/labour-rates/${id}`, data);
  return res.data;
};

// Bulk delete labour rates
export const bulkDeleteLabourRates = async (ids) =>
  Promise.all(ids.map((id) => apiClient.delete(`/payroll/labour-rates/${id}`)));

// ==================== Payroll Calculate ====================
// POST /payroll/calculate
// body: { periodFrom: ISO, periodTo: ISO, projectId?, workerType? }
// Returns: { success, data: { periodFrom, periodTo, totalWorkers, totalAmount, workers: [...] } }
export const calculatePayroll = async (body) => {
  const res = await apiClient.post('/payroll/calculate', body);
  return res.data?.data || res.data;
};

// ==================== Payroll CRUD ====================
// GET /payroll   query: { page?, limit?, status?, fromDate?, toDate?, search? }
export const getAllPayrolls = async (params = {}) => {
  const res = await apiClient.get('/payroll', { params });
  return res.data;
};

// GET /payroll/daily-summary   query: { date? }
export const getDailyPayrollSummary = async (date) => {
  const res = await apiClient.get('/payroll/daily-summary', { params: { date } });
  return res.data?.data || res.data;
};

// POST /payroll
// body: { periodFrom, periodTo, workers: [...], notes?, periodType? }
export const createPayroll = async (body) => {
  const res = await apiClient.post('/payroll', body);
  return res.data;
};

// GET /payroll/:id
export const getPayrollById = async (id) => {
  const res = await apiClient.get(`/payroll/${id}`);
  return res.data?.data || res.data;
};

// PATCH /payroll/:id/status
// body: { status: 'PROCESSED'|'APPROVED'|'PAID'|'CANCELLED', notes?, paymentMethod?, paymentReference? }
// NOTE: Setting status=PAID auto-creates BudgetTransaction for LABOR category (backend-driven)
export const updatePayrollStatus = async (id, body) => {
  const res = await apiClient.patch(`/payroll/${id}/status`, body);
  return res.data;
};

// DELETE /payroll/:id  (only PENDING payrolls)
export const deletePayroll = async (id) => {
  const res = await apiClient.delete(`/payroll/${id}`);
  return res.data;
};
