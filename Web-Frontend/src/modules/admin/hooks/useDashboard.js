// src/modules/admin/hooks/useDashboard.js

import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getProjectsStats,
  getRecentActivities,
} from "../services/dashboard.service";

const useDashboard = () => {
  const [stats, setStats] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel API calls
      const [summaryRes, projectsRes, activitiesRes] = await Promise.all([
        getDashboardSummary(),
        getProjectsStats(),
        getRecentActivities(),
      ]);

      // ⚠️ Adjust mapping based on actual backend response shape
   // Summary
setStats(summaryRes?.data?.quickActions || {});

// Projects → ensure array
setProjects(
  Array.isArray(projectsRes?.data)
    ? projectsRes.data
    : []
);

// Activities → ensure array
setActivities(
  Array.isArray(activitiesRes?.data)
    ? activitiesRes.data
    : []
);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    stats,
    projects,
    activities,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export default useDashboard;