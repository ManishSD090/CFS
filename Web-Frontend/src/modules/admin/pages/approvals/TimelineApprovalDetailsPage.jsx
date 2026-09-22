import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTimelineById, approveRejectTimeline, approveRejectVersion } from '../../services/timelineServices';

function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch { return iso.split('T')[0]; }
}

export default function TimelineApprovalDetailsPage() {
  const { approvalId } = useParams();
  const navigate = useNavigate();

  // The approval item context (timeline ID + optional version) is passed via router state
  const locationState = window.history.state?.usr || {};
  const { timelineId, versionNumber, timelineName, versionName, changesSummary, createdByName } = locationState;

  const [detailedTimeline, setDetailedTimeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultState, setResultState] = useState(null); // 'approved' | 'rejected'

  useEffect(() => {
    const tId = timelineId || approvalId;
    if (!tId) { setIsLoading(false); setError('No timeline ID provided.'); return; }

    getTimelineById(tId)
      .then(data => {
        setDetailedTimeline(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [timelineId, approvalId]);

  const processApproval = async (isApproved) => {
    if (!isApproved && !remarks.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }
    setIsProcessing(true);
    try {
      const tId = timelineId || approvalId;
      if (versionNumber != null) {
        await approveRejectVersion(tId, versionNumber, {
          isApproved,
          ...(remarks.trim() && { reason: remarks.trim() }),
        });
      } else {
        await approveRejectTimeline(tId, {
          isApproved,
          ...(remarks.trim() && { reason: remarks.trim() }),
        });
      }
      setResultState(isApproved ? 'approved' : 'rejected');
      // Auto-dismiss after 2s
      setTimeout(() => navigate(-1), 2000);
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const tasks = detailedTimeline?.timelineTasks || [];
  const displayTitle = versionName
    ? `${timelineName || detailedTimeline?.name} (${versionName})`
    : (timelineName || detailedTimeline?.name || 'Timeline Approval');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Timeline Approvals</h1>
      </div>

      {/* Result Overlay */}
      {resultState && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <p className="text-xl font-bold mb-4 capitalize">{resultState}</p>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${resultState === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}>
              {resultState === 'approved'
                ? <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              }
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-5 pb-16">
        {isLoading ? (
          <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
            <h2 className="text-lg font-bold text-gray-900">{displayTitle}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manager: {createdByName || detailedTimeline?.createdBy?.name || 'System'}
            </p>

            {changesSummary && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-700 italic">
                Changes: {changesSummary}
              </div>
            )}

            {/* Task Table Header */}
            <div className="mt-5 grid grid-cols-7 gap-1 text-xs font-bold text-gray-600 pb-1 border-b border-gray-200">
              <span className="col-span-3">Task</span>
              <span className="col-span-2">Start</span>
              <span className="col-span-2">End</span>
            </div>

            {tasks.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No tasks found.</p>
            ) : (
              <div className="space-y-3 mt-3">
                {tasks.map((taskItem, i) => {
                  const taskName = taskItem.task?.title || `Timeline Task ${i + 1}`;
                  const start = formatDate(taskItem.plannedStartDate);
                  const end = formatDate(taskItem.plannedEndDate);
                  return (
                    <div key={i} className="grid grid-cols-7 gap-1 text-sm items-center py-2 border-b border-gray-50">
                      <span className="col-span-3 text-gray-800 font-medium">{taskName}</span>
                      <span className="col-span-2 text-gray-500">{start}</span>
                      <span className="col-span-2 text-green-600 font-semibold">{end}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Remarks */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Approval/Reject Remarks"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]"
              />
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-4">
              {isProcessing ? (
                <div className="w-full flex justify-center py-3"><svg className="animate-spin h-6 w-6 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
              ) : (
                <>
                  <button
                    onClick={() => processApproval(true)}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 text-base"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => processApproval(false)}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 text-base"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
