// src/modules/admin/services/dashboard.service.js

import apiClient from "../../../api/apiClient";

// ─────────────────────────────────────────────
// Dashboard Summary (Top Stats)
// GET /dashboard/summary
// ─────────────────────────────────────────────
export const getDashboardSummary = async () => {
  const res = await apiClient.get("/dashboard/summary");
  return res.data;
};

// ─────────────────────────────────────────────
// Projects Stats
// GET /dashboard/stats/projects
// ─────────────────────────────────────────────
export const getProjectsStats = async () => {
  const res = await apiClient.get("/dashboard/stats/projects");
  return res.data;
};

// ─────────────────────────────────────────────
// All Recent Activities
// GET /dashboard/activities
// ─────────────────────────────────────────────
export const getRecentActivities = async () => {
  const res = await apiClient.get("/dashboard/activities");
  return res.data;
};

// ─────────────────────────────────────────────
// Optional: Full Dashboard (if needed)
// GET /dashboard
// ─────────────────────────────────────────────
export const getFullDashboard = async () => {
  const res = await apiClient.get("/dashboard");
  return res.data;
};