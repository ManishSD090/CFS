import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllWorkers, createWorker, deleteWorker, assignWorkerToProject } from '../../../services/attendanceServices';

export default function AddWorkerPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  // Create worker dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // The IDs already assigned to this project (to show "Already assigned" label)
  const [assignedIds, setAssignedIds] = useState(new Set());

  useEffect(() => {
    loadWorkers();
  }, [projectId]);

  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      // Get all global site-staff workers
      const allRes = await getAllWorkers();
      const allWorkers = allRes?.data || allRes || [];

      // Get workers already assigned to this project
      const assignedRes = await getAllWorkers({ projectId });
      const assignedWorkers = assignedRes?.data || assignedRes || [];
      const aIds = new Set(assignedWorkers.map(w => w.id));

      setWorkers(allWorkers);
      setAssignedIds(aIds);
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

  const handleAssign = async () => {
    if (selectedIds.size === 0) return;
    setIsAssigning(true);
    try {
      for (const workerId of selectedIds) {
        await assignWorkerToProject(workerId, projectId);
      }
      navigate(-1);
    } catch (e) {
      alert('Error assigning workers: ' + e.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} worker(s)? This cannot be undone.`)) return;
    try {
      for (const id of selectedIds) {
        await deleteWorker(id);
      }
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      await loadWorkers();
    } catch (e) {
      alert('Error deleting workers: ' + e.message);
    }
  };

  const handleCreateWorker = async () => {
    if (!newWorkerName.trim()) return;
    setIsCreating(true);
    try {
      const fd = new FormData();
      fd.append('name', newWorkerName.trim());
      fd.append('status', 'ACTIVE');
      fd.append('dailyWageRate', '500');
      fd.append('phone', '');
      await createWorker(fd);
      setNewWorkerName('');
      setShowCreateDialog(false);
      await loadWorkers();
    } catch (e) {
      alert('Error creating worker: ' + e.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filtered = workers.filter(w =>
    !searchQuery || w.name?.toLowerCase().includes(searchQuery.toLowerCase()) || w.workerId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold flex-1">Select Workers</h1>
      </div>

      {/* Search */}
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

      {/* List Header */}
      <div className="flex justify-between items-center px-5 py-3">
        <h2 className="text-lg font-bold text-gray-900">Workers List</h2>
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

      {/* Worker List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No workers found. Create one!</div>
        ) : (
          filtered.map(worker => {
            const isAlreadyAssigned = assignedIds.has(worker.id);
            const isSelected = selectedIds.has(worker.id);

            return (
              <div
                key={worker.id}
                onClick={() => {
                  if (isAlreadyAssigned) return;
                  if (isSelectionMode) toggleSelect(worker.id);
                }}
                className={`flex items-center px-5 py-3.5 border-b border-gray-50 ${isAlreadyAssigned ? 'opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
              >
                {isSelectionMode && (
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center shrink-0 ${isAlreadyAssigned ? 'border-gray-300 bg-gray-100' : isSelected ? 'border-[#0066CC] bg-[#0066CC]' : 'border-gray-300'}`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isAlreadyAssigned ? 'text-gray-400' : 'text-gray-900'}`}>{worker.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{worker.workerId || ''}</p>
                </div>
                {isAlreadyAssigned && (
                  <span className="text-xs font-bold text-green-600">Already assigned</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Actions */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="px-4 py-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex gap-3">
          <button
            onClick={handleDelete}
            className="h-12 w-12 rounded-full border-2 border-red-400 text-red-500 flex items-center justify-center hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          <button
            disabled={isAssigning}
            onClick={handleAssign}
            className="flex-1 h-12 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            {isAssigning ? 'Assigning...' : 'Assign to Project'}
          </button>
        </div>
      )}

      {/* Create Worker FAB */}
      {!isSelectionMode && (
        <button
          onClick={() => setShowCreateDialog(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0066CC] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      )}

      {/* Create Worker Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">Create Worker</h3>
            <label className="block text-sm font-bold text-gray-700 mb-1">Worker Name</label>
            <input
              type="text"
              value={newWorkerName}
              onChange={e => setNewWorkerName(e.target.value)}
              placeholder="Enter name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:border-[#0066CC] outline-none"
            />
            <p className="text-xs text-gray-400 mb-4">A default daily wage of ₹500 will be assigned and can be updated on the attendance screen.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowCreateDialog(false); setNewWorkerName(''); }} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={isCreating || !newWorkerName.trim()}
                onClick={handleCreateWorker}
                className="flex-1 h-11 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
