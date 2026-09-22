import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTimelineById,
  getTimelineVersions,
  getTimelineVersionById,
  updateTimeline,
  deleteTimeline,
  updateTimelineVersion,
  deleteTimelineVersion,
  removeTaskFromTimeline,
  createTaskAndAddToTimeline,
  updateTimelineTask,
} from '../../../services/timelineServices';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const WEEKS = [1,2,3,4,5];

function formatDate(iso) {
  if (!iso) return 'N/A';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso.split('T')[0]; }
}

// Group timeline tasks by "Month Year" -> week
function groupTasks(tasks) {
  const sorted = [...(tasks || [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    if (a.week !== b.week) return a.week - b.week;
    return (a.order || 0) - (b.order || 0);
  });
  const grouped = {};
  for (const t of sorted) {
    const key = `${MONTHS[t.month - 1]} ${t.year}`;
    if (!grouped[key]) grouped[key] = {};
    if (!grouped[key][t.week]) grouped[key][t.week] = [];
    grouped[key][t.week].push(t);
  }
  return grouped;
}

// Modal for editing timeline header
function HeaderModal({ timeline, onClose, onSaved }) {
  const [name, setName] = useState(timeline.name || '');
  const [description, setDescription] = useState(timeline.description || '');
  const [startDate, setStartDate] = useState(timeline.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(timeline.endDate?.split('T')[0] || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateTimeline(timeline.id, { name: name.trim(), description: description.trim(), startDate, endDate });
      onSaved();
      onClose();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Edit Timeline Details</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Timeline Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC]" />
        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC] resize-none" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
            <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button disabled={isSaving} onClick={handleSave} className="flex-1 h-11 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// Modal for editing version metadata
function VersionModal({ timelineId, version, onClose, onSaved }) {
  const [name, setName] = useState(version.name || '');
  const [description, setDescription] = useState(version.description || '');
  const [changesSummary, setChangesSummary] = useState(version.changesSummary || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateTimelineVersion(timelineId, version.versionNumber, { name: name.trim(), description: description.trim(), changesSummary: changesSummary.trim() });
      onSaved();
      onClose();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Edit Version Metadata</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Version Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC]" />
        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC] resize-none" />
        <label className="block text-xs font-bold text-gray-500 mb-1">Changes Summary</label>
        <textarea value={changesSummary} onChange={e => setChangesSummary(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-[#0066CC] resize-none" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button disabled={isSaving} onClick={handleSave} className="flex-1 h-11 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Update Version'}</button>
        </div>
      </div>
    </div>
  );
}

// Modal for Add/Edit Task
function TaskModal({ timelineId, timeline, existingTask, onClose, onSaved }) {
  const startDate = timeline?.startDate?.split('T')[0] || '';
  const endDate = timeline?.endDate?.split('T')[0] || '';
  const getYears = () => {
    if (!startDate || !endDate) return [];
    const sy = new Date(startDate).getFullYear(), ey = new Date(endDate).getFullYear();
    return Array.from({ length: ey - sy + 1 }, (_, i) => sy + i);
  };
  const getMonths = (year) => {
    if (!startDate || !endDate || !year) return [];
    const sd = new Date(startDate), ed = new Date(endDate);
    const sy = sd.getFullYear(), ey = ed.getFullYear(), sm = sd.getMonth() + 1, em = ed.getMonth() + 1;
    if (sy === ey) return Array.from({ length: em - sm + 1 }, (_, i) => sm + i);
    if (year === sy) return Array.from({ length: 12 - sm + 1 }, (_, i) => sm + i);
    if (year === ey) return Array.from({ length: em }, (_, i) => i + 1);
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const [title, setTitle] = useState(existingTask?.task?.title || '');
  const [description, setDescription] = useState(existingTask?.task?.description || existingTask?.notes || '');
  const [year, setYear] = useState(existingTask?.year || null);
  const [month, setMonth] = useState(existingTask?.month || null);
  const [week, setWeek] = useState(existingTask?.week || null);
  const [priority, setPriority] = useState(existingTask?.priority || 'MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState(String(existingTask?.estimatedHours || ''));
  const [isCritical, setIsCritical] = useState(existingTask?.isCritical || false);
  const [plannedStart, setPlannedStart] = useState(existingTask?.plannedStartDate?.split('T')[0] || '');
  const [plannedEnd, setPlannedEnd] = useState(existingTask?.plannedEndDate?.split('T')[0] || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { alert('Task title is required.'); return; }
    if (!year || !month || !week) { alert('Please select Year, Month, and Week.'); return; }
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        ...(description.trim() && { description: description.trim() }),
        year, month, week, priority, isCritical,
        estimatedHours: parseInt(estimatedHours) || 0,
        ...(plannedStart && { plannedStartDate: plannedStart }),
        ...(plannedEnd && { plannedEndDate: plannedEnd }),
      };
      if (existingTask) {
        await updateTimelineTask(timelineId, existingTask.taskId || existingTask.id, payload);
      } else {
        await createTaskAndAddToTimeline(timelineId, payload);
      }
      onSaved();
      onClose();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSaving(false); }
  };

  const years = getYears();
  const months = getMonths(year);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto flex justify-center items-start pt-8 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{existingTask ? 'Edit Task' : 'Add Task'}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>

        <label className="block text-xs font-bold text-gray-500 mb-1">Task Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Excavation Work" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC]" />

        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#0066CC] resize-none" />

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Year</label>
            <select value={year || ''} onChange={e => { setYear(Number(e.target.value)); setMonth(null); }} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none bg-white">
              <option value="">Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Month</label>
            <select value={month || ''} disabled={!year} onChange={e => setMonth(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none bg-white disabled:opacity-50">
              <option value="">Month</option>
              {months.map(m => <option key={m} value={m}>{MONTHS[m - 1]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Week</label>
            <select value={week || ''} onChange={e => setWeek(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none bg-white">
              <option value="">Wk</option>
              {WEEKS.map(w => <option key={w} value={w}>Wk {w}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none bg-white">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Est. Hours</label>
            <input type="number" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} placeholder="40" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
          </div>
        </div>

        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" checked={isCritical} onChange={e => setIsCritical(e.target.checked)} className="w-4 h-4 accent-red-500" />
          <span className="text-sm text-gray-700">Critical Task</span>
        </label>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Planned Start</label>
            <input type="date" value={plannedStart} onChange={e => setPlannedStart(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-[#0066CC]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Planned End</label>
            <input type="date" value={plannedEnd} min={plannedStart} onChange={e => setPlannedEnd(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-[#0066CC]" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button disabled={isSaving} onClick={handleSave} className="flex-1 h-11 bg-[#0066CC] text-white font-bold rounded-full hover:bg-blue-700 disabled:opacity-50">{isSaving ? 'Saving...' : existingTask ? 'Update' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  );
}

export default function EditTimelinePage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  // We need the timelineId. It's passed via state or we fetch the project's timeline.
  // The Timeline Tab passes navigate with state: { timelineId }
  const [timelineId] = useState(() => new URLSearchParams(window.location.search).get('timelineId') || null);

  const [timeline, setTimeline] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const selectedVersion = versions.find(v => v.id === selectedVersionId) || null;

  const loadVersions = async (id) => {
    try {
      const res = await getTimelineVersions(id);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setVersions(list);
      if (list.length > 0) setSelectedVersionId(prev => prev || list[0].id);
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const loadTimeline = async (id, vList, vId) => {
    setIsLoading(true);
    try {
      const base = await getTimelineById(id);
      let tasks = base.timelineTasks || [];
      if (vId && vList.length > 0) {
        try {
          const ver = vList.find(v => v.id === vId);
          if (ver) {
            const vDetail = await getTimelineVersionById(id, ver.versionNumber);
            tasks = vDetail?.timelineTasks || tasks;
          }
        } catch (e) { console.warn('Version tasks load failed:', e); }
      }
      setTimeline({ ...base, timelineTasks: tasks });
    } catch (e) {
      alert('Failed to load timeline: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!timelineId) { setIsLoading(false); return; }
    (async () => {
      const list = await loadVersions(timelineId);
      await loadTimeline(timelineId, list, list[0]?.id || null);
    })();
  }, [timelineId]);

  useEffect(() => {
    if (timelineId && !isLoading && selectedVersionId) {
      loadTimeline(timelineId, versions, selectedVersionId);
    }
  }, [selectedVersionId]);

  const handleDeleteTimeline = async () => {
    if (!window.confirm('Delete this entire timeline? This cannot be undone.')) return;
    try { await deleteTimeline(timelineId); navigate(-1); }
    catch (e) { alert('Failed: ' + e.message); }
  };

  const handleDeleteVersion = async () => {
    if (versions.length <= 1) { alert('Cannot delete the only version.'); return; }
    if (!window.confirm(`Delete Version ${selectedVersion?.versionNumber}?`)) return;
    try {
      await deleteTimelineVersion(timelineId, selectedVersion.versionNumber);
      setSelectedVersionId(null);
      const list = await loadVersions(timelineId);
      await loadTimeline(timelineId, list, list[0]?.id || null);
    } catch (e) { alert('Failed: ' + e.message); }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await removeTaskFromTimeline(timelineId, task.taskId || task.id);
      await loadTimeline(timelineId, versions, selectedVersionId);
    } catch (e) { alert('Failed: ' + e.message); }
  };

  if (!timelineId) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-white border-b border-gray-100 flex items-center px-4 py-4 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-gray-600 mr-3 p-1.5 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-[18px] font-bold text-gray-900">Manage Timeline</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No timeline ID provided. Please open this page from the Timeline tab.
        </div>
      </div>
    );
  }

  const groupedTasks = groupTasks(timeline?.timelineTasks);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* App Bar */}
      <div className="bg-white border-b border-gray-100 flex items-center px-4 py-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-3 p-1.5 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-[18px] font-bold text-gray-900 flex-1">Manage Timeline</h1>
        <button onClick={handleDeleteTimeline} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Delete Timeline">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
        {/* Version Selector */}
        {versions.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 border border-blue-300 rounded-lg px-3 py-1 bg-white">
              <select value={selectedVersionId || ''} onChange={e => setSelectedVersionId(e.target.value)}
                className="w-full text-sm font-medium outline-none bg-transparent text-gray-800">
                {versions.map(v => <option key={v.id} value={v.id}>v{v.versionNumber}: {v.name}</option>)}
              </select>
            </div>
            <button onClick={handleDeleteVersion} className="p-2 border border-red-300 rounded-full text-red-500 hover:bg-red-50 bg-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : (
          <>
            {/* Timeline Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-[#0066CC] font-bold text-lg">Timeline Details</h2>
                <button onClick={() => setShowHeaderModal(true)} className="text-[#0066CC] text-sm font-medium">Edit</button>
              </div>
              <p className="font-bold text-gray-900 text-base">{timeline?.name}</p>
              {timeline?.description && <p className="text-sm text-gray-500 mt-1">{timeline.description}</p>}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-[#0066CC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>{formatDate(timeline?.startDate)} — {formatDate(timeline?.endDate)}</span>
              </div>
            </div>

            {/* Version Info Card */}
            {selectedVersion && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[#0066CC] font-bold">Version V{selectedVersion.versionNumber} Info</h2>
                  <button onClick={() => setShowVersionModal(true)} className="text-[#0066CC] text-sm font-medium">Edit</button>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{selectedVersion.name}</p>
                    {selectedVersion.description && <p className="text-sm text-gray-500 mt-0.5">{selectedVersion.description}</p>}
                  </div>
                  {/* Status Chip */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedVersion.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-300' :
                    selectedVersion.status === 'PENDING_REVIEW' ? 'bg-orange-50 text-orange-600 border-orange-300' :
                    selectedVersion.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 border-blue-300' :
                    selectedVersion.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-300' :
                    'bg-gray-50 text-gray-500 border-gray-300'
                  }`}>{selectedVersion.status || 'DRAFT'}</span>
                </div>
                {selectedVersion.changesSummary && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-500">
                    <p className="font-bold text-gray-400 mb-0.5">Changes Summary:</p>
                    {selectedVersion.changesSummary}
                  </div>
                )}
              </div>
            )}

            {/* Scheduled Tasks */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#0066CC] font-bold text-lg">Scheduled Tasks</h2>
            </div>

            {Object.keys(groupedTasks).length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl py-12 flex flex-col items-center text-center shadow-sm">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <p className="text-gray-500 text-sm">No tasks in this version.</p>
              </div>
            ) : (
              Object.entries(groupedTasks).map(([monthKey, weekGroups]) => (
                <div key={monthKey} className="mb-4">
                  <p className="font-bold text-gray-800 mb-2">{monthKey}</p>
                  {Object.entries(weekGroups).map(([weekNum, tasks]) => (
                    <div key={weekNum} className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-3">
                      <div className="w-10 bg-[#3B71CA] flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-base">{weekNum}</span>
                      </div>
                      <div className="flex-1 bg-gray-50 divide-y divide-gray-200">
                        {tasks.map((tt) => (
                          <div key={tt.id || tt.taskId} className="flex items-center px-3 py-2.5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-800 truncate">{tt.task?.title || 'Task'}</p>
                                {tt.isCritical && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">CRITICAL</span>}
                              </div>
                              <p className="text-xs text-gray-400 truncate">{tt.task?.description || tt.notes || ''}</p>
                            </div>
                            <button onClick={() => { setEditingTask(tt); setShowTaskModal(true); }} className="ml-2 p-1 text-[#0066CC] hover:bg-blue-50 rounded-full">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button onClick={() => handleDeleteTask(tt)} className="ml-1 p-1 text-red-500 hover:bg-red-50 rounded-full">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* FAB - Add Task */}
      <button
        onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 bg-[#0066CC] text-white font-bold rounded-full shadow-lg hover:bg-blue-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        Add Task
      </button>

      {showHeaderModal && timeline && (
        <HeaderModal timeline={timeline} onClose={() => setShowHeaderModal(false)}
          onSaved={() => loadTimeline(timelineId, versions, selectedVersionId)} />
      )}
      {showVersionModal && selectedVersion && (
        <VersionModal timelineId={timelineId} version={selectedVersion} onClose={() => setShowVersionModal(false)}
          onSaved={async () => { const list = await loadVersions(timelineId); await loadTimeline(timelineId, list, selectedVersionId); }} />
      )}
      {showTaskModal && (
        <TaskModal timelineId={timelineId} timeline={timeline} existingTask={editingTask}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => loadTimeline(timelineId, versions, selectedVersionId)} />
      )}
    </div>
  );
}
