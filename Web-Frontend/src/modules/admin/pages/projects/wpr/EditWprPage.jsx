import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { updateWPR } from '../../../services/wprServices';

export default function EditWprPage() {
  const { id, wprId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // WPR is passed via navigation state from WprDetailsPage or WPR list
  const wprFromState = location.state?.wpr;

  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState(wprFromState?.description || '');
  const [nextWeekTasks, setNextWeekTasks] = useState(() => {
    const planning = wprFromState?.aggregatedData?.nextWeekPlanning;
    if (planning && planning.length > 0) {
      return planning.map(p => ({ taskName: p.task || '', notes: p.description || '' }));
    }
    return [{ taskName: '', notes: '' }];
  });

  const addNextWeekTask = () => setNextWeekTasks(prev => [...prev, { taskName: '', notes: '' }]);
  const removeNextWeekTask = (i) => setNextWeekTasks(prev => prev.filter((_, idx) => idx !== i));
  const updateNextWeekTask = (i, field, val) =>
    setNextWeekTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        description: description.trim(),
        nextWeekPlanning: nextWeekTasks
          .filter(t => t.taskName.trim())
          .map(t => ({ task: t.taskName.trim(), description: t.notes.trim() })),
      };
      await updateWPR(wprId, payload);
      alert('WPR updated successfully');
      navigate(-1);
    } catch (err) {
      alert('Failed to update WPR: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const wpr = wprFromState;
  const dateLabel = wpr
    ? (() => {
        const start = new Date(wpr.weekStartDate);
        const end = new Date(wpr.weekEndDate);
        return `${start.getDate()} ${start.toLocaleString('en-US',{month:'short'})} - ${end.getDate()} ${end.toLocaleString('en-US',{month:'short',year:'numeric'})}`;
      })()
    : '';

  // Gather available next-week tasks from preview data for dropdown
  const previewTasks = (wpr?.aggregatedData?.nextWeekPlanning || [])
    .map(p => p.task)
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* App Bar */}
      <div className="bg-white flex items-center px-4 py-4 shrink-0 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-700 mr-3 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-gray-900 text-[18px] font-bold">Edit WPR</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form id="edit-wpr-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">

          {/* Week info (read-only) */}
          {dateLabel && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-[#0066CC] font-bold mb-1">Week</h3>
              <p className="text-sm font-medium text-gray-800">{dateLabel}</p>
              {wpr?.reportNo && <p className="text-xs text-gray-400 mt-0.5">{wpr.reportNo}</p>}
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-3">Description</h3>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24 focus:border-[#0066CC] outline-none"
              placeholder="Enter the weekly summary..."
            />
          </div>

          {/* Next Week Planning */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-4">Next Week Planning</h3>
            {nextWeekTasks.map((task, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">Task Name</label>
                  {i > 0 && (
                    <button type="button" onClick={() => removeNextWeekTask(i)} className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
                    </button>
                  )}
                </div>
                {previewTasks.length > 0 ? (
                  <select
                    value={task.taskName}
                    onChange={e => updateNextWeekTask(i, 'taskName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 bg-white focus:border-[#0066CC] outline-none"
                  >
                    <option value="">Select Task</option>
                    {previewTasks.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={task.taskName}
                    onChange={e => updateNextWeekTask(i, 'taskName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:border-[#0066CC] outline-none"
                    placeholder="Task name..."
                  />
                )}
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={task.notes}
                  onChange={e => updateNextWeekTask(i, 'notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-16 focus:border-[#0066CC] outline-none"
                  placeholder="Enter planning notes..."
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addNextWeekTask}
              className="w-full h-11 border-2 border-dashed border-[#0066CC]/40 rounded-xl flex items-center justify-center text-[#0066CC] hover:bg-blue-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t">
        <button
          type="submit"
          form="edit-wpr-form"
          disabled={isSaving}
          className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-full text-[16px] hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
