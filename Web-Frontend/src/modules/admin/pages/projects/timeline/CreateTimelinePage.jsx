import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTimeline } from '../../../services/timelineServices';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const WEEKS = [1,2,3,4,5];

function newTask() {
  return {
    title: '', description: '', year: null, month: null, week: null,
    priority: 'MEDIUM', isCritical: false, estimatedHours: '',
    plannedStartDate: '', plannedEndDate: '',
    subtasks: [''],
  };
}

function Label({ children }) {
  return <p className="text-[13px] font-semibold text-gray-700 mt-3 mb-1">{children}</p>;
}

function TextInput({ value, onChange, placeholder, multiline, type = 'text' }) {
  const cls = "w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0066CC] transition";
  if (multiline) return <textarea rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

export default function CreateTimelinePage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [versionComment, setVersionComment] = useState('');
  const [tasks, setTasks] = useState([newTask()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAvailableYears = () => {
    if (!startDate || !endDate) return [];
    const sy = new Date(startDate).getFullYear();
    const ey = new Date(endDate).getFullYear();
    return Array.from({ length: ey - sy + 1 }, (_, i) => sy + i);
  };

  const getAvailableMonths = (year) => {
    if (!startDate || !endDate || !year) return [];
    const sd = new Date(startDate), ed = new Date(endDate);
    const sy = sd.getFullYear(), ey = ed.getFullYear();
    const sm = sd.getMonth() + 1, em = ed.getMonth() + 1;
    if (sy === ey) return Array.from({ length: em - sm + 1 }, (_, i) => sm + i);
    if (year === sy) return Array.from({ length: 12 - sm + 1 }, (_, i) => sm + i);
    if (year === ey) return Array.from({ length: em }, (_, i) => i + 1);
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const updateTask = (idx, field, value) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const addSubtask = (taskIdx) => {
    setTasks(prev => prev.map((t, i) => i === taskIdx ? { ...t, subtasks: [...t.subtasks, ''] } : t));
  };

  const updateSubtask = (taskIdx, subIdx, value) => {
    setTasks(prev => prev.map((t, i) => {
      if (i !== taskIdx) return t;
      const subs = [...t.subtasks];
      subs[subIdx] = value;
      return { ...t, subtasks: subs };
    }));
  };

  const removeSubtask = (taskIdx, subIdx) => {
    setTasks(prev => prev.map((t, i) => {
      if (i !== taskIdx) return t;
      const subs = t.subtasks.filter((_, si) => si !== subIdx);
      return { ...t, subtasks: subs };
    }));
  };

  const removeTask = (idx) => {
    setTasks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { alert('Please enter a timeline name.'); return; }
    if (!startDate || !endDate) { alert('Please select both start and end dates.'); return; }
    if (new Date(endDate) < new Date(startDate)) { alert('End date must be after start date.'); return; }

    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!t.title.trim()) { alert(`Task ${i + 1} must have a name.`); return; }
      if (!t.year || !t.month || !t.week) { alert(`Please select Year, Month, and Week for "${t.title}".`); return; }
    }

    const tasksPayload = tasks.map(t => ({
      title: t.title.trim(),
      ...(t.description.trim() && { description: t.description.trim() }),
      year: t.year,
      month: t.month,
      week: t.week,
      isCritical: t.isCritical,
      priority: t.priority,
      estimatedHours: parseInt(t.estimatedHours) || 0,
      ...(t.plannedStartDate && { plannedStartDate: t.plannedStartDate }),
      ...(t.plannedEndDate && { plannedEndDate: t.plannedEndDate }),
      subtasks: t.subtasks.filter(s => s.trim()).map(s => ({ description: s.trim() })),
    }));

    setIsSubmitting(true);
    try {
      await createTimeline({
        projectId,
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        startDate,
        endDate,
        ...(versionComment.trim() && { versionComment: versionComment.trim() }),
        tasks: tasksPayload,
      });
      navigate(-1);
    } catch (e) {
      alert('Error creating timeline: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableYears = getAvailableYears();
  const dateDisabled = !startDate || !endDate;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* App Bar */}
      <div className="bg-white border-b border-gray-100 flex items-center px-4 py-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-600 mr-3 p-1.5 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-[18px] font-bold text-gray-900">Create Timeline</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 pb-24">
        <Label>Timeline Name</Label>
        <TextInput value={name} onChange={setName} placeholder="E.g., Feb 2026 Plan" />

        <Label>Description</Label>
        <TextInput value={description} onChange={setDescription} placeholder="E.g., Construction timeline for February 2026" multiline />

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>Start Date</Label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0066CC]" />
          </div>
          <div>
            <Label>End Date</Label>
            <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0066CC]" />
          </div>
        </div>

        <Label>Version Comment</Label>
        <TextInput value={versionComment} onChange={setVersionComment} placeholder="E.g., Initial setup with foundation work" />

        <div className="my-6 border-t border-gray-200" />
        <h2 className="text-lg font-bold text-[#0066CC]">Add Tasks</h2>
        {dateDisabled && (
          <p className="text-xs text-red-500 mt-1">Please select Timeline Start & End Dates first to enable scheduling.</p>
        )}

        <div className="mt-4 space-y-6">
          {tasks.map((task, taskIdx) => {
            const months = getAvailableMonths(task.year);
            return (
              <div key={taskIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-[#0066CC]">Task {taskIdx + 1}</span>
                  {taskIdx > 0 && (
                    <button onClick={() => removeTask(taskIdx)} className="p-1 text-red-500 hover:bg-red-50 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>

                <Label>Task Title</Label>
                <TextInput value={task.title} onChange={v => updateTask(taskIdx, 'title', v)} placeholder="E.g., Excavation Work" />

                <Label>Description</Label>
                <TextInput value={task.description} onChange={v => updateTask(taskIdx, 'description', v)} placeholder="E.g., Site excavation and preparation" multiline />

                {/* Year / Month / Week */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <Label>Year</Label>
                    <select disabled={dateDisabled} value={task.year || ''} onChange={e => updateTask(taskIdx, 'year', Number(e.target.value) || null)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none bg-white disabled:opacity-50">
                      <option value="">Year</option>
                      {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Month</Label>
                    <select disabled={dateDisabled || !task.year} value={task.month || ''} onChange={e => updateTask(taskIdx, 'month', Number(e.target.value) || null)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none bg-white disabled:opacity-50">
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{MONTHS[m - 1]}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Week</Label>
                    <select value={task.week || ''} onChange={e => updateTask(taskIdx, 'week', Number(e.target.value) || null)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none bg-white">
                      <option value="">Wk</option>
                      {WEEKS.map(w => <option key={w} value={w}>Wk {w}</option>)}
                    </select>
                  </div>
                </div>

                {/* Priority + Hours */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Priority</Label>
                    <select value={task.priority} onChange={e => updateTask(taskIdx, 'priority', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none bg-white">
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Estimated Hours</Label>
                    <TextInput value={task.estimatedHours} onChange={v => updateTask(taskIdx, 'estimatedHours', v)} placeholder="E.g., 40" type="number" />
                  </div>
                </div>

                {/* Critical Checkbox */}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={task.isCritical} onChange={e => updateTask(taskIdx, 'isCritical', e.target.checked)}
                    className="w-4 h-4 accent-red-500" />
                  <span className="text-sm text-gray-700">Is this a Critical Task?</span>
                </label>

                {/* Optional Dates */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Planned Start (Optional)</Label>
                    <input type="date" value={task.plannedStartDate} onChange={e => updateTask(taskIdx, 'plannedStartDate', e.target.value)}
                      min={startDate} max={endDate}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
                  </div>
                  <div>
                    <Label>Planned End (Optional)</Label>
                    <input type="date" value={task.plannedEndDate} onChange={e => updateTask(taskIdx, 'plannedEndDate', e.target.value)}
                      min={task.plannedStartDate || startDate} max={endDate}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
                  </div>
                </div>

                {/* Subtasks */}
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <p className="text-sm font-bold text-gray-700 mb-2">Subtasks</p>
                  {task.subtasks.map((sub, subIdx) => (
                    <div key={subIdx} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 w-20 shrink-0">Subtask {subIdx + 1}</span>
                      <input type="text" value={sub} onChange={e => updateSubtask(taskIdx, subIdx, e.target.value)} placeholder="Subtask description"
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#0066CC]" />
                      {subIdx > 0 && (
                        <button onClick={() => removeSubtask(taskIdx, subIdx)} className="text-red-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addSubtask(taskIdx)} className="mt-1 text-xs text-[#0066CC] font-semibold hover:underline">
                    + Add Subtask
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Task Button */}
        <button onClick={() => setTasks(prev => [...prev, newTask()])}
          className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-xl py-3.5 text-sm text-gray-500 font-semibold hover:border-[#0066CC] hover:text-[#0066CC] transition-colors">
          + Add Another Task
        </button>

        {/* Submit */}
        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="mt-8 w-full py-4 bg-[#0066CC] text-white font-bold rounded-full text-base hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/30"
        >
          {isSubmitting ? 'Creating...' : 'Create Timeline'}
        </button>
      </div>
    </div>
  );
}
