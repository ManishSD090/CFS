import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkerById, updateWorker } from '../../../services/attendanceServices';

export default function WorkerDetailsPage() {
  const { id: projectId, workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await getWorkerById(workerId);
        const data = res?.data || res;
        setWorker(data);
        setEditName(data.name || '');
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorker();
  }, [workerId]);

  const handleUpdate = async () => {
    try {
      const fd = new FormData();
      fd.append('name', editName);
      await updateWorker(workerId, fd);
      setShowEdit(false);
      // Reload
      const res = await getWorkerById(workerId);
      setWorker(res?.data || res);
    } catch (e) {
      alert('Failed to update worker: ' + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
          <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-white text-[18px] font-bold">Worker Details</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">Worker not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Worker Details</h1>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-[22px] font-bold text-gray-900">{worker.name}</h2>
          <span className="text-xs text-gray-400 mt-2">ID: {worker.workerId || 'N/A'}</span>
        </div>
        <p className="text-sm text-gray-500 mb-1">ABC Infrastructure Pvt Ltd</p>
        <p className="text-sm font-medium text-[#0066CC]">{worker.designation || 'Worker'}</p>
      </div>

      <div className="mx-5 p-5 border border-gray-200 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">User Info</h3>
          <button onClick={() => setShowEdit(true)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        </div>
        
        <div className="h-px bg-gray-100 mb-4" />

        <div className="space-y-3">
          <div className="flex text-sm">
            <span className="w-24 text-gray-500">Name:</span>
            <span className="font-medium">{worker.name}</span>
          </div>
          <div className="flex text-sm">
            <span className="w-24 text-gray-500">Created On:</span>
            <span className="font-medium">{worker.createdAt ? new Date(worker.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}</span>
          </div>
          <div className="flex text-sm">
            <span className="w-24 text-gray-500">Base Rate:</span>
            <span className="font-medium">₹{worker.dailyWageRate || 0}/day</span>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Aadhar card:</span>
          {worker.aadharPath ? (
            <a href={worker.aadharPath} target="_blank" rel="noreferrer" className="flex items-center px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50">
              <svg className="w-3.5 h-3.5 text-gray-500 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span className="text-xs text-gray-600">aadhar.png</span>
            </a>
          ) : (
            <span className="text-xs text-gray-400">Not uploaded</span>
          )}
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-center mb-4">Edit Worker</h3>
            <label className="block text-sm font-bold text-gray-700 mb-1">Worker Name</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 focus:border-[#0066CC] outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowEdit(false)} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 h-11 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
