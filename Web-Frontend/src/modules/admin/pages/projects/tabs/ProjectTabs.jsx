import React, { useState, useEffect } from 'react';
import { getProjectBudgets, updateBudgetStatus, deleteBudget, transferBudgetAmount } from '../../../services/budgetServices';

export function OverviewTab({ project, projectStats }) {
  if (!project) return null;

  const budgetText = projectStats?.budget?.estimated 
    ? `₹${Number(projectStats.budget.estimated).toLocaleString('en-IN')}` 
    : `₹${Number(project.estimatedBudget || 0).toLocaleString('en-IN')}`;
    
  const progressPercent = project.progress || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="#0A6ED1" strokeWidth="10" 
                strokeDasharray="283" strokeDashoffset={283 - (283 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{progressPercent}%</span>
            </div>
          </div>
          <button className="mt-4 px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold hover:bg-gray-300">
            VIEW GANTT
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <InfoRow label="Location:" value={project.location} />
          <InfoRow label="Manager:" value={project.createdBy?.name || 'Not Assigned'} />
          <InfoRow label="Engineer:" value="Assigned" />
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="font-bold text-gray-900 mb-2">Recent Activities</h3>
        <p className="text-sm text-gray-500 italic">No recent activities available.</p>
      </div>
      
      <hr className="border-gray-200" />

      <div>
        <h3 className="font-bold text-gray-900 mb-2">Milestones</h3>
        <p className="text-sm text-gray-500 italic">No milestones set.</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start mb-2">
      <span className="text-gray-500 text-sm w-24 shrink-0">{label}</span>
      <span className="text-[#0A6ED1] font-medium text-sm flex-1">{value}</span>
    </div>
  );
}

export function AttendanceTab({ project, projectStats }) {
  const navigate = useNavigate();
  const honors = projectStats?.workforce || {};
  const laborCount = honors.labors || 0;
  const staffCount = honors.staff || 0;
  const totalWorkforce = honors.total || 0;
  
  const payroll = projectStats?.payroll || {};
  const laborPayroll = payroll.labors || 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 space-y-4">
          <StatCard title="Labors" value={laborCount} valueColor="text-blue-600" />
          <StatCard title="Staff" value={staffCount} valueColor="text-green-600" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center border border-gray-100 rounded-xl bg-white p-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#0D6EFD" strokeWidth="10" strokeLinecap="round" />
            </svg>
            <div className="text-center z-10">
              <div className="text-3xl font-bold">{totalWorkforce}</div>
              <div className="text-xs text-gray-500 font-bold uppercase">Total<br/>Workforce</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border border-gray-200 rounded-xl bg-white">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Labor Payroll: ₹{laborPayroll.toLocaleString('en-IN')}</h3>
          <button
            onClick={() => navigate(`/admin/projects/${project?.id}/payroll`)}
            className="px-4 py-1.5 bg-[#0D6EFD] text-white text-xs font-bold rounded-full hover:bg-blue-700"
          >
            Payroll
          </button>
        </div>
        <p className="text-xs text-gray-500">This reflects the total labor costs for the current month.</p>
      </div>
      
      {/* Mark Attendance — navigates to full attendance marking page */}
      <div className="pt-2">
         <button
           onClick={() => navigate(`/admin/projects/${project?.id}/attendance/mark`)}
           className="w-full py-3.5 bg-[#0D6EFD] text-white font-bold rounded-full text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
         >
            Mark Attendance
         </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, valueColor }) {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
      <span className="text-lg font-medium text-gray-800">{title}</span>
      <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

// Budget Viewer (formerly FinanceTab)
export function FinanceTab({ project }) {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgets = async () => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const res = await getProjectBudgets(project.id);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setBudgets(list);
      if (list.length > 0) {
        const active = list.find(b => b.isActive || b.status === 'ACTIVE');
        setSelectedBudgetId(active ? active.id : list[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [project?.id]);

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);

  const handleUpdateStatus = async (status) => {
    try {
      await updateBudgetStatus(selectedBudget.id, status);
      fetchBudgets();
    } catch (e) { alert('Failed: ' + e.message); }
  };

  const handleDeleteBudget = async () => {
    if (!window.confirm('Delete this budget? This action cannot be undone.')) return;
    try {
      await deleteBudget(selectedBudget.id);
      fetchBudgets();
    } catch (e) { alert('Failed: ' + e.message); }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl py-12 flex flex-col items-center text-center shadow-sm">
        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" /></svg>
        <p className="text-gray-500 text-sm mb-4">No budgets found for this project.</p>
        <button onClick={() => navigate(`/admin/projects/${project.id}/budget/create`)} className="px-4 py-2 bg-[#0066CC] text-white font-bold rounded-lg hover:bg-blue-700 text-sm">
          + Create First Budget
        </button>
      </div>
    );
  }

  const categories = selectedBudget?.categories || [];
  const canEdit = selectedBudget?.status === 'DRAFT' || selectedBudget?.status === 'REJECTED';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <select value={selectedBudgetId || ''} onChange={e => setSelectedBudgetId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]">
            {budgets.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {canEdit && (
            <button onClick={() => navigate(`/admin/projects/${project.id}/budget/edit?budgetId=${selectedBudget.id}`)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
          )}
          <button onClick={() => navigate(`/admin/projects/${project.id}/budget/create?copyFrom=${selectedBudget.id}`)} className="px-3 py-2 bg-[#0066CC] text-white font-bold rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
            + New Version
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200 text-xs text-gray-600">
              <th className="px-3 py-2 font-bold w-12">Sr.</th>
              <th className="px-3 py-2 font-bold">Category</th>
              <th className="px-3 py-2 font-bold">Sub-Category</th>
              <th className="px-3 py-2 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {categories.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-500">No categories in this budget</td></tr>
            ) : (
              categories.map((cat, i) => (
                <tr key={cat.id || i}>
                  <td className="px-3 py-2 text-gray-500">{(i + 1).toString().padStart(2, '0')}</td>
                  <td className="px-3 py-2 font-semibold text-[#0066CC]">{cat.category}</td>
                  <td className="px-3 py-2">{cat.subCategory || '-'}</td>
                  <td className="px-3 py-2 text-right font-semibold">₹{Number(cat.allocatedAmount).toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
            <tr className="bg-gray-50 font-bold">
              <td colSpan="3" className="px-3 py-3 text-right">Total ({categories.length})</td>
              <td className="px-3 py-3 text-right text-[#0066CC] text-base">
                ₹{Number(selectedBudget?.totalApproved || 0).toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        {selectedBudget?.status === 'ACTIVE' && (
          <div className="flex gap-2">
            <button onClick={() => navigate(`/admin/projects/${project.id}/budget/${selectedBudget.id}/transactions`)} className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-bold text-[#0066CC] hover:bg-blue-50 border border-gray-200">
              <div className="flex flex-col items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>Transactions</div>
            </button>
            <button onClick={() => navigate(`/admin/projects/${project.id}/budget/revisions?budgetId=${selectedBudget.id}`)} className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-bold text-[#0066CC] hover:bg-blue-50 border border-gray-200">
              <div className="flex flex-col items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Revisions</div>
            </button>
            <button onClick={() => navigate(`/admin/projects/${project.id}/budget/audit?budgetId=${selectedBudget.id}`)} className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-bold text-[#0066CC] hover:bg-blue-50 border border-gray-200">
              <div className="flex flex-col items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Audit</div>
            </button>
          </div>
        )}
        {selectedBudget?.status === 'APPROVED' && (
          <button onClick={() => handleUpdateStatus('ACTIVE')} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">Activate Budget</button>
        )}
        {(selectedBudget?.status === 'DRAFT' || selectedBudget?.status === 'REJECTED') && (
          <div className="flex gap-3">
            <button onClick={handleDeleteBudget} className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100">Delete Budget</button>
            <button onClick={() => handleUpdateStatus('PENDING_APPROVAL')} className="flex-1 py-3 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700">Submit Approval</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InventoryTab({ project }) {
  return (
    <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
      <h3 className="text-lg font-bold text-gray-700 mb-2">Project Inventory Dashboard</h3>
      <p className="text-sm text-gray-500">This section connects to the Global Inventory module. No stock found.</p>
    </div>
  );
}

import { getContractorProjectsByProjectId } from '../../../services/subcontractor.service';
import { ListSkeleton } from '../../../../../shared/components/Skeletons';
import AssignSubcontractorModal from '../subcontractors/components/AssignSubcontractorModal';

export function SubcontractorTab({ project }) {
  const navigate = useNavigate();
  const [contractorProjects, setContractorProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchProjectSubcontractors = () => {
    if (project?.id) {
      setIsLoading(true);
      getContractorProjectsByProjectId(project.id)
        .then(res => setContractorProjects(res || []))
        .catch(e => console.error("Failed to load project subcontractors:", e))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchProjectSubcontractors();
  }, [project?.id]);

  if (isLoading) return <div className="p-5"><ListSkeleton rows={3} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Project Subcontractors</h3>
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="px-4 py-2 bg-[#0066CC] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Assign Subcontractor
        </button>
      </div>
      
      {contractorProjects.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <p className="text-sm text-gray-500 font-medium">No subcontractors assigned to this project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contractorProjects.map(cp => (
            <div 
              key={cp.id}
              onClick={() => navigate(`/admin/projects/${project.id}/subcontractors/${cp.id}`)}
              className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-start"
            >
              <div>
                <h4 className="font-bold text-gray-900 text-base">{cp.contractor?.name}</h4>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{cp.workType}</span>
                  <span>Amount: ₹{Number(cp.contractAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                cp.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                cp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-[#0066CC]' :
                'bg-orange-100 text-orange-700'
              }`}>
                {cp.status?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <AssignSubcontractorModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        projectId={project?.id}
        onSuccess={fetchProjectSubcontractors}
      />
    </div>
  );
}

// Coming Soon Shells
import { useNavigate } from 'react-router-dom';
import { fetchDPRsByProject, deleteDPR } from '../../../services/dprServices';
import { fetchWPRsByProject } from '../../../services/wprServices';

export function DPRTab({ project }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(0); // 0 = Daily, 1 = Weekly
  const [dprs, setDprs] = useState([]);
  const [wprs, setWprs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 8}, (_, i) => (currentYear - 5 + i).toString());
  
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (project?.id) {
      if (selectedType === 0) {
        loadDprs();
      } else {
        loadWprs();
      }
    }
    // eslint-disable-next-line
  }, [project?.id, selectedType]);

  const loadDprs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDPRsByProject(project.id);
      if (res.success) {
        setDprs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWprs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWPRsByProject(project.id);
      // Backend might return directly the array in res.data or res.data.wprs, assume res.data
      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (res.data?.wprs) list = res.data.wprs;
      else if (res.data?.data) list = res.data.data;
      setWprs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id) => {
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) newIds.delete(id);
    else newIds.add(id);
    setSelectedIds(newIds);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} DPR(s)?`)) return;
    
    setIsDeleting(true);
    try {
      for (let id of selectedIds) {
        await deleteDPR(id);
      }
      toggleSelectionMode();
      loadDprs();
    } catch (e) {
      alert("Failed to delete DPRs: " + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSelected = () => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    if (selectedType === 0) {
      navigate(`/admin/projects/${project.id}/dpr/edit/${id}`);
    } else {
      navigate(`/admin/projects/${project.id}/wpr/edit/${id}`);
    }
  };

  // Filters
  const filteredDprs = dprs.filter(d => {
    if (!d.date) return false;
    const dDate = new Date(d.date);
    const mStr = months[dDate.getMonth()];
    const yStr = dDate.getFullYear().toString();
    return mStr === selectedMonth && yStr === selectedYear;
  });

  const filteredWprs = wprs.filter(w => {
    const dDate = new Date(w.weekStartDate || w.createdAt);
    if (isNaN(dDate.getTime())) return false;
    const mStr = months[dDate.getMonth()];
    const yStr = dDate.getFullYear().toString();
    return mStr === selectedMonth && yStr === selectedYear;
  });

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Toggle */}
      {!isSelectionMode && (
        <div className="h-[42px] p-1 bg-gray-100 rounded-[22px] flex">
          <button 
            className={`flex-1 rounded-[18px] font-semibold transition-colors ${selectedType === 0 ? 'bg-[#0066CC] text-white' : 'text-gray-700 bg-transparent'}`}
            onClick={() => setSelectedType(0)}
          >
            Daily
          </button>
          <button 
            className={`flex-1 rounded-[18px] font-semibold transition-colors ${selectedType === 1 ? 'bg-[#0066CC] text-white' : 'text-gray-700 bg-transparent'}`}
            onClick={() => setSelectedType(1)}
          >
            Weekly
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        {isSelectionMode ? (
          <>
            <span className="text-[16px] font-bold text-[#0066CC]">{selectedIds.size} Selected</span>
            <div className="flex gap-2">
              <button 
                disabled={selectedIds.size !== 1}
                onClick={handleEditSelected}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button 
                disabled={selectedIds.size === 0 || isDeleting}
                onClick={handleDeleteSelected}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                )}
              </button>
              <button onClick={toggleSelectionMode} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-[18px] font-bold text-gray-900">{selectedType === 0 ? "DPR list" : "WPR list"}</span>
            <div className="flex gap-2">
              <button onClick={toggleSelectionMode} className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button onClick={toggleSelectionMode} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select 
          value={selectedMonth} 
          onChange={e => setSelectedMonth(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#0066CC] text-[#0066CC] font-bold text-[13px] bg-white outline-none"
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select 
          value={selectedYear} 
          onChange={e => setSelectedYear(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#0066CC] text-[#0066CC] font-bold text-[13px] bg-white outline-none"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
      ) : selectedType === 0 ? (
        filteredDprs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No reports found for {selectedMonth} {selectedYear}.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDprs.map(d => {
              const isSelected = selectedIds.has(d.id);
              const dDate = new Date(d.date);
              const formattedDate = `${("0"+dDate.getDate()).slice(-2)} ${months[dDate.getMonth()]} ${dDate.getFullYear()}`;
              const prepName = d.preparedBy?.name || 'User';
              const status = d.status || 'TODO';
              const isApproved = ['APPROVED', 'COMPLETED'].includes(status.toUpperCase());
              
              return (
                <div 
                  key={d.id}
                  onClick={() => {
                    if (isSelectionMode) toggleSelection(d.id);
                    else navigate(`/admin/projects/${project.id}/dpr/${d.id}`);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/50 border-[#0066CC]' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[16px] font-bold text-gray-900">{formattedDate}</h4>
                      <p className="text-[12px] text-gray-500 mt-1">Prepared by: {prepName}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase ${
                      isApproved ? 'bg-green-500' : 'bg-[#0066CC]'
                    }`}>
                      {status.toUpperCase() === 'TODO' ? 'SUBMITTED' : status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        filteredWprs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No WPRs found for {selectedMonth} {selectedYear}.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWprs.map(w => {
              const isSelected = selectedIds.has(w.id);
              const start = new Date(w.weekStartDate);
              const end = new Date(w.weekEndDate);
              const formattedDate = `${("0"+start.getDate()).slice(-2)} - ${("0"+end.getDate()).slice(-2)} ${months[end.getMonth()]}`;
              
              return (
                <div 
                  key={w.id}
                  onClick={() => {
                    if (isSelectionMode) toggleSelection(w.id);
                    else navigate(`/admin/projects/${project.id}/wpr/${w.id}`, { state: { wpr: w } });
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/50 border-[#0066CC]' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[16px] font-bold text-gray-900">{formattedDate}</h4>
                      <p className="text-[12px] text-gray-500 mt-1">{w.reportNo || "WPR"}</p>
                    </div>
                    {isSelected ? (
                      <svg className="w-6 h-6 text-[#0066CC]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Floating Create Button if not in selection mode */}
      {!isSelectionMode && (
        <div className="pt-4">
           <button 
             onClick={() => navigate(`/admin/projects/${project.id}/${selectedType === 0 ? 'dpr' : 'wpr'}/create`)}
             className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-full text-[16px] hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
           >
              Create New {selectedType === 0 ? 'DPR' : 'WPR'}
           </button>
        </div>
      )}
    </div>
  );
}

export function TimelineTab({ project }) {
  const navigate = useNavigate();
  const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i);

  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [calendarData, setCalendarData] = useState(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approverComment, setApproverComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedApproverId, setSelectedApproverId] = useState('');

  const timelineId = project?.timelineId || null;

  const loadVersions = async () => {
    if (!timelineId) { setIsLoadingVersions(false); return; }
    setIsLoadingVersions(true);
    try {
      const { getTimelineVersions } = await import('../../../services/timelineServices');
      const res = await getTimelineVersions(timelineId);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setVersions(list);
      if (list.length > 0 && !selectedVersionId) {
        setSelectedVersionId(list[0].id);
      }
    } catch (e) {
      console.error('Timeline versions error:', e);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const loadCalendar = async (vId) => {
    if (!timelineId) return;
    setIsLoadingCalendar(true);
    setCalendarError(null);
    try {
      const { getTimelineCalendar } = await import('../../../services/timelineServices');
      const data = await getTimelineCalendar(timelineId, selectedYear, selectedMonth, vId || selectedVersionId);
      setCalendarData(data);
    } catch (e) {
      setCalendarError(e.message);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => { loadVersions(); }, [timelineId]);

  useEffect(() => {
    if (!isLoadingVersions && (versions.length === 0 || selectedVersionId)) {
      loadCalendar(selectedVersionId);
    }
  }, [selectedVersionId, selectedMonth, selectedYear, isLoadingVersions]);

  const selectedVersion = versions.find(v => v.id === selectedVersionId) || null;

  const handleSubmitForApproval = async () => {
    if (!selectedApproverId) { alert('Please select an approver.'); return; }
    setIsSubmitting(true);
    try {
      const { submitVersionForApproval } = await import('../../../services/timelineServices');
      const vNum = selectedVersion?.versionNumber;
      await submitVersionForApproval(timelineId, vNum, {
        approverId: selectedApproverId,
        comments: approverComment.trim(),
      });
      alert('Submitted for review successfully');
      setShowSubmitModal(false);
      loadVersions();
    } catch (e) {
      alert('Submission failed: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    } catch { return iso.split('T')[0]; }
  };

  // If no timelineId, show create button
  if (!timelineId && !isLoadingVersions) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-[#0A6ED1] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Timeline Yet</h3>
        <p className="text-gray-500 text-sm mb-6">Create a timeline to schedule tasks and track project milestones.</p>
        <button
          onClick={() => navigate(`/admin/projects/${project?.id}/timeline/create`)}
          className="px-8 py-3 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
        >
          + Create Timeline
        </button>
      </div>
    );
  }

  const timelineInfo = calendarData?.timelineInfo || {};
  const summary = calendarData?.summary || {};
  const tasksByWeek = calendarData?.tasksByWeek || {};

  return (
    <div className="space-y-4">
      {/* Version Selector Row */}
      {!isLoadingVersions && versions.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 border border-blue-300 rounded-lg px-3 py-1 bg-white">
            <select
              value={selectedVersionId || ''}
              onChange={e => setSelectedVersionId(e.target.value)}
              className="w-full text-sm font-medium outline-none bg-transparent text-gray-800"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  V{v.versionNumber} - {v.name}{v.isBaseline ? ' [BASELINE]' : ''}
                </option>
              ))}
            </select>
          </div>
          {/* Submit for Approval button for draft/rejected versions */}
          {['DRAFT','REJECTED'].includes((selectedVersion?.status || '').toUpperCase()) && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600"
            >
              SUBMIT
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/projects/${project?.id}/timeline/edit`)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
            title="Edit Timeline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>
      )}

      {isLoadingCalendar ? (
        <div className="py-12 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : calendarError ? (
        <div className="py-8 text-center">
          <p className="text-red-500 text-sm mb-3">Unable to load timeline. {calendarError}</p>
          <button onClick={() => loadCalendar(selectedVersionId)} className="px-4 py-2 bg-[#0066CC] text-white text-sm rounded-full">Retry</button>
        </div>
      ) : (
        <>
          {/* Timeline Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{timelineInfo.name || 'Timeline'}</h3>
            <button
              onClick={() => navigate(`/admin/projects/${project?.id}/timeline/edit`)}
              className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex justify-between text-xs font-medium text-gray-700">
            <span>Total Tasks — {summary.totalTasks || 0}</span>
            <span>Active Weeks — {summary.totalWeeks || 0}</span>
            <span>Status: {selectedVersion?.status || 'N/A'}</span>
          </div>

          {/* Month / Year Selectors + Date range */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="border border-[#0066CC] rounded-lg px-2 py-1">
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="text-[#0066CC] font-bold text-xs outline-none bg-transparent"
                >
                  {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="border border-[#0066CC] rounded-lg px-2 py-1">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="text-[#0066CC] font-bold text-xs outline-none bg-transparent"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">Start: {formatDate(timelineInfo.startDate)}</p>
              <p className="text-[10px] text-gray-500">Est. End: {formatDate(timelineInfo.endDate)}</p>
            </div>
          </div>

          <div className="border-t-2 border-[#0066CC]" />

          <h4 className="text-base font-bold text-center">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h4>
          <p className="text-sm font-semibold text-gray-700 mt-1">Weekly Tasks</p>

          {/* Tasks by Week */}
          {Object.keys(tasksByWeek).length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No tasks scheduled for this month.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(tasksByWeek).map(([weekKey, tasks]) => {
                const weekNum = parseInt(weekKey.replace(/\D/g, '')) || 1;
                return (
                  <div key={weekKey} className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="w-10 bg-[#3B71CA] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-base">{weekNum}</span>
                    </div>
                    <div className="flex-1 bg-gray-50">
                      {(tasks || []).map((taskData, idx) => {
                        const t = taskData?.task || {};
                        const title = t.title || 'Unknown Task';
                        const status = taskData?.timelineStatus || 'SCHEDULED';
                        const assignee = t.assignedTo?.name || 'Unassigned';
                        const isCritical = taskData?.isCritical === true;
                        return (
                          <details key={idx} className="border-b border-gray-200 last:border-b-0">
                            <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer list-none">
                              <span className="text-sm font-medium text-gray-800 flex-1">{title}</span>
                              {isCritical && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">CRITICAL</span>
                              )}
                              <svg className="w-4 h-4 text-gray-400 ml-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                              </svg>
                            </summary>
                            <div className="px-4 pb-3 text-xs text-gray-500 space-y-1">
                              <p>• Status: {status}</p>
                              <p>• Assignee: {assignee}</p>
                              {t.description && <p>• Notes: {t.description}</p>}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create New Version Link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => navigate(`/admin/projects/${project?.id}/timeline/versions/create`)}
              className="text-[#0066CC] text-sm font-semibold hover:underline"
            >
              + Add New Version
            </button>
          </div>
        </>
      )}

      {/* Submit For Approval Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">Submit for Approval</h3>
            <p className="text-sm text-gray-600 mb-4">Choose an approver and add any relevant notes.</p>
            <label className="block text-xs font-bold text-gray-500 mb-1">Approver</label>
            <input
              type="text"
              value={selectedApproverId}
              onChange={e => setSelectedApproverId(e.target.value)}
              placeholder="Enter approver user ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC]"
            />
            <label className="block text-xs font-bold text-gray-500 mb-1">Submission Notes</label>
            <textarea
              value={approverComment}
              onChange={e => setApproverComment(e.target.value)}
              placeholder="E.g., Adjusted foundation dates due to weather..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-[#0066CC] resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmitForApproval}
                className="flex-1 h-11 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TasksTab() {
  return <ComingSoon moduleName="Project Tasks" />;
}

export function RiskTab() {
  return <ComingSoon moduleName="Risk Management" />;
}

function ComingSoon({ moduleName }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-blue-50 text-[#0A6ED1] rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{moduleName}</h3>
      <p className="text-gray-500 text-sm">This module is coming soon in a future update.</p>
    </div>
  );
}
