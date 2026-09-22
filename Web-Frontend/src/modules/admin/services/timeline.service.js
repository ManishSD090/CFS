import apiClient from "../../../api/apiClient";

// 🔹 Get all timelines (FIXED: handle object + array response safely)
export const getTimelines = async (params = {}) => {
  if (!params.projectId) {
    console.warn("⚠️ getTimelines called WITHOUT projectId");
  }

  const res = await apiClient.get("/timelines", {
    params: {
      ...params, // ensures projectId is sent
    },
  });

  const data = res.data?.data;

  // 🔥 IMPORTANT FIX: normalize response
  if (!data) return [];

  // if backend returns single object → convert to array
  if (!Array.isArray(data)) return [data];

  return data;
};

// 🔹 Get timeline by ID
export const getTimelineById = async (id) => {
  const res = await apiClient.get(`/timelines/${id}`);
  return res.data?.data || null;
};

// 🔹 Create timeline
export const createTimeline = async (payload) => {
  const res = await apiClient.post("/timelines", payload);
  return res.data?.data || null;
};

// 🔹 Update timeline
export const updateTimeline = async (id, payload) => {
  const res = await apiClient.put(`/timelines/${id}`, payload);
  return res.data?.data || null;
};

// 🔹 Delete timeline
export const deleteTimeline = async (id) => {
  const res = await apiClient.delete(`/timelines/${id}`);
  return res.data?.data || null;
};

// 🔹 Get progress
export const getTimelineProgress = async (id) => {
  const res = await apiClient.get(`/timelines/${id}/progress`);
  return res.data?.data || null;
};

// 🔹 Get history
export const getTimelineHistory = async (id) => {
  const res = await apiClient.get(`/timelines/${id}/history`);
  return res.data?.data || [];
};