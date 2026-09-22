import { useState } from 'react';

const mockPayrollData = [
  { name: 'Ramesh Kumar', role: 'Mason', amount: 5600, type: 'daily' },
  { name: 'Suresh Patil', role: 'Carpenter', amount: 3200, type: 'daily' },
  { name: 'Mahesh Yadav', role: 'Plumber', amount: 1800, type: 'daily' },
  { name: 'Anita Desai', role: 'Site Engineer', amount: 5600, type: 'weekly' },
  { name: 'Vijay Nair', role: 'Site Engineer', amount: 12000, type: 'monthly' }
];

export default function PayrollDetailsModal({ isOpen, onClose, onOpenSettings }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateFilter, setDateFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

  if (!isOpen) return null;

  // Filter based on active tab for mock demonstration
  const currentList = mockPayrollData.filter(item => item.type === activeTab || item.type === 'daily');
  const total = currentList.reduce((acc, curr) => acc + curr.amount, 0);

  const getTabClass = (tabName) => {
    return `px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      activeTab === tabName 
        ? 'bg-brand-600 text-white shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
    }`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col border border-slate-100 dark:border-slate-700 animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Payroll Details</h3>
            <p className="text-xs text-slate-400 mt-0.5">View payroll by day, week, or month</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <button onClick={() => setActiveTab('daily')} className={getTabClass('daily')}>Daily</button>
            <button onClick={() => setActiveTab('weekly')} className={getTabClass('weekly')}>Weekly</button>
            <button onClick={() => setActiveTab('monthly')} className={getTabClass('monthly')}>Monthly</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-5 pb-3 flex-shrink-0">
          <div className="relative flex-1">
            <input 
              type={activeTab === 'monthly' ? 'month' : 'date'}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="field-input w-full pl-3 pr-8 py-2 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          {activeTab === 'weekly' && (
            <select 
              value={weekFilter} 
              onChange={(e) => setWeekFilter(e.target.value)}
              className="field-input w-36 px-3 py-2 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none"
            >
              <option value="">Week</option>
              <option value="1">Week 1</option>
              <option value="2">Week 2</option>
              <option value="3">Week 3</option>
              <option value="4">Week 4</option>
            </select>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 space-y-2 min-h-[120px] custom-scrollbar">
          {currentList.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.role}</p>
              </div>
              <p className={`text-sm font-bold ${item.amount > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                ₹{item.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mx-5 mb-3 mt-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-4 py-3 flex items-center justify-between flex-shrink-0 border border-slate-100 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Payroll:</span>
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">₹{total.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-4 flex-shrink-0">
          <button onClick={onOpenSettings} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            Payroll Settings
          </button>
        </div>
      </div>
    </div>
  );
}
