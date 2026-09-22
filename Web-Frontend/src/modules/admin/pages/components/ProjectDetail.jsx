import { useState } from 'react';
import TransactionsTab from './TransactionsTab';
import TimelineTab from './TimelineTab';
import TasksTab from './TasksTab';
import AttendanceTab from './AttendanceTab';
import ProjectInventoryTab from './ProjectInventoryTab';
import SubcontractorTab from './SubcontractorTab';
import DprWprTab from './DprWprTab';

const statusStyle = {
  Ongoing:   { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400' },
  Completed: { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-600 dark:text-blue-400'   },
  'On Hold': { bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-500 dark:text-amber-400' },
};
const priorityColor = { High: 'text-red-500', Medium: 'text-amber-500', Low: 'text-green-600' };

const TAB_DEFS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'dpr',
    label: 'DPR',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <polyline points="8 8 12 4 16 8"/>
        <polyline points="8 16 12 20 16 16"/>
      </svg>
    ),
  },
  {
  id: 'inventory',
  label: 'Inventory',
  icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 7l9-4 9 4-9 4-9-4z"/>
      <path d="M3 7v10l9 4 9-4V7"/>
    </svg>
  ),
},
{
  id: 'subcontractor',
  label: 'Sub-contractor',
  icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
},
];

export default function ProjectDetail({ project, onBack, onEditClick, onDeleteClick }) {

  

  // 🔍 DEBUG: check what project actually contains
  console.log("🔥 FULL PROJECT OBJECT:", project);
  console.log("🔥 PROJECT ID BEING SENT:", project?.id);

  const [activeTab, setActiveTab] = useState('overview');

  const ss = statusStyle[project.status] || statusStyle['Ongoing'];
  const pc = priorityColor[project.priority];

  const actIcons = {
    doc: (
      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    check: (
      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    user: (
      <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  };

  const realProjectId = project?.id || project?.projectId;

console.log("✅ USING PROJECT ID:", realProjectId);


  return (
    <div className="space-y-4">
      <div className="mb-2">
        <button
          onClick={onBack}
          className="text-slate-500 dark:text-slate-400 hover:text-brand-600 text-sm font-medium transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Projects
        </button>
      </div>

      {/* Header row */}
      <div className="stagger-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">{project.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{project.location} | {project.idCode} · {project.client}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ss.bg} ${ss.text}`}>{project.status}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Priority: <span className={`font-bold ${pc}`}>{project.priority}</span>
              </span>
              <span className="text-xs text-slate-400">Start: {project.start} · End: {project.end}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onEditClick} className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button onClick={onDeleteClick} className="flex items-center gap-1.5 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 md:p-4 text-center">
            <p className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">{project.budget}</p>
            <p className="text-xs text-slate-400 mt-0.5">Budget Used</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 md:p-4 text-center">
            <p className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">{project.daysLeft}</p>
            <p className="text-xs text-slate-400 mt-0.5">Days Left</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 md:p-4 text-center">
            <p className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">{project.tasks}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tasks Done</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{project.progress}% complete</p>
        </div>
      </div>

      {/* Detail tabs */}
      <div className="stagger-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
          {TAB_DEFS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`detail-tab flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm border-b-2 transition-colors ${
                activeTab === id
                  ? 'active'
                  : 'border-transparent text-slate-500 dark:text-slate-400'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-5">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Project Info
                  </h4>
                  <dl className="space-y-2.5">
                    {[
                      ['Client',           project.client,   'text-brand-600 dark:text-brand-400 font-semibold'],
                      ['Location',         project.location, 'text-slate-700 dark:text-slate-200 font-medium'],
                      ['Project Manager',  project.manager,  'text-slate-700 dark:text-slate-200 font-medium'],
                      ['Site Engineer',    project.engineer, 'text-slate-700 dark:text-slate-200 font-medium'],
                      ['Contract Value',   project.contract, 'text-slate-700 dark:text-slate-200 font-medium'],
                      ['Adv. Received',    project.advance,  'text-slate-700 dark:text-slate-200 font-medium'],
                    ].map(([label, val, cls]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="text-xs text-slate-400 w-32 flex-shrink-0">{label}</dt>
                        <dd className={`text-xs ${cls}`}>{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Milestones
                  </h4>
                  <div className="space-y-2.5">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.done ? 'ms-done' : 'ms-pend'}`}></span>
                          <span className={`text-xs font-medium text-slate-700 dark:text-slate-200 ${!m.done && 'text-slate-400 dark:text-slate-500'}`}>{m.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">{m.date}</span>
                          {m.done && (
                            <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  Recent Activities
                </h4>
                <div className="space-y-0">
                  {project.activities.map((a, i) => (
                    <div key={i} className={`flex items-start gap-3 py-2.5 ${i < project.activities.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/60' : ''}`}>
                      <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {actIcons[a.icon] || actIcons.doc}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-wrap items-start justify-between gap-1">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{a.text}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {activeTab === 'attendance' && (
            <AttendanceTab projectId={realProjectId} />
          )}

          {/* ── DPR ── */}
          {activeTab === 'dpr' && (
            <div className="-mx-4 md:-mx-5 pb-8 pt-2 h-full">
              <DprWprTab projectId={realProjectId} />
            </div>
          )}

          {/* ── TASKS ── */}
          {activeTab === 'tasks' && <TasksTab />}

          {/* ── TRANSACTIONS ── */}


{/* ── TRANSACTIONS ── */}
{activeTab === 'transactions' && (
  <TransactionsTab projectId={realProjectId} />
)}

{/* ── TIMELINE ── */}
{activeTab === 'timeline' && (
  <TimelineTab projectId={realProjectId} />
)}

{activeTab === 'inventory' && (
  <ProjectInventoryTab projectId={realProjectId} />
)}

{/* ── SUBCONTRACTOR ── */}
{activeTab === 'subcontractor' && (
  <SubcontractorTab projectId={realProjectId} />
)}

        </div>
      </div>
    </div>
  );
}
