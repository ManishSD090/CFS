import apiClient from '../../../api/apiClient';

// ==================== TIMELINE ROUTES ====================

// 1. Create & Manage Timelines
export const createTimeline = async (data) => {
  const response = await apiClient.post('/timelines', data);
  return response.data;
};

export const getAllTimelines = async (params) => {
  const response = await apiClient.get('/timelines', { params });
  return response.data;
};

export const getTimelineById = async (id) => {
  const response = await apiClient.get(`/timelines/${id}`);
  return response.data?.data || response.data;
};

export const updateTimeline = async (id, data) => {
  const response = await apiClient.put(`/timelines/${id}`, data);
  return response.data;
};

export const deleteTimeline = async (id) => {
  const response = await apiClient.delete(`/timelines/${id}`);
  return response.data;
};

// 2. Timeline Workflow
export const submitTimelineForApproval = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/submit`, data);
  return response.data;
};

export const approveRejectTimeline = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/approve-reject`, data);
  return response.data;
};

export const lockUnlockTimeline = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/lock-unlock`, data);
  return response.data;
};

export const archiveRestoreTimeline = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/archive-restore`, data);
  return response.data;
};

// 3. Timeline Progress & Analysis
export const getTimelineProgress = async (id) => {
  const response = await apiClient.get(`/timelines/${id}/progress`);
  return response.data;
};

export const getTimelineHistory = async (id) => {
  const response = await apiClient.get(`/timelines/${id}/history`);
  return response.data;
};

export const getTimelineApprovals = async (id) => {
  const response = await apiClient.get(`/timelines/${id}/approvals`);
  return response.data;
};

// ==================== VERSION ROUTES ====================

// 4. Version Management
export const createTimelineVersion = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/versions`, data);
  return response.data;
};

export const getTimelineVersions = async (id) => {
  const response = await apiClient.get(`/timelines/${id}/versions`);
  return response.data?.data || response.data;
};

export const getTimelineVersionById = async (id, versionNumber) => {
  const response = await apiClient.get(`/timelines/${id}/versions/${versionNumber}`);
  return response.data?.data || response.data;
};

export const updateTimelineVersion = async (id, versionNumber, data) => {
  const response = await apiClient.put(`/timelines/${id}/versions/${versionNumber}`, data);
  return response.data;
};

export const deleteTimelineVersion = async (id, versionNumber) => {
  const response = await apiClient.delete(`/timelines/${id}/versions/${versionNumber}`);
  return response.data;
};

// 5. Version Workflow
export const setVersionAsBaseline = async (id, versionNumber) => {
  const response = await apiClient.post(`/timelines/${id}/versions/${versionNumber}/set-baseline`);
  return response.data;
};

export const submitVersionForApproval = async (id, versionNumber, data) => {
  const response = await apiClient.post(`/timelines/${id}/versions/${versionNumber}/submit`, data);
  return response.data;
};

export const approveRejectVersion = async (id, versionNumber, data) => {
  const response = await apiClient.post(`/timelines/${id}/versions/${versionNumber}/approve-reject`, data);
  return response.data;
};

// 6. Version Comparison
export const compareVersions = async (id, version1, version2) => {
  const response = await apiClient.get(`/timelines/${id}/compare/${version1}/${version2}`);
  return response.data;
};

// ==================== TASK ROUTES ====================

// 7. Task Management
export const addTaskToTimeline = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/tasks`, data);
  return response.data;
};

export const createTaskAndAddToTimeline = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/tasks/new`, data);
  return response.data;
};

export const bulkAddTasksToTimeline = async (id, data) => {
  const response = await apiClient.post(`/timelines/${id}/tasks/bulk`, data);
  return response.data;
};

export const getTimelineTasks = async (id, params) => {
  const response = await apiClient.get(`/timelines/${id}/tasks`, { params });
  return response.data;
};

export const bulkUpdateTimelineTasks = async (id, data) => {
  const response = await apiClient.put(`/timelines/${id}/tasks/bulk`, data);
  return response.data;
};

export const updateTimelineTask = async (id, taskId, data) => {
  const response = await apiClient.put(`/timelines/${id}/tasks/${taskId}`, data);
  return response.data;
};

export const removeTaskFromTimeline = async (id, taskId) => {
  const response = await apiClient.delete(`/timelines/${id}/tasks/${taskId}`);
  return response.data;
};

// 8. Task Status Updates
export const updateTaskTimelineStatus = async (id, taskId, data) => {
  const response = await apiClient.patch(`/timelines/${id}/tasks/${taskId}/status`, data);
  return response.data;
};

// 9. Calendar View
export const getTimelineCalendar = async (id, year, month, versionId) => {
  const params = { year, month };
  if (versionId) params.versionId = versionId;
  const response = await apiClient.get(`/timelines/${id}/calendar`, { params });
  return response.data?.data || response.data;
};

// ==================== ANALYSIS ROUTES ====================

// 10. Analysis & Reports
export const getCriticalPath = async (id) => {
  const response = await apiClient.get(`/timelines/${id}/critical-path`);
  return response.data;
};

export const getTimelineGanttData = async (id) => {
  const response = await apiClient.get(`/timelines/${id}/gantt`);
  return response.data;
};

export const getProjectTimelineSummary = async (projectId) => {
  const response = await apiClient.get(`/timelines/project/${projectId}/summary`);
  return response.data;
};

export const getDelayedTimelines = async () => {
  const response = await apiClient.get(`/timelines/delayed`);
  return response.data;
};

export const getUpcomingMilestones = async () => {
  const response = await apiClient.get(`/timelines/upcoming-milestones`);
  return response.data;
};
