import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';

import ProjectList from './components/ProjectList';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch projects from backend
  const fetchProjects = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("/projects");

      console.log("🔥 PROJECTS FROM BACKEND:", res.data.data);

      // ✅ IMPORTANT: normalize data for your UI
      const formattedProjects = res.data.data.map((p) => ({
        ...p,

        // fallback values so UI doesn't break
        idCode: p.projectCode || p.id,
        client: p.clientName || 'N/A',
        location: p.location || 'N/A',
        manager: p.managerName || 'N/A',
        engineer: p.engineerName || 'N/A',

        budget: p.budget || '—',
        contract: p.contractValue || '—',
        advance: p.advanceReceived || '—',

        start: p.startDate || '—',
        end: p.endDate || '—',

        progress: p.progress || 0,
        status: p.status || 'Ongoing',
        priority: p.priority || 'Medium',

        daysLeft: p.daysLeft || 0,
        tasks: p.tasksSummary || '0/0',

        milestones: p.milestones || [],
        activities: p.activities || [],
      }));

      setProjects(formattedProjects);

    } catch (err) {
      console.error("❌ Failed to fetch projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4">

      {/* ✅ Loading State */}
      {loading && (
        <div className="text-center text-slate-500">Loading projects...</div>
      )}

      {/* ❌ Error State */}
      {error && (
        <div className="text-center text-red-500">{error}</div>
      )}

      {/* ✅ LIST VIEW */}
      {!loading && (
        <ProjectList
          projects={projects}
          onOpenDetail={(id) => navigate(`/admin/projects/${id}`)}
          onCreateClick={() => navigate(`/admin/projects/create`)}
        />
      )}
    </div>
  );
}