import { useState, useMemo } from 'react';

function badgeClass(status) {
  if (status === 'Active') return 'badge-active';
  if (status === 'Warning') return 'badge-warning';
  return 'badge-suspended';
}

export default function CompanyTable({ companies, onCreateClick, onViewClick, onEditClick, onDeleteClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    return companies.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchQ = !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.status.toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || c.status.toLowerCase() === statusFilter;
      return matchQ && matchS;
    });
  }, [companies, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const start = (currentPage - 1) * perPage;
  const slice = filteredData.slice(start, start + perPage);
  const showStart = Math.min(start + 1, filteredData.length);
  const showEnd = Math.min(currentPage * perPage, filteredData.length);

  // Pagination buttons with ellipsis
  const getPages = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= delta) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }
    return pages;
  };

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setCurrentPage(1);
  };

  const handlePerPage = (v) => {
    setPerPage(Number(v));
    setCurrentPage(1);
  };

  const filterBtnClass = (s) => {
    if (s === statusFilter) {
      return 'text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-500 text-brand-600 bg-brand-50 dark:bg-brand-700/20 transition';
    }
    return 'text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400 transition';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,.06),0_1px_2px_-1px_rgba(0,0,0,.04)] border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 md:px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search companies…"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {/* Create */}
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Company
          </button>
          {/* Filter */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="px-4 md:px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-3 items-center bg-slate-50 dark:bg-slate-700/50">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status:</span>
          <button onClick={() => handleStatusFilter('all')} className={filterBtnClass('all')}>All</button>
          <button onClick={() => handleStatusFilter('active')} className={filterBtnClass('active')}>Active</button>
          <button onClick={() => handleStatusFilter('suspended')} className={filterBtnClass('suspended')}>Suspended</button>
          <button onClick={() => handleStatusFilter('warning')} className={filterBtnClass('warning')}>Warning</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-5 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-3">Location</th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-3">Active Projects</th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-3">Total Users</th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-3">Joined</th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-3">Last Active</th>
              <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-3 text-right pr-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((c) => (
              <tr
                key={c.id}
                onClick={() => onViewClick(c)}
                className="company-row border-b border-slate-50 dark:border-slate-700/50 last:border-0 cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{c.subId} · GST: {c.gst}</p>
                </td>
                <td className="px-3 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{c.location}</td>
                <td className="px-3 py-3.5 text-sm text-slate-600 dark:text-slate-300">{c.projects}</td>
                <td className="px-3 py-3.5 text-sm text-slate-600 dark:text-slate-300">{c.users}</td>
                <td className="px-3 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{c.joined}</td>
                <td className="px-3 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{c.lastActive}</td>
                <td className="px-3 py-3.5 text-right pr-5">
                  <span className={`badge ${badgeClass(c.status)}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-5 py-4 border-t border-slate-100 dark:border-slate-700">
        {/* Per-page */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Showing</span>
          <select
            value={perPage}
            onChange={(e) => handlePerPage(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Info + pages */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Showing {showStart} to {showEnd} out of {filteredData.length} records
          </p>
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            {getPages().map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition ${
                    p === currentPage
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
