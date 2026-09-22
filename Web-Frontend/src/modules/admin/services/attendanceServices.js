// src/modules/admin/services/attendanceServices.js
// All endpoints verified against attendance.routes.js and worker.routes.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const authHeaders = (json = true) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Staff Attendance (attendance.routes.js) ─────────────────────────────────

/** POST /attendance/mark — bulk mark staff
 * body: { date, projectId, attendanceRecords: [{userId, status, notes}] }
 */
export const markStaffAttendance = (body) =>
  fetch(`${API_BASE}/attendance/mark`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);

/** GET /attendance/by-date?projectId=X&date=Y */
export const getAttendanceByDate = (projectId, date) =>
  fetch(`${API_BASE}/attendance/by-date?projectId=${projectId}&date=${encodeURIComponent(date)}`, {
    headers: authHeaders(),
  }).then(handle);

/** GET /attendance/by-range?projectId=X&startDate=Y&endDate=Z */
export const getAttendanceByRange = (projectId, startDate, endDate) =>
  fetch(`${API_BASE}/attendance/by-range?projectId=${projectId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, {
    headers: authHeaders(),
  }).then(handle);

/** GET /attendance/summary?projectId=X */
export const getAttendanceSummary = (projectId) =>
  fetch(`${API_BASE}/attendance/summary?projectId=${projectId}`, {
    headers: authHeaders(),
  }).then(handle);

/** PUT /attendance/:id — update a staff attendance record */
export const updateStaffAttendance = (id, body) =>
  fetch(`${API_BASE}/attendance/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);

/** DELETE /attendance/:id */
export const deleteAttendanceRecord = (id) =>
  fetch(`${API_BASE}/attendance/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handle);

// ─── Workers (worker.routes.js) ───────────────────────────────────────────────

/** GET /workers/site-staff — list all site-staff workers */
export const getAllWorkers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_BASE}/workers/site-staff${qs ? '?' + qs : ''}`, {
    headers: authHeaders(),
  }).then(handle);
};

/** GET /workers/site-staff/:id */
export const getWorkerById = (id) =>
  fetch(`${API_BASE}/workers/site-staff/${id}`, {
    headers: authHeaders(),
  }).then(handle);

/** POST /workers/site-staff — create worker (multipart) */
export const createWorker = (formData) =>
  fetch(`${API_BASE}/workers/site-staff`, {
    method: 'POST',
    headers: authHeaders(false), // No Content-Type — browser sets multipart boundary
    body: formData,
  }).then(handle);

/** PATCH /workers/site-staff/:id — update worker (multipart) */
export const updateWorker = (id, formData) =>
  fetch(`${API_BASE}/workers/site-staff/${id}`, {
    method: 'PATCH',
    headers: authHeaders(false),
    body: formData,
  }).then(handle);

/** DELETE /workers/site-staff/:id */
export const deleteWorker = (id) =>
  fetch(`${API_BASE}/workers/site-staff/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handle);

/** POST /workers/site-staff/:workerId/projects/:projectId/assign */
export const assignWorkerToProject = (workerId, projectId) =>
  fetch(`${API_BASE}/workers/site-staff/${workerId}/projects/${projectId}/assign`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({}),
  }).then(handle);

/** POST /workers/attendance/bulk — mark worker attendance in bulk
 * body: { projectId, date, attendanceData: [{workerType, workerId, status, shiftMultiplier, wageRate, shiftTypeId?}] }
 */
export const bulkMarkWorkerAttendance = (body) =>
  fetch(`${API_BASE}/workers/attendance/bulk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);

/** GET /workers/attendance?projectId=X&date=Y — get saved worker attendance records */
export const getWorkerAttendance = (projectId, date) =>
  fetch(`${API_BASE}/workers/attendance?projectId=${projectId}&date=${encodeURIComponent(date)}`, {
    headers: authHeaders(),
  }).then(handle);

/** PUT /workers/attendance/:id — update an individual worker attendance record */
export const updateWorkerAttendance = (id, body) =>
  fetch(`${API_BASE}/workers/attendance/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);

// ─── Users (for staff salary lookup) ─────────────────────────────────────────

/** GET /users?limit=500 — fetch all users for salary map */
export const getAllUsers = () =>
  fetch(`${API_BASE}/users?limit=500`, {
    headers: authHeaders(),
  }).then(handle);

/** GET /projects/:id/team — get project team assignments */
export const getProjectTeam = (projectId, date) => {
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  return fetch(`${API_BASE}/projects/${projectId}/team${qs}`, {
    headers: authHeaders(),
  }).then(handle);
};
