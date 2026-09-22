import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getProjectStatistics, updateProject, deleteProject } from "../../services/projectServices";
import { OverviewTab, AttendanceTab, InventoryTab, FinanceTab, DPRTab, TasksTab, SubcontractorTab, TimelineTab } from "./tabs/ProjectTabs";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Overview");
  
  // Modals/UI State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3500);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projRes, statsRes] = await Promise.all([
        getProjectById(id),
        getProjectStatistics(id).catch(() => null) // Ignore stats error if not available yet
      ]);
      
      if (projRes.success) setProject(projRes.data);
      if (statsRes?.success) setProjectStats(statsRes.data);
    } catch (e) {
      showToast(e.message || "Failed to load project details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (project.status === newStatus) return;
    try {
      await updateProject(id, { status: newStatus });
      setProject({ ...project, status: newStatus });
      showToast("Status updated successfully");
      setShowStatusDropdown(false);
    } catch (e) {
      showToast(e.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(id);
      showToast("Project deleted successfully");
      navigate(-1);
    } catch (e) {
      showToast(e.message || "Failed to delete project", "error");
    }
    setShowDeleteConfirm(false);
  };

  if (isLoading && !project) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
    );
  }

  if (!project) return <div className="p-6 text-center text-red-500">Project not found</div>;

  // Header helpers
  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === 'ongoing') return 'bg-[#F9A825]';
    if (s === 'completed') return 'bg-green-600';
    if (s === 'cancelled' || s === 'delayed') return 'bg-red-600';
    if (s === 'on_hold' || s === 'onhold') return 'bg-purple-600';
    return 'bg-[#0066CC]'; // Planning/default
  };

  // Metrics
  const estimatedBudget = projectStats?.budget?.estimated ?? project.estimatedBudget ?? 0;
  const daysLeft = projectStats?.timeline?.daysLeft ?? 0;
  const tasksCompleted = projectStats?.tasks?.completed ?? 0;
  const tasksTotal = projectStats?.tasks?.total ?? 0;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${("0"+d.getDate()).slice(-2)} ${d.toLocaleString('en-US',{month:'short'})} ${d.getFullYear()}`;
  };

  const tabs = ['Overview', 'Attendance', 'Inventory', 'Transactions', 'DPR', 'Tasks', 'Sub-contractor', 'Timeline'];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans relative">
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-lg text-white font-bold shadow-lg ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.message}
        </div>
      )}

      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold flex-1">Project details</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Collapsible Header */}
        {isHeaderVisible && (
          <div className="bg-white p-5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{project.name}</h2>
                <p className="text-gray-500 text-[14px] mt-0.5">{project.location}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-[12px] text-gray-500">Start: <span className="text-[#0066CC] font-semibold">{formatDate(project.startDate)}</span></p>
                  <p className="text-[12px] text-gray-500">End: <span className="text-[#0066CC] font-semibold">{formatDate(project.estimatedEndDate)}</span></p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 mb-2">
                  <button onClick={() => navigate(`/admin/projects/edit/${project.id}`, { state: { project } })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <p className="text-[12px] text-gray-700">Progress: <span className="font-bold">{project.progress || 0}%</span></p>
                <p className="text-[12px] text-gray-700">Priority: <span className="font-bold text-red-500 uppercase">{project.priority}</span></p>
                
                {/* Status Dropdown */}
                <div className="relative mt-2">
                  <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} className={`${getStatusColor(project.status)} px-3 py-1 rounded text-white text-[11px] font-bold uppercase flex items-center gap-1`}>
                    {project.status || "PLANNING"}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                      {['PLANNING', 'ONGOING', 'ON_HOLD', 'DELAYED', 'COMPLETED', 'CANCELLED'].map(s => (
                        <button key={s} onClick={() => handleUpdateStatus(s)} className={`w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 ${project.status === s ? 'font-bold text-[#0066CC]' : 'text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="flex gap-3 mt-6">
              <MetricCard icon="payments" title={`₹${Number(estimatedBudget).toLocaleString('en-IN')}`} subtitle="Budget" />
              <MetricCard icon="timer" title={`${daysLeft} Days`} subtitle="Left" />
              <MetricCard icon="analytics" title={`${tasksCompleted} / ${tasksTotal}`} subtitle="Tasks" />
            </div>
          </div>
        )}

        {/* Divider / Toggle Arrow */}
        <div className="h-8 bg-white relative flex justify-center items-center">
          <hr className="w-full border-gray-200 absolute" />
          <button onClick={() => setIsHeaderVisible(!isHeaderVisible)} className="z-10 bg-white border border-gray-200 w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <svg className={`w-4 h-4 transform transition-transform ${isHeaderVisible ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white px-5 pt-2 pb-6 min-h-[400px]">
          <div className="flex overflow-x-auto hide-scrollbar pb-4 gap-2.5">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`shrink-0 px-4 py-1.5 rounded-md text-[13px] border transition-colors ${
                  selectedTab === tab 
                    ? "border-[#0066CC] text-[#0066CC] bg-blue-50/50 font-medium" 
                    : "border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="pt-2 animate-in fade-in duration-300">
            {selectedTab === 'Overview' && <OverviewTab project={project} projectStats={projectStats} />}
            {selectedTab === 'Attendance' && <AttendanceTab project={project} projectStats={projectStats} />}
            {selectedTab === 'Inventory' && <InventoryTab project={project} />}
            {selectedTab === 'Transactions' && <FinanceTab project={project} />}
            {selectedTab === 'DPR' && <DPRTab project={project} />}
            {selectedTab === 'Tasks' && <TasksTab />}
            {selectedTab === 'Sub-contractor' && <SubcontractorTab project={project} />}
            {selectedTab === 'Timeline' && <TimelineTab project={project} />}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <h3 className="text-[18px] font-bold text-red-600 mb-3 text-center">Delete Project</h3>
            <p className="text-[14px] text-gray-700 text-center mb-6 leading-relaxed">
              Are you sure you want to delete '<strong>{project.name}</strong>'? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 rounded-xl font-semibold text-white hover:bg-red-700 shadow-md shadow-red-600/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, title, subtitle }) {
  return (
    <div className="flex-1 bg-[#F5F7FA] rounded-xl py-3 px-2 flex flex-col items-center justify-center text-center">
      <div className="w-6 h-6 text-[#0066CC] mb-1.5">
        {icon === 'payments' && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        {icon === 'timer' && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        {icon === 'analytics' && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
      </div>
      <p className="text-[12px] font-bold text-gray-900 leading-tight whitespace-nowrap">{title}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}
