import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDPRsByProject } from "../../services/dprServices";
import { projectService } from "../../../projects/services/project.service";
import InspectionDetailsModal from "./components/InspectionDetailsModal";

export default function InspectionPage() {
  const navigate = useNavigate();

  // Project selector — Inspection is project-scoped like the Flutter version
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dprs, setDprs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [historyMode, setHistoryMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch project list for selector
  useEffect(() => {
    projectService.getAllProjects()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // Fetch DPRs when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    fetchDPRsByProject(selectedProjectId)
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setDprs(list);
      })
      .catch(e => console.error("Failed to load DPRs:", e))
      .finally(() => setLoading(false));
  }, [selectedProjectId, historyMode]);

  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  const filteredDprs = dprs.filter((item) => {
    const status = (item.status || '').toUpperCase();
    if (!historyMode && status !== "REVIEW" && status !== "TODO" && status !== "PENDING") return false;
    if (historyMode && (status === "REVIEW" || status === "TODO" || status === "PENDING")) return false;

    const prepName = item.preparedBy?.name || '';
    const dDate = item.date ? new Date(item.date).toLocaleDateString() : '';
    const matchesSearch = !searchQuery ||
      dDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prepName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !dateFilter || (item.date && item.date.startsWith(dateFilter));
    return matchesSearch && matchesDate;
  });

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'COMPLETED') return 'bg-green-500 text-white';
    if (s === 'REJECTED') return 'bg-red-500 text-white';
    return 'bg-brand-600 text-white';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }} className="flex-1 p-4 md:p-6 fade-up">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 min-h-[75vh]">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {historyMode ? 'DPR Inspection History' : 'Pending DPR Inspections'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Reports with REVIEW status pending your approval</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => setHistoryMode(!historyMode)}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {historyMode ? "View Pending" : "View History"}
            </button>

            {/* Project selector */}
            {!projectsLoading && projects.length > 0 && (
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="text-xs border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}

            <div className="relative flex-1 sm:w-40">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="relative flex-shrink-0">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
          {loading || projectsLoading ? (
            <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
          ) : !selectedProjectId ? (
            <p className="text-sm text-slate-400 text-center py-8">Select a project to view inspection data.</p>
          ) : filteredDprs.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-slate-200 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p className="text-sm text-slate-400">No {historyMode ? 'historical' : 'pending'} DPRs found.</p>
            </div>
          ) : (
            filteredDprs.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 px-5 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatDate(item.date)}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Prepared by: <span className="text-brand-600 dark:text-brand-400">{item.preparedBy?.name || 'N/A'}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {historyMode ? (
                    <>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${getStatusStyle(item.status)}`}>{item.status}</span>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/projects/${selectedProjectId}/dpr/${item.id}?readOnly=1`); }}
                        className="text-xs text-brand-600 hover:underline mt-1"
                      >
                        View Full DPR →
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm">View</button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/projects/${selectedProjectId}/dpr/${item.id}?readOnly=1`); }}
                        className="text-xs text-slate-400 hover:text-brand-600 mt-1"
                      >
                        Full DPR →
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {isModalOpen && (
        <InspectionDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedItem}
          projectId={selectedProjectId}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
