import apiClient from "../../../api/apiClient";

export const getSubcontractors = async (params = {}) => {
  const res = await apiClient.get("/subcontractors", { params });
  return res.data?.data || res.data;
};

export const getContractorProjectsByProjectId = async (projectId, params = {}) => {
  const res = await apiClient.get(`/subcontractors/${projectId}/contractorProjectsByProjectId`, { params });
  return res.data?.data || res.data || [];
};

export const createSubcontractor = async (data) => {
  const res = await apiClient.post("/subcontractors", data);
  return res.data?.data || res.data;
};

export const createContractorProject = async (contractorId, projectId, data) => {
  const res = await apiClient.post(`/subcontractors/${contractorId}/${projectId}`, data);
  return res.data?.data || res.data;
};

export const updateSubcontractor = async (id, data) => {
  const res = await apiClient.put(`/subcontractors/${id}`, data);
  return res.data?.data || res.data;
};

export const updateContractorProject = async (contractorProjectId, data) => {
  const res = await apiClient.patch(`/subcontractors/projects/${contractorProjectId}`, data);
  return res.data?.data || res.data;
};

export const deleteSubcontractor = async (id) => {
  const res = await apiClient.delete(`/subcontractors/${id}`);
  return res.data?.data || res.data;
};

export const deleteContractorProject = async (contractorProjectId) => {
  const res = await apiClient.delete(`/subcontractors/projects/${contractorProjectId}`);
  return res.data?.data || res.data;
};

export const getSubcontractorById = async (id) => {
  const res = await apiClient.get(`/subcontractors/${id}`);
  return res.data?.data || res.data;
};

export const getSubcontractorWorkers = async (subcontractorId) => {
  const res = await apiClient.get(`/subcontractors/${subcontractorId}/workers`);
  return res.data?.data || res.data || [];
};

export const addSubcontractorWorker = async (subcontractorId, data) => {
  const res = await apiClient.post(`/subcontractors/${subcontractorId}/workers`, data);
  return res.data?.data || res.data;
};

export const getWorkerDetails = async (workerId) => {
  const res = await apiClient.get(`/subcontractors/workers/${workerId}`);
  return res.data?.data || res.data;
};

export const getContractorProjectById = async (contractorProjectId) => {
  const res = await apiClient.get(`/subcontractors/projects/${contractorProjectId}`);
  return res.data?.data || res.data;
};
