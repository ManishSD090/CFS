import { useState } from 'react';

const statusStyle = {
  Ongoing: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  Completed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  'On Hold': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-500 dark:text-amber-400' },
};
const priorityColor = { High: 'text-red-500', Medium: 'text-amber-500', Low: 'text-green-600' };

export default function ProjectList({ projects, onOpenDetail, onCreateClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <>
      {/* Toolbar */}
      <div className="stagger-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field-input w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Project
          </button>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 border px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              showFilter ? 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-500' : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Filter pills */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 mb-4 stagger-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-center mr-1">Status:</span>
          {['all', 'Ongoing', 'Completed', 'On Hold'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`filter-pill text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                statusFilter === status
                  ? 'border-brand-500 text-brand-600 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-12">No projects match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const ss = statusStyle[p.status] || statusStyle['Ongoing'];
            return (
              <div
                key={p.id}
                onClick={() => onOpenDetail(p.id)}
                className="project-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 md:p-5 fade-up"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{p.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{p.idCode}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${ss.bg} ${ss.text}`}>
                    {p.status.toUpperCase().replace(' ', '-')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{p.location}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-slate-400">Client</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">{p.client}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Start</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{p.start}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Priority</p>
                    <p className={`text-xs font-bold mt-0.5 ${priorityColor[p.priority]}`}>{p.priority}</p>
                  </div>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${p.progress}%` }}></div>
                </div>
                <p className="text-xs text-slate-400">
                  {p.progress}% complete · {p.daysLeft > 0 ? p.daysLeft + ' days left' : 'Completed'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
