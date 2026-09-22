import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWeeklyPreview, createWPR } from '../../../services/wprServices';

export default function CreateWprPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [weekStart, setWeekStart] = useState(null);
  const [weekEnd, setWeekEnd] = useState(null);
  const [weekLabel, setWeekLabel] = useState('');

  const [previewData, setPreviewData] = useState(null);
  const [description, setDescription] = useState('');
  const [nextWeekTasks, setNextWeekTasks] = useState([{ taskName: '', notes: '' }]);

  const handleWeekSelection = async (e) => {
    const picked = new Date(e.target.value);
    if (isNaN(picked.getTime())) return;

    // Compute Monday-based week start
    const day = picked.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(picked);
    start.setDate(picked.getDate() + diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    setWeekStart(start);
    setWeekEnd(end);
    setWeekLabel(
      `${start.getDate()} ${start.toLocaleString('en-US', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
    );
    setPreviewData(null);
    setIsLoadingPreview(true);

    try {
      const res = await getWeeklyPreview(id, start);
      if (res.hasData || res.data) {
        const data = res.data || res;
        setPreviewData(data);
        // Pre-fill next week tasks from preview
        if (data.nextWeekPlanning && data.nextWeekPlanning.length > 0) {
          setNextWeekTasks(
            data.nextWeekPlanning.map(p => ({ taskName: p.task || '', notes: p.description || '' }))
          );
        }
      } else {
        alert('No DPRs found for this week.');
      }
    } catch (err) {
      alert('Error fetching weekly data: ' + err.message);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const addNextWeekTask = () => setNextWeekTasks(prev => [...prev, { taskName: '', notes: '' }]);
  const removeNextWeekTask = (i) => setNextWeekTasks(prev => prev.filter((_, idx) => idx !== i));
  const updateNextWeekTask = (i, field, val) =>
    setNextWeekTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewData || !weekStart) {
      alert('Please select a week and wait for the preview to load.');
      return;
    }
    setIsSubmitting(true);

    const payload = {
      projectId: id,
      weekStartDate: weekStart.toISOString(),
      weekEndDate: weekEnd.toISOString(),
      description: description.trim(),
      previewData,
      nextWeekPlanning: nextWeekTasks
        .filter(t => t.taskName.trim())
        .map(t => ({ task: t.taskName.trim(), description: t.notes.trim() })),
    };

    try {
      await createWPR(payload);
      alert('WPR Created Successfully!');
      navigate(-1);
    } catch (err) {
      alert('Failed to submit WPR: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* App Bar */}
      <div className="bg-white flex items-center px-4 py-4 shrink-0 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-700 mr-3 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-gray-900 text-[18px] font-bold">Create WPR</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form id="wpr-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">

          {/* Week Selection */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[#0066CC] font-bold mb-3">WPR Week</h3>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Any Day in the Week</label>
            <div className={`flex items-center h-12 px-3 border rounded-lg ${weekLabel ? 'border-[#0066CC]' : 'border-gray-300'}`}>
              <svg className="w-4 h-4 text-[#0066CC] mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className={`flex-1 text-sm ${weekLabel ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {weekLabel || 'Select Week'}
              </span>
              <input
                type="date"
                className="opacity-0 absolute w-0 h-0"
                id="week-picker"
                onChange={handleWeekSelection}
              />
              <label htmlFor="week-picker" className="cursor-pointer text-[#0066CC] text-xs font-bold">Change</label>
            </div>
          </div>

          {/* Preview Loading */}
          {isLoadingPreview && (
            <div className="py-10 flex justify-center">
              <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            </div>
          )}

          {/* Preview Data Sections */}
          {previewData && !isLoadingPreview && (
            <>
              {/* Weather */}
              {previewData.weather && previewData.weather.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3">Weather</h3>
                  <div className="flex justify-between">
                    {previewData.weather.map((w, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 font-bold">{w.day}</span>
                        <span className="text-xl mt-1">{w.code || '☀️'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">Description</h3>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24 focus:border-[#0066CC] outline-none"
                  placeholder="Enter the weekly summary..."
                />
              </div>

              {/* Attendance */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Attendance</h3>
                  <span className="text-sm font-bold text-[#0066CC]">
                    {previewData.attendance?.summary?.totalPresent ?? 0} Present
                  </span>
                </div>
                {/* Bar chart */}
                {previewData.attendance?.daily && (
                  <div className="flex justify-around items-end h-24 mb-3">
                    {previewData.attendance.daily.map((day, i) => {
                      const max = Math.max(...previewData.attendance.daily.map(d => d.total || 0), 10);
                      const wH = ((day.workers || 0) / max) * 80;
                      const sH = ((day.staff || 0) / max) * 80;
                      return (
                        <div key={i} className="flex flex-col items-center gap-[2px]">
                          {wH > 0 && <div style={{ height: wH }} className="w-3 bg-[#0066CC] rounded-t" />}
                          {sH > 0 && <div style={{ height: sH }} className="w-3 bg-[#1ABC9C] rounded-t" />}
                          <span className="text-[9px] text-gray-400 mt-1">{day.date}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0066CC] rounded-full inline-block" />Avg {previewData.attendance?.summary?.avgWorkers ?? 0} Workers</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#1ABC9C] rounded-full inline-block" />Avg {previewData.attendance?.summary?.avgStaff ?? 0} Staff</span>
                </div>
              </div>

              {/* Progress */}
              {previewData.progress && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Added This Week</span>
                      <span className="font-bold text-green-600">{previewData.progress.todayAdded ?? '0%'}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-bold text-[#0066CC]">{previewData.progress.currentOverall ?? '0%'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subcontractors */}
              {previewData.subcontractors?.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3">Sub Contractor Names</h3>
                  {previewData.subcontractors.map((sub, i) => (
                    <div key={i} className="mb-3 p-3 border border-gray-100 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold">{sub.name || 'Unknown'}</span>
                        <span className="text-gray-500">{sub.dates || ''}</span>
                      </div>
                      <span className="text-xs text-gray-400">{sub.specialization || 'General Work'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {previewData.tasks?.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3">Tasks</h3>
                  {previewData.tasks.map((t, i) => (
                    <div key={i} className="flex justify-between items-center mb-2 text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="flex-1">{t.name || 'Task'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${t.status === 'Completed' ? 'bg-green-500' : 'bg-[#0066CC]'}`}>
                        {t.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Materials */}
              {previewData.materials?.consumed?.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3">Materials Consumed</h3>
                  {previewData.materials.consumed.map((m, i) => (
                    <div key={i} className="flex justify-between text-sm mb-2">
                      <span>{m.name || 'Material'}</span>
                      <span className="font-bold text-[#0066CC]">{m.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Equipment */}
              {previewData.equipment?.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3">Equipments Used</h3>
                  {previewData.equipment.map((eq, i) => (
                    <div key={i} className="flex justify-between text-sm mb-2">
                      <span>{eq.name || 'Equipment'}</span>
                      <span className="font-bold text-[#0066CC]">{eq.hrsUsed || '0 Hrs'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Week Planning */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Next Week Planning</h3>
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
                    <select
                      value={task.taskName}
                      onChange={e => updateNextWeekTask(i, 'taskName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 bg-white focus:border-[#0066CC] outline-none"
                    >
                      <option value="">Select Task</option>
                      {(previewData?.nextWeekPlanning || [])
                        .map(p => p.task)
                        .filter(Boolean)
                        .filter((v, idx, arr) => arr.indexOf(v) === idx)
                        .map((t, idx) => <option key={idx} value={t}>{t}</option>)
                      }
                    </select>
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
            </>
          )}
        </form>
      </div>

      <div className="bg-white p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t">
        <button
          type="submit"
          form="wpr-form"
          disabled={isSubmitting || !previewData}
          className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-full text-[16px] hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit WPR"}
        </button>
      </div>
    </div>
  );
}
