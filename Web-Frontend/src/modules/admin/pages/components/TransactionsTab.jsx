import { useState } from 'react';
import useTransactions from "../../hooks/useTransactions";
import CreateRequestModal from './CreateRequestModal';

export default function TransactionsTab({ projectId }) {
  const [subTab, setSubTab] = useState('funds');
  const [showRequestModal, setShowRequestModal] = useState(false);

  // 🔥 Backend integration
  const {
    transactions = [],
    summary = {},
    loading,
    error,
    create
  } = useTransactions(projectId);

  // 🔹 Map backend → UI safe format
  const fundsData = transactions
    .filter(t => t.type === "CREDIT")
    .map(t => ({
      date: new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
      by: t.createdBy || "Admin",
      amount: `₹${t.amount?.toLocaleString()}`,
      amountRaw: t.amount
    }));

  const expenseData = transactions
    .filter(t => t.type === "DEBIT")
    .map(t => ({
      date: new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
      category: t.category || "General",
      amount: `₹${t.amount?.toLocaleString()}`
    }));

  const requestsData = transactions
    .filter(t => t.status)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
      desc: t.description,
      by: t.requestedBy || "User",
      amount: `₹${t.amount?.toLocaleString()}`,
      status: t.status
    }));

  const totalExpenses = summary?.totalExpenses || 0;
  const balance = summary?.balance || 0;
  const fundsReleased = summary?.totalCredits || 0;
  
  // Total approved budget could be higher or equal to released. Defaulting to a fixed higher sum for UI presentation if backend doesn't provide it
  const totalApproved = 18000000; 

  const donutCircumference = 163.4;
  const expensePct = fundsReleased > 0 ? Math.min(totalExpenses / fundsReleased, 1) : 0;
  const expenseDash = (expensePct * donutCircumference).toFixed(1);

  if (loading) return <p className="text-slate-400 p-4">Loading transactions...</p>;
  if (error) return <p className="text-sm text-red-500 p-4">{error}</p>;

  return (
    <div className="space-y-4">
      {/* Approved Budget row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Total Approved Budget:
          <span className="text-brand-600 dark:text-brand-400 font-bold ml-1">₹{totalApproved.toLocaleString()}</span>
        </p>
        <button className="self-start sm:self-auto text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline transition-all">
          View Version →
        </button>
      </div>

      {/* Summary cards + donut chart */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Total Expenses */}
        <div className="sm:col-span-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3.5 space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Expenses</p>
          <p className="text-xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Spent so far</p>
        </div>
        {/* Available Balance */}
        <div className="sm:col-span-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3.5 space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Available Balance</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">₹{balance.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Remaining funds</p>
        </div>
        {/* Funds Released */}
        <div className="sm:col-span-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3.5 space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Funds Released</p>
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400">₹{fundsReleased.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total disbursed</p>
        </div>
        {/* Donut chart */}
        <div className="sm:col-span-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3.5 flex items-center justify-center gap-4">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="26" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle cx="36" cy="36" r="26" fill="none" stroke="#3b82f6" strokeWidth="12"
              strokeDasharray={donutCircumference} strokeDashoffset="0"
              strokeLinecap="butt" transform="rotate(-90 36 36)" />
            <circle cx="36" cy="36" r="26" fill="none" stroke="#ef4444" strokeWidth="12"
              strokeDasharray={`${expenseDash} ${donutCircumference}`} strokeDashoffset="0"
              strokeLinecap="butt" transform="rotate(-90 36 36)" />
          </svg>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 flex-shrink-0"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500 flex-shrink-0"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs: Funds / Expense / Requests */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          <button 
            onClick={() => setSubTab('funds')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab === 'funds' ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Funds
          </button>
          <button 
            onClick={() => setSubTab('expense')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab === 'expense' ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Expense
          </button>
          <button 
            onClick={() => setSubTab('requests')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${subTab === 'requests' ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Requests
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Date filter */}
          <div className="relative border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl flex items-center pr-3">
            <input type="date" className="bg-transparent pl-3 pr-2 py-1.5 text-slate-600 dark:text-slate-300 text-xs focus:outline-none focus:ring-0 appearance-none" />
          </div>
          {/* Create Request */}
          <button 
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Request
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full min-w-[480px]">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
              {subTab === 'funds' ? (
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Released By</th>
              ) : subTab === 'expense' ? (
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Category</th>
              ) : (
                <>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Requested By</th>
                </>
              )}
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Amount</th>
              {subTab === 'requests' && (
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {subTab === 'funds' && fundsData.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">{r.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400">{r.by}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400 text-right">{r.amount}</td>
              </tr>
            ))}
            
            {subTab === 'expense' && expenseData.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">{r.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400">{r.category}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-500 text-right">{r.amount}</td>
              </tr>
            ))}
            
            {subTab === 'requests' && requestsData.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">{r.date}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{r.desc}</td>
                <td className="px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400">{r.by}</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">{r.amount}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.status === 'Approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                    r.status === 'Rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}

            {((subTab === 'funds' && !fundsData.length) || 
              (subTab === 'expense' && !expenseData.length) || 
              (subTab === 'requests' && !requestsData.length)) && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-400">
                  No {subTab} found.
                </td>
              </tr>
            )}
          </tbody>
          
          {(subTab === 'funds' || subTab === 'expense') && (
            <tfoot className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
              <tr>
                <td colSpan="2" className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Total {subTab === 'funds' ? 'Released' : 'Spent'}
                </td>
                <td className={`px-4 py-2.5 text-sm font-bold text-right ${subTab === 'funds' ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
                  ₹{(subTab === 'funds' ? fundsReleased : totalExpenses).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <CreateRequestModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onCreate={async (payload) => {
          await create(payload);
          setShowRequestModal(false);
        }}
      />
    </div>
  );
}