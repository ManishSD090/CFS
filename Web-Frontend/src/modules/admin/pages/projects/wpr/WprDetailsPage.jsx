import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// WprDetailsPage receives the full WPR object via navigation state,
// or fetches it directly from the list. Since the WPR list already has aggregatedData,
// we pass the object via state. Fallback: use wprId param.
export default function WprDetailsPage() {
  const { id, wprId } = useParams();
  const navigate = useNavigate();

  // Try to get wpr from navigation state (passed when navigating from WPR list in ProjectTabs)
  // If not available, show a load error (we don't have a standalone GET /wpr/:id endpoint)
  const wpr = window.history.state?.usr?.wpr || null;

  if (!wpr) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
          <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-white text-[18px] font-bold">WPR Details</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center p-6">
            <p className="text-gray-500 mb-4">WPR data not available. Please navigate back to the list and reopen.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[#0066CC] text-white rounded-full font-bold">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = wpr.aggregatedData || {};
  const attendance = data.attendance || {};
  const attendanceSummary = attendance.summary || {};
  const progress = data.progress || {};
  const tasks = data.tasks || [];
  const materials = data.materials?.consumed || [];
  const equipment = data.equipment || [];
  const photos = data.photos || [];

  const start = new Date(wpr.weekStartDate);
  const end = new Date(wpr.weekEndDate);
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const dateLabel = `${("0"+start.getDate()).slice(-2)} ${start.toLocaleString('en-US', {month:'short'})} - ${("0"+end.getDate()).slice(-2)} ${end.toLocaleString('en-US', {month:'short', year:'numeric'})}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[16px] font-bold flex-1">{wpr.reportNo || 'WPR Details'}</h1>
        <button
          onClick={() => navigate(`/admin/projects/${id}/wpr/edit/${wprId}`, { state: { wpr } })}
          className="text-white hover:bg-white/10 p-1.5 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 max-w-2xl mx-auto w-full">

        {/* Date Header */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#0066CC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <p className="text-[16px] font-bold text-gray-900">{dateLabel}</p>
            <p className="text-xs text-gray-400">Weekly Progress Report</p>
          </div>
        </div>

        {/* Description */}
        {wpr.description && (
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Description &amp; Planning</h3>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-800 leading-relaxed">
              {wpr.description}
            </div>
          </div>
        )}

        {/* Attendance */}
        <div>
          <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Attendance (Weekly Avg)</h3>
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Weekly Presence</span>
              <span className="font-bold">{attendanceSummary.totalPresent ?? 0}</span>
            </div>
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg. Workers / Day</span>
              <span className="font-bold">{attendanceSummary.avgWorkers ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg. Staff / Day</span>
              <span className="font-bold">{attendanceSummary.avgStaff ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Work Progress */}
        <div>
          <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Work Progress</h3>
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Added This Week</span>
              <span className="font-bold text-green-600">{progress.todayAdded ?? '0%'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Completion</span>
              <span className="font-bold text-[#0066CC]">{progress.currentOverall ?? '0%'}</span>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        {tasks.length > 0 && (
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Completed Tasks</h3>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name || 'Task'}</p>
                    {t.completed && <p className="text-xs text-gray-400">{t.completed}</p>}
                  </div>
                  <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-md">
                    {t.status || 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Material Consumption */}
        {materials.length > 0 && (
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Material Consumption</h3>
            <div className="space-y-2">
              {materials.map((m, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{m.name || 'Material'}</p>
                    {m.date && <p className="text-xs text-gray-400">Consumed on {m.date}</p>}
                  </div>
                  <span className="font-bold text-[#0066CC] text-sm">{m.quantity ?? '0'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {equipment.length > 0 && (
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Equipment Used</h3>
            <div className="space-y-2">
              {equipment.map((eq, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                  <span className="text-sm">{eq.name || 'Equipment'}</span>
                  <span className="font-bold text-[#0066CC] text-sm">{eq.hrsUsed || '0 Hrs'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-2 ml-1">Site Progress Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img src={p.url} alt="" className="w-full h-full object-cover" onError={e => { e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>'; }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
