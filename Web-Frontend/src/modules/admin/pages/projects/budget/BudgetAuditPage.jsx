import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBudgetAuditTrail } from '../../../services/budgetServices';

export default function BudgetAuditPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const budgetId = searchParams.get('budgetId');

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!budgetId) { navigate(-1); return; }
    
    getBudgetAuditTrail(budgetId)
      .then(res => {
        setLogs(Array.isArray(res) ? res : (res?.data || []));
      })
      .catch(e => {
        console.error(e);
        alert('Failed to load audit trail');
      })
      .finally(() => setIsLoading(false));
  }, [budgetId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Budget Audit Trail</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {isLoading ? (
          <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-12 flex flex-col items-center text-center shadow-sm">
            <p className="text-gray-500 text-sm mb-4">No audit logs found for this budget.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-[#0066CC] text-sm uppercase tracking-wide">
                    {(log.action || 'ACTION').replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'Unknown Date'}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  {log.user?.name || 'System / Unknown User'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
