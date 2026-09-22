import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculatePayroll, getAllPayrolls, createPayroll, deletePayroll } from '../../../services/payrollServices';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export default function PayrollPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState('Daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // calculatePayroll response data
  const [calcData, setCalcData] = useState(null);  // { totalAmount, totalWorkers, workers, periodFrom, periodTo }
  const [groupedData, setGroupedData] = useState([]); // [{title, amount}]
  const [grandTotal, setGrandTotal] = useState(0);

  // Payroll history list (created payrolls)
  const [payrolls, setPayrolls] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeSection, setActiveSection] = useState('calculate'); // 'calculate' | 'history'
  const [isCreating, setIsCreating] = useState(false);

  // ----------- Fetch history -----------------------------------
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getAllPayrolls({ limit: 50 });
      setPayrolls(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ----------- Fetch calculation --------------------------------
  const runCalculation = async () => {
    setIsLoading(true);
    setCalcData(null);
    setGroupedData([]);
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth(); // 0-indexed

      let periodFrom, periodTo;

      if (tab === 'Daily') {
        // From Jan 1 of year to selected date (same as Flutter behaviour)
        periodFrom = new Date(year, 0, 1).toISOString();
        periodTo = new Date(year, month, selectedDate.getDate(), 23, 59, 59).toISOString();
      } else if (tab === 'Weekly') {
        periodFrom = new Date(year, 0, 1).toISOString();
        periodTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      } else {
        // Monthly
        periodFrom = new Date(year, 0, 1).toISOString();
        periodTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      }

      const data = await calculatePayroll({ periodFrom, periodTo, projectId });
      setCalcData(data);
      processData(data, tab, selectedDate);
    } catch (e) {
      alert('Calculation failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mirror Flutter _processData logic
  const processData = (data, currentTab, date) => {
    if (!data || !data.workers) return;
    const workers = data.workers;
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    const tempGroups = {};

    // Pre-populate gaps
    if (currentTab === 'Daily') {
      let cur = new Date(year, 0, 1);
      const end = new Date(year, month, date.getDate());
      while (cur <= end) {
        tempGroups[cur.toISOString().split('T')[0]] = 0;
        cur = new Date(cur.getTime() + 86400000);
      }
    } else if (currentTab === 'Weekly') {
      let cur = new Date(year, 0, 1);
      const end = new Date(year, month + 1, 0);
      while (cur <= end) {
        const wk = Math.floor((cur.getDate() - 1) / 7) + 1;
        const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2,'0')}-${wk}`;
        tempGroups[key] = 0;
        cur = new Date(cur.getTime() + 86400000);
      }
    } else {
      let cur = new Date(year, 0, 1);
      const end = new Date(year, month, 1);
      while (cur <= end) {
        const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-01`;
        if (!tempGroups[key]) tempGroups[key] = 0;
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
    }

    // Fill from workers' dailyBreakdown
    for (const worker of workers) {
      for (const att of (worker.dailyBreakdown || [])) {
        const dateStr = att.date ? att.date.toString().split('T')[0] : '';
        const d = new Date(dateStr);
        const amount = att.amount || 0;
        let key;
        if (currentTab === 'Daily') {
          key = dateStr;
        } else if (currentTab === 'Weekly') {
          const wk = Math.floor((d.getDate() - 1) / 7) + 1;
          key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${wk}`;
        } else {
          key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
        }
        if (key in tempGroups) tempGroups[key] = (tempGroups[key] || 0) + amount;
      }
    }

    const sorted = Object.keys(tempGroups).sort((a, b) => b.localeCompare(a));
    const total = sorted.reduce((s, k) => s + tempGroups[k], 0);

    setGrandTotal(total);
    setGroupedData(sorted.map(key => {
      let title;
      if (currentTab === 'Daily') {
        const d = new Date(key);
        title = `${String(d.getDate()).padStart(2,'0')} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
      } else if (currentTab === 'Weekly') {
        const parts = key.split('-');
        title = `${MONTH_SHORT[parseInt(parts[1])-1]} ${parts[0]}, WEEK ${parts[2]}`;
      } else {
        const d = new Date(key);
        title = `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
      }
      return { title, amount: tempGroups[key] };
    }));
  };

  useEffect(() => {
    if (calcData) {
      processData(calcData, tab, selectedDate);
    }
  }, [tab]);

  const handleCreatePayroll = async () => {
    if (!calcData || !calcData.workers || calcData.workers.length === 0) {
      return alert('No workers found in this period. Run calculation first.');
    }
    if (!window.confirm(`Create payroll for ${calcData.totalWorkers} worker(s)? Total: ${fmtCurrency(calcData.totalAmount)}`)) return;
    setIsCreating(true);
    try {
      const periodFrom = calcData.periodFrom;
      const periodTo = calcData.periodTo;
      await createPayroll({ periodFrom, periodTo, workers: calcData.workers, periodType: tab.toUpperCase() });
      alert('Payroll created successfully! It is now PENDING approval.');
      loadHistory();
      setActiveSection('history');
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsCreating(false);
    }
  };

  const statusColor = (s) => {
    const map = { PENDING: 'bg-orange-100 text-orange-700', APPROVED: 'bg-blue-100 text-blue-700', PROCESSED: 'bg-purple-100 text-purple-700', PAID: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  const monthLabel = `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const dayLabel = `${String(selectedDate.getDate()).padStart(2,'0')}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${selectedDate.getFullYear()}`;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-[#0066CC] flex items-center justify-between px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-1.5 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-white text-[18px] font-bold">Payroll Details</h1>
        </div>
        <button onClick={() => navigate(`/admin/projects/${projectId}/payroll/settings`)} className="text-white hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      {/* Section Toggle */}
      <div className="flex bg-white border-b border-gray-100">
        <button onClick={() => setActiveSection('calculate')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeSection === 'calculate' ? 'text-[#0066CC] border-b-2 border-[#0066CC]' : 'text-gray-400'}`}>
          Calculate
        </button>
        <button onClick={() => setActiveSection('history')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeSection === 'history' ? 'text-[#0066CC] border-b-2 border-[#0066CC]' : 'text-gray-400'}`}>
          History
        </button>
      </div>

      {activeSection === 'calculate' ? (
        <div className="p-4 space-y-4 pb-32">
          {/* Period Toggle — Daily / Weekly / Monthly */}
          <div className="h-11 p-1 bg-gray-100 rounded-xl flex">
            {['Daily','Weekly','Monthly'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg font-semibold text-sm transition-all ${tab === t ? 'bg-white text-[#0066CC] shadow-sm' : 'text-gray-500'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">{tab === 'Daily' ? dayLabel : monthLabel}</span>
              <svg className="w-4 h-4 text-[#0066CC] ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <input
              type={tab === 'Daily' ? 'date' : 'month'}
              value={tab === 'Daily'
                ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`
                : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}`
              }
              onChange={e => {
                const v = e.target.value;
                if (v) {
                  const parts = v.split('-');
                  setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1])-1, parts[2] ? parseInt(parts[2]) : 1));
                }
              }}
              className="opacity-0 w-0 h-0 absolute"
              id="date-picker-hidden"
            />
            <button onClick={() => document.getElementById('date-picker-hidden').showPicker?.()} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <svg className="w-5 h-5 text-[#0066CC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          </div>

          <button onClick={runCalculation} disabled={isLoading} className="w-full py-3 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 text-sm flex items-center justify-center gap-2">
            {isLoading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Calculating...</> : 'Run Calculation'}
          </button>

          {/* Results */}
          {groupedData.length > 0 && (
            <>
              {/* Summary bar */}
              {calcData && (
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
                    <div className="text-xs font-bold text-gray-400 mb-1">Workers</div>
                    <div className="text-xl font-bold text-gray-900">{calcData.totalWorkers}</div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
                    <div className="text-xs font-bold text-gray-400 mb-1">Period Total</div>
                    <div className="text-lg font-bold text-[#0066CC]">{fmtCurrency(calcData.totalAmount)}</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {groupedData.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-4 flex justify-between items-center shadow-sm">
                    <span className="font-semibold text-gray-800 text-sm">{item.title}</span>
                    <span className={`font-bold text-base ${item.amount > 0 ? 'text-[#0066CC]' : 'text-gray-300'}`}>{fmtCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Total footer */}
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Payroll:</span>
                <span className="text-xl font-bold text-[#0066CC]">{fmtCurrency(grandTotal)}</span>
              </div>
            </>
          )}

          {!isLoading && groupedData.length === 0 && calcData !== null && (
            <div className="py-12 text-center text-gray-400 font-medium">No payroll data found for this period.</div>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-3 pb-24">
          {isLoadingHistory ? (
            <div className="py-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
          ) : payrolls.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium">No payroll records found. Run a calculation to create one.</div>
          ) : payrolls.map(p => (
            <div key={p.id} onClick={() => navigate(`/admin/projects/${projectId}/payroll/${p.id}`)} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-gray-900">{p.payrollNo}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.periodFrom).toLocaleDateString('en-GB')} – {new Date(p.periodTo).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor(p.status)}`}>{p.status}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">{p.totalWorkers} workers · {p.periodType}</span>
                <span className="font-bold text-[#0066CC]">{fmtCurrency(p.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB — only on calculate tab when data available */}
      {activeSection === 'calculate' && calcData && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:left-64">
          <button onClick={handleCreatePayroll} disabled={isCreating} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 shadow-md">
            {isCreating ? 'Creating...' : `Create Payroll (${fmtCurrency(grandTotal)})`}
          </button>
        </div>
      )}
    </div>
  );
}
