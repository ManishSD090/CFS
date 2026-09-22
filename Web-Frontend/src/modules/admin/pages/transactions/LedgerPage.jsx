import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, getProjectTransactionSummary } from '../../services/transactionServices';
import { fetchProjects } from '../../services/projectServices';

export default function LedgerPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchProjects().then(res => setProjects(Array.isArray(res) ? res : (res?.data || []))).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedProjectId, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {
        month: selectedMonth + 1,
        year: selectedYear,
        ...(selectedProjectId !== 'ALL' ? { projectId: selectedProjectId } : {})
      };
      
      const txRes = await getTransactions(params);
      setTransactions(Array.isArray(txRes) ? txRes : (txRes?.data || []));

      if (selectedProjectId !== 'ALL') {
        const sumRes = await getProjectTransactionSummary(selectedProjectId, params);
        setSummary(sumRes);
      } else {
        // Calculate basic summary from list if 'ALL'
        const data = Array.isArray(txRes) ? txRes : (txRes?.data || []);
        let inc = 0, exp = 0;
        data.forEach(t => {
          if (t.type === 'INCOME') inc += t.totalAmount;
          if (t.type === 'EXPENSE') exp += t.totalAmount;
        });
        setSummary({ totalIncome: inc, totalExpense: exp, balance: inc - exp });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (selectedType === 'ALL') return transactions;
    return transactions.filter(t => t.type === selectedType);
  }, [transactions, selectedType]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 sticky top-0 z-10">
        <h1 className="text-white text-[18px] font-bold">Ledger</h1>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
          <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-bold text-gray-700 outline-none">
            <option value="ALL">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-bold text-gray-700 outline-none">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-bold text-gray-700 outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs font-bold text-gray-500 mb-1">Total Income</div>
              <div className="text-lg font-bold text-green-600">₹{Number(summary.totalIncome || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs font-bold text-gray-500 mb-1">Total Expense</div>
              <div className="text-lg font-bold text-red-600">₹{Number(summary.totalExpense || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        {/* Type Tabs */}
        <div className="flex bg-white p-1 rounded-full border border-gray-100 shadow-sm">
          {['ALL', 'INCOME', 'EXPENSE'].map(type => (
            <button key={type} onClick={() => setSelectedType(type)} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${selectedType === type ? 'bg-[#0066CC] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {isLoading ? (
          <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-medium">No transactions found</div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(tx => {
              const isIncome = tx.type === 'INCOME' || tx.type === 'PETTY_CASH_REPLENISHMENT';
              const statusColor = tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : (tx.status === 'PENDING_APPROVAL' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700');
              
              return (
                <div key={tx.id || tx._id} onClick={() => navigate(`/admin/ledger/${tx.id || tx._id}`)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900">{new Date(tx.transactionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>{tx.status.replace('_', ' ')}</div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-1 mb-1">{tx.description}</p>
                  <p className="text-xs text-gray-400 font-medium mb-3">{tx.project?.name || 'Global'}</p>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{tx.type.replace(/_/g, ' ')}</span>
                    <span className={`font-bold text-base ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}₹{Number(tx.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:left-64">
        <button onClick={() => navigate('/admin/ledger/create')} className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">
          Add Ledger Entry
        </button>
      </div>
    </div>
  );
}
