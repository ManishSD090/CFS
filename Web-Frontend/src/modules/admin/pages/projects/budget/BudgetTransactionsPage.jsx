import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBudgetTransactions } from '../../../services/budgetServices';
import { getProjectCashboxBalance } from '../../../services/transactionServices';

export default function BudgetTransactionsPage() {
  const { projectId, budgetId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('COMMITMENT');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [transactions, setTransactions] = useState([]);
  const [cashbox, setCashbox] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txRes, cbRes] = await Promise.all([
          getBudgetTransactions(budgetId),
          getProjectCashboxBalance(projectId).catch(() => null)
        ]);
        setTransactions(Array.isArray(txRes) ? txRes : (txRes?.data || []));
        if (cbRes) setCashbox(cbRes);
      } catch (e) {
        console.error(e);
        alert('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [budgetId, projectId]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.transactionType !== activeTab) return false;
      if (selectedDate) {
        const txDate = new Date(tx.transactionDate).toISOString().split('T')[0];
        if (txDate !== selectedDate) return false;
      }
      if (activeTab === 'COMMITMENT' && statusFilter !== 'ALL') {
        if (tx.status.toUpperCase() !== statusFilter) return false;
      }
      return true;
    });
  }, [transactions, activeTab, selectedDate, statusFilter]);

  const renderTransactionCard = (tx) => {
    const status = tx.status.toUpperCase();
    const isTransfer = tx.transactionType === 'TRANSFER';
    
    let amountColor = 'text-[#0066CC]';
    if (tx.transactionType === 'EXPENSE') amountColor = 'text-red-500';
    if (tx.transactionType === 'COMMITMENT') {
      if (status === 'DISBURSED') amountColor = 'text-green-500';
      if (status === 'CANCELLED') amountColor = 'text-red-500';
    }
    if (isTransfer) amountColor = 'text-orange-500';

    let badgeColor = 'bg-gray-100 text-gray-600';
    if (status === 'COMMITTED') badgeColor = 'bg-orange-100 text-orange-700';
    if (status === 'DISBURSED') badgeColor = 'bg-green-100 text-green-700';
    if (status === 'CANCELLED') badgeColor = 'bg-red-100 text-red-700';

    const catName = tx.category?.category?.name?.replace(/_/g, ' ') || 'UNCATEGORIZED';
    const toCatName = tx.transferToCategory?.category?.name?.replace(/_/g, ' ') || 'UNKNOWN';

    return (
      <div key={tx.id || tx._id} onClick={() => navigate(`/admin/projects/${projectId}/budget/${budgetId}/transactions/${tx.id || tx._id}`)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3 cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-[15px]">{new Date(tx.transactionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold ${badgeColor}`}>{status}</div>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{tx.description}</p>
        
        {tx.referenceType && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded mb-3 text-[10px] font-bold text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            {tx.referenceType.replace(/_/g, ' ')}
          </div>
        )}

        <div className="flex justify-between items-end">
          <div className="flex-1 pr-2">
            {isTransfer ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{catName}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                <span className="text-[11px] font-bold text-[#0066CC] bg-blue-50 px-1.5 py-0.5 rounded">{toCatName}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-[#0066CC]">{catName}</span>
            )}
          </div>
          <div className={`font-bold text-base whitespace-nowrap ${amountColor}`}>
            ₹{Number(tx.amount).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(`/admin/projects/${projectId}/tabs`)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Budget Transactions</h1>
      </div>

      <div className="flex-1 overflow-auto pb-24">
        {/* Cashbox Banner */}
        {cashbox && (
          <div className="m-4 p-5 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#1E3A8A] shadow-md shadow-blue-900/20">
            <div className="flex justify-between items-center text-white/80 text-sm font-medium mb-2">
              <span>Project Cashbox Balance</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <div className="text-white text-3xl font-bold">{cashbox.currency || 'INR'} {Number(cashbox.currentBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        )}

        {/* Custom Tab Bar */}
        <div className="mx-4 my-2 p-1 bg-white rounded-full shadow-sm border border-gray-100 flex">
          {['COMMITMENT', 'EXPENSE', 'TRANSFER'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelectedDate(''); setStatusFilter('ALL'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === tab ? 'bg-[#0066CC] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="relative">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-[#0066CC] rounded-lg text-sm text-[#0066CC] font-bold outline-none bg-white" />
            <svg className="w-4 h-4 text-[#0066CC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {selectedDate && <button onClick={() => setSelectedDate('')} className="absolute -right-2 -top-2 bg-red-100 text-red-500 rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>}
          </div>

          {activeTab === 'COMMITMENT' && (
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-full px-3 py-1.5 text-sm font-medium outline-none bg-white">
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMMITTED">Committed</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          )}
        </div>

        <div className="px-4 mt-2">
          {isLoading ? (
            <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center text-gray-500 font-medium">No transactions found</div>
          ) : (
            filteredTransactions.map(renderTransactionCard)
          )}
        </div>
      </div>

      {/* Fixed bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:left-64">
        <button onClick={() => navigate(`/admin/projects/${projectId}/budget/${budgetId}/transactions/add`)} className="w-full py-3.5 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">
          Add Record
        </button>
      </div>
    </div>
  );
}
