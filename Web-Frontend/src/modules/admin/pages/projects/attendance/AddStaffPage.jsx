import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllWorkers } from '../../../services/attendanceServices';

// Note: AddStaffPage simulates adding staff to a project.
// Real staff assignment uses the project team endpoints.
export default function AddStaffPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    loadStaff();
  }, [projectId]);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const res = await getAllWorkers();
      const allWorkers = res?.data || res || [];
      // Filter for non-workers
      const dbStaff = allWorkers.filter(w => {
        const d = w.designation?.toLowerCase() || '';
        return d !== 'worker' && d !== '';
      });
      setStaffList(dbStaff);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = staffList.filter(w =>
    !searchQuery || w.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold flex-1">Staff Details</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search People"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between items-center px-5 py-3">
        <h2 className="text-lg font-bold text-gray-900">Staff List/ Payroll</h2>
        <button
          onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
          className="text-[#0066CC]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isSelectionMode
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              : <rect x="3" y="3" width="18" height="18" rx="2"/>
            }
          </svg>
        </button>
      </div>

      <div className="h-px bg-gray-100 mx-5" />

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No staff assigned yet. Add one!</div>
        ) : (
          filtered.map(staff => {
            const isSelected = selectedIds.has(staff.id);
            return (
              <div
                key={staff.id}
                onClick={() => { if (isSelectionMode) toggleSelect(staff.id); }}
                className={`mb-3 p-4 bg-white rounded-xl border ${isSelected ? 'border-[#0066CC] ring-1 ring-[#0066CC]' : 'border-gray-200'} shadow-sm flex items-center cursor-pointer`}
              >
                {isSelectionMode && (
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#0066CC] bg-[#0066CC]' : 'border-gray-300'}`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px]">{staff.name || 'Unknown'}</p>
                  <p className="text-[#0066CC] text-xs font-medium mt-1">{staff.designation || 'Staff'}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Created on: 12 FEB 2026</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="font-bold text-[15px]">₹{Math.round(staff.dailyWageRate || 0)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isSelectionMode && selectedIds.size > 0 && (
        <div className="px-4 py-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => { navigate(-1); }}
            className="w-full h-12 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700"
          >
            Add to the Project
          </button>
        </div>
      )}

      {!isSelectionMode && (
        <button
          onClick={() => { alert('Create staff logic goes here (requires backend endpoint to assign to project team)'); }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0066CC] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      )}
    </div>
  );
}
