import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { approvalService } from "../../services/approval.service";
import ApprovalDetailsModal from "./components/ApprovalDetailsModal";

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("budget"); 
  const [viewMode, setViewMode] = useState("MAIN");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const statusParam = viewMode === "MAIN" ? "PENDING" : ""; 
      const data = await approvalService.getApprovals(statusParam);
      let filtered = data.filter(item => item.approvalType.toLowerCase() === activeTab);
      
      if (viewMode === "HISTORY") {
        filtered = filtered.filter(item => item.status !== "PENDING" && item.status !== "SUBMITTED");
      }
      setApprovals(filtered);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [activeTab, viewMode]);

  const filteredApprovals = approvals.filter((item) => {
    const textToSearch = `${item.submitterName} ${item.project?.name || item.projectName || ''}`.toLowerCase();
    return !searchQuery || textToSearch.includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }} className="flex-1 p-4 md:p-6 fade-up">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 min-h-[70vh]">
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-2xl p-1 w-fit mb-6">
              <button onClick={() => { setActiveTab("budget"); setViewMode("MAIN"); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "budget" ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                Budget
              </button>
              <button onClick={() => { setActiveTab("timeline"); setViewMode("MAIN"); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "timeline" ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                Timeline
              </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {activeTab === "budget" ? "Budget List" : "Timeline List"}
              </h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="field-input w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"/>
                  </div>
                  <button onClick={() => setViewMode(viewMode === "MAIN" ? "HISTORY" : "MAIN")} className="text-xs font-bold text-brand-600 hover:underline">
                      {viewMode === "MAIN" ? "View History" : "View Approvals"}
                  </button>
              </div>
          </div>

          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                  <div className="py-20 text-center text-sm font-bold text-slate-400">Loading...</div>
              ) : filteredApprovals.length === 0 ? (
                  <div className="py-20 text-center text-sm font-bold text-slate-400">No records found.</div>
              ) : (
                  filteredApprovals.map((item) => (
                      <div key={item.id || item._id} className="flex items-center justify-between py-5">
                          <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.project?.name || item.projectName || "Project Name"}</p>
                              <p className="text-xs font-medium text-slate-400 mt-0.5">{item.submitterName}</p>
                              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wide mt-1">{activeTab}</p>
                          </div>
                          <div className="text-right">
                              {viewMode === "MAIN" ? (
                                  <button onClick={() => { 
                                      if (activeTab === 'budget') {
                                          navigate(`/admin/approvals/budget/${item.id}`);
                                      } else if (activeTab === 'timeline') {
                                          navigate(`/admin/approvals/timeline/${item.id}`);
                                      } else {
                                          setSelectedItem(item); 
                                          setIsModalOpen(true); 
                                      }
                                  }} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-md shadow-brand-500/20">View</button>
                              ) : (
                                  <p className={`text-xs font-bold ${item.status === 'APPROVED' ? 'text-[#00b894]' : 'text-[#ff4757]'}`}>{item.status}</p>
                              )}
                              <p className="text-[10px] font-medium text-slate-300 mt-1">Sent: {formatDate(item.displayDate)}</p>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>

      <ApprovalDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedItem} onSuccess={fetchApprovals} />
    </div>
  );
}
