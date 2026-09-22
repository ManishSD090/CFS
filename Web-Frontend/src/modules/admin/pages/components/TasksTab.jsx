import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const taskStatuses = ['Pending','Active','In progress','Active','In progress','Active','Pending','In progress','In progress','Active','Pending','Active','Pending','Active','In progress'];
const allTasks = Array.from({length: 60}, (_, i) => ({
  id: i + 1,
  name: `Task ${i+1}: Excavation for Block A`,
  assignee: 'Worker 1',
  start: '03 Sep 2026',
  due: '28 Sep 2026',
  priority: 'High',
  status: taskStatuses[i % taskStatuses.length],
  progress: [75,100,50,30,80,60,20,90,40,70][i%10],
  client: 'ABC Infrastructure Pvt Ltd',
  equipment: 'Equipment Name',
  monthYear: 'FEB 2026',
  week: '1',
  createdBy: 'Rahul Mehta',
  subtasks: [
    {name: 'Name of Subtask', weight: '24'},
    {name: 'Name of Subtask', weight: '24'},
    {name: 'Name of Subtask', weight: '24'},
    {name: 'Name of Subtask', weight: '24'},
  ]
}));

function getTaskStatusClass(s) {
  if (s === 'Pending') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  if (s === 'Active') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
  if (s === 'In progress') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
  if (s === 'Done') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
}

function getPriorityClass(p) {
  if (p === 'High') return 'text-red-500';
  if (p === 'Medium') return 'text-amber-500';
  return 'text-green-600';
}

export default function TasksTab() {
  const [tasks, setTasks] = useState(allTasks);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubtasks, setCreateSubtasks] = useState([{ id: 1, name: '', weight: '' }]);
  const [createForm, setCreateForm] = useState({
    name: '', desc: '', assignee: '', start: '', end: '', monthYear: '', week: '', project: '', manager: ''
  });

  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const [editForm, setEditForm] = useState({
    name: '', desc: '', assignee: '', start: '', end: '', monthYear: '', week: '', project: '', manager: ''
  });
  const [editSubtasks, setEditSubtasks] = useState([]);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentDetailTask, setCurrentDetailTask] = useState(null);

  // Filter tasks
  const filteredTasks = tasks.filter(t => 
    !search || 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.assignee.toLowerCase().includes(search.toLowerCase()) || 
    t.status.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const total = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIdx = (page - 1) * perPage;
  const currentSlice = filteredTasks.slice(startIdx, startIdx + perPage);

  const displayStart = Math.min(startIdx + 1, total);
  const displayEnd = Math.min(page * perPage, total);

  // Pagination Pages Array
  let paginationPages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      paginationPages.push(i);
    } else if (paginationPages[paginationPages.length - 1] !== '…') {
      paginationPages.push('…');
    }
  }

  const openDeleteConfirm = (id) => {
    setDeletingTaskId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setTasks(prev => prev.filter(t => t.id !== deletingTaskId));
    setIsDeleteConfirmOpen(false);
    setDeletingTaskId(null);
  };

  const openEditConfirm = (id) => {
    setEditingTaskId(id);
    setIsEditConfirmOpen(true);
  };

  const confirmEdit = () => {
    setIsEditConfirmOpen(false);
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
      setEditForm({ 
        name: task.name, 
        desc: task.desc || '',
        assignee: task.assignee,
        start: task.start,
        end: task.due,
        monthYear: task.monthYear,
        week: task.week,
        project: task.client || '',
        manager: task.createdBy || ''
      });
      setEditSubtasks(task.subtasks.map((st, i) => ({ id: Date.now() + i, name: st.name, weight: st.weight })));
      setIsEditOpen(true);
    }
  };

  const saveEdit = () => {
    setTasks(prev => prev.map(t => {
      if (t.id === editingTaskId) {
        return { 
          ...t, 
          name: editForm.name || t.name, 
          assignee: editForm.assignee || t.assignee,
          start: editForm.start || t.start,
          due: editForm.end || t.due,
          monthYear: editForm.monthYear || t.monthYear,
          week: editForm.week || t.week,
          client: editForm.project || t.client,
          createdBy: editForm.manager || t.createdBy,
          subtasks: editSubtasks.map(s => ({ name: s.name, weight: s.weight }))
        };
      }
      return t;
    }));
    setIsEditOpen(false);
    setEditingTaskId(null);
  };

  const addEditSubtask = () => {
    setEditSubtasks(prev => [...prev, { id: Date.now(), name: '', weight: '' }]);
  };

  const removeEditSubtask = (id) => {
    setEditSubtasks(prev => prev.filter(s => s.id !== id));
  };
  
  const openTaskDetail = (task) => {
    setCurrentDetailTask(task);
    setIsDetailOpen(true);
  };

  const submitCreate = () => {
    if (!createForm.name.trim()) return;
    
    const newTask = {
      id: Date.now(),
      name: createForm.name,
      assignee: createForm.assignee || 'Unassigned',
      start: createForm.start || 'TBD',
      due: createForm.end || 'TBD',
      priority: 'High',
      status: 'Pending',
      progress: 0,
      client: 'ABC Infrastructure Pvt Ltd',
      equipment: 'TBD',
      monthYear: createForm.monthYear || '—',
      week: createForm.week || '—',
      createdBy: createForm.manager || 'Admin',
      subtasks: createSubtasks.filter(s => s.name).map(s => ({ name: s.name, weight: s.weight }))
    };

    setTasks(prev => [newTask, ...prev]);
    setIsCreateOpen(false);
    setCreateForm({ name: '', desc: '', assignee: '', start: '', end: '', monthYear: '', week: '', project: '', manager: '' });
    setCreateSubtasks([{ id: 1, name: '', weight: '' }]);
    setPage(1);
  };

  const addCreateSubtask = () => {
    setCreateSubtasks(prev => [...prev, { id: Date.now(), name: '', weight: '' }]);
  };

  const removeCreateSubtask = (id) => {
    setCreateSubtasks(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Task
          </button>
          <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {['Task Name', 'Assigned to', 'Start Date', 'Due Date', 'Priority', 'Status', 'Actions'].map(col => (
                <th key={col} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {currentSlice.map(t => (
              <tr key={t.id} onClick={() => openTaskDetail(t)} className="transition hover:bg-brand-50/50 dark:hover:bg-brand-900/10 cursor-pointer">
                <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[180px] truncate">{t.name}</td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{t.assignee}</td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.start}</td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.due}</td>
                <td className={`px-4 py-3 text-sm font-bold ${getPriorityClass(t.priority)}`}>{t.priority}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getTaskStatusClass(t.status)}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditConfirm(t.id)} className="text-slate-400 hover:text-brand-600 transition-colors p-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => openDeleteConfirm(t.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentSlice.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-sm">No tasks found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Showing</span>
          <select 
            value={perPage} 
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-slate-400 whitespace-nowrap">Showing {displayStart} to {displayEnd} out of {total} records</p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(page - 1)} 
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {paginationPages.map((p, idx) => p === '…' ? (
              <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
            ) : (
              <button 
                key={p} 
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition ${
                  p === page 
                    ? 'bg-brand-600 text-white shadow-sm' 
                    : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setPage(page + 1)} 
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- CREATE TASK MODAL --- */}
      {isCreateOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Task</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Name</label>
                <input type="text" value={createForm.name} onChange={e=>setCreateForm({...createForm, name: e.target.value})} placeholder="Enter the task name" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Description</label>
                <textarea rows="2" value={createForm.desc} onChange={e=>setCreateForm({...createForm, desc: e.target.value})} placeholder="Enter the task description" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned to</label>
                <select value={createForm.assignee} onChange={e=>setCreateForm({...createForm, assignee: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                  <option value="">Select...</option>
                  <option>Worker 1</option><option>Worker 2</option><option>Worker 3</option>
                  <option>Rahul Mehta</option><option>Ankit Verma</option><option>Suresh Patil</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start date</label>
                  <input type="date" value={createForm.start} onChange={e=>setCreateForm({...createForm, start: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End date</label>
                  <input type="date" value={createForm.end} onChange={e=>setCreateForm({...createForm, end: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Month/Year</label>
                  <input type="text" value={createForm.monthYear} onChange={e=>setCreateForm({...createForm, monthYear: e.target.value})} placeholder="e.g. Feb 2026" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Week</label>
                  <input type="text" value={createForm.week} onChange={e=>setCreateForm({...createForm, week: e.target.value})} placeholder="e.g. Week 1" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Name</label>
                  <input type="text" value={createForm.project} onChange={e=>setCreateForm({...createForm, project: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Manager</label>
                  <input type="text" value={createForm.manager} onChange={e=>setCreateForm({...createForm, manager: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Add Subtasks</label>
                <div className="space-y-2">
                  {createSubtasks.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-16 flex-shrink-0">Subtask {i+1}</span>
                      <input 
                        type="text" 
                        placeholder="Enter the subtask name" 
                        value={st.name}
                        onChange={e => {
                          const newSt = [...createSubtasks];
                          newSt[i].name = e.target.value;
                          setCreateSubtasks(newSt);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Weight %" 
                        value={st.weight}
                        onChange={e => {
                          const newSt = [...createSubtasks];
                          newSt[i].weight = e.target.value;
                          setCreateSubtasks(newSt);
                        }}
                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                      <button onClick={() => removeCreateSubtask(st.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addCreateSubtask} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-1 ml-18">
                  + Add Subtask
                </button>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-5 py-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={submitCreate} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
                Create Task
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- EDIT TASK CONFIRM MODAL --- */}
      {isEditConfirmOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <button onClick={() => setIsEditConfirmOpen(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">Edit Task?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Are you sure you want to edit the task?</p>
            <div className="space-y-2">
              <button onClick={confirmEdit} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">Yes</button>
              <button onClick={() => setIsEditConfirmOpen(false)} className="w-full text-sm font-semibold text-red-500 hover:underline py-1">Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- EDIT TASK FORM MODAL --- */}
      {isEditOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Edit Task</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Name</label>
                <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Description</label>
                <textarea rows="2" value={editForm.desc} onChange={e=>setEditForm({...editForm, desc: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned to</label>
                <select value={editForm.assignee} onChange={e=>setEditForm({...editForm, assignee: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                  <option value="">Select...</option>
                  <option>Worker 1</option><option>Worker 2</option><option>Worker 3</option>
                  <option>Rahul Mehta</option><option>Ankit Verma</option><option>Suresh Patil</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start date</label>
                  <input type="date" value={editForm.start} onChange={e=>setEditForm({...editForm, start: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End date</label>
                  <input type="date" value={editForm.end} onChange={e=>setEditForm({...editForm, end: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Month/Year</label>
                  <input type="text" value={editForm.monthYear} onChange={e=>setEditForm({...editForm, monthYear: e.target.value})} placeholder="e.g. Feb 2026" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Week</label>
                  <input type="text" value={editForm.week} onChange={e=>setEditForm({...editForm, week: e.target.value})} placeholder="e.g. Week 1" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Name</label>
                  <input type="text" value={editForm.project} onChange={e=>setEditForm({...editForm, project: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Manager</label>
                  <input type="text" value={editForm.manager} onChange={e=>setEditForm({...editForm, manager: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Add Subtasks</label>
                <div className="space-y-2">
                  {editSubtasks.map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-16 flex-shrink-0">Subtask {i+1}</span>
                      <input 
                        type="text" 
                        placeholder="Enter the subtask name" 
                        value={st.name}
                        onChange={e => {
                          const newSt = [...editSubtasks];
                          newSt[i].name = e.target.value;
                          setEditSubtasks(newSt);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Weight %" 
                        value={st.weight}
                        onChange={e => {
                          const newSt = [...editSubtasks];
                          newSt[i].weight = e.target.value;
                          setEditSubtasks(newSt);
                        }}
                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                      <button onClick={() => removeEditSubtask(st.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addEditSubtask} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-1 ml-18">
                  + Add Subtask
                </button>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
              <button onClick={saveEdit} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- DELETE TASK CONFIRM MODAL --- */}
      {isDeleteConfirmOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <button onClick={() => setIsDeleteConfirmOpen(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">Delete Task</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="w-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={confirmDelete} className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- TASK DETAIL MODAL --- */}
      {isDetailOpen && currentDetailTask && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{currentDetailTask.name}</h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getTaskStatusClass(currentDetailTask.status)}`}>{currentDetailTask.status}</span>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 md:px-6 md:py-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><p className="text-xs text-slate-400">Client</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.client}</p></div>
                <div><p className="text-xs text-slate-400">Workers</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.assignee}</p></div>
                <div><p className="text-xs text-slate-400">Equipment</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.equipment}</p></div>
                <div><p className="text-xs text-slate-400">Month/Year</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.monthYear}</p></div>
                <div><p className="text-xs text-slate-400">Week</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.week}</p></div>
                <div><p className="text-xs text-slate-400">Start Date</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.start}</p></div>
                <div><p className="text-xs text-slate-400">End Date</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.due}</p></div>
                <div><p className="text-xs text-slate-400">Created by</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{currentDetailTask.createdBy}</p></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Task Progress</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{currentDetailTask.progress}%</p>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{width: `${currentDetailTask.progress}%`}}></div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Subtasks Tracking</p>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 space-y-2.5">
                  {currentDetailTask.subtasks && currentDetailTask.subtasks.length > 0 ? (
                    currentDetailTask.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300">Subtask {i+1}: <span className="font-semibold">{st.name}</span></span>
                        <span className="text-brand-600 dark:text-brand-400 font-semibold">Weight: {st.weight}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No subtasks.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Photos</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border-2 border-dashed border-blue-300 dark:border-slate-600 rounded-xl h-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span className="text-[10px] font-medium uppercase tracking-wider">Add Photo</span>
                  </div>
                </div>
              </div>

            </div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Close</button>
              <button onClick={() => { /* stub */ setIsDetailOpen(false); }} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">Mark Complete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

