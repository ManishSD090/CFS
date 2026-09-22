import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPayrollById, updatePayrollStatus, deletePayroll } from '../../../services/payrollServices';

function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

const STATUS_FLOW = {
  PENDING:   { next: 'PROCESSED', label: 'Mark Processed', color: 'bg-purple-600' },
  PROCESSED: { next: 'APPROVED',  label: 'Approve Payroll', color: 'bg-blue-600' },
  APPROVED:  { next: 'PAID',      label: 'Mark as Paid', color: 'bg-green-600' },
};

export default function PayrollDetailsPage() {
  const { id: projectId, payrollId } = useParams();
  const navigate = useNavigate();

  const [payroll, setPayroll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedWorker, setExpandedWorker] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getPayrollById(payrollId)
      .then(data => setPayroll(data))
      .catch(e => { alert('Failed to load payroll: ' + e.message); navigate(-1); })
      .finally(() => setIsLoading(false));
  }, [payrollId, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    let body = { status: newStatus };
    if (newStatus === 'PAID') {
      const method = prompt('Payment method (CASH / BANK_TRANSFER / UPI):');
      if (!method) return;
      const ref = prompt('Payment reference (optional):') || '';
      body = { ...body, paymentMethod: method.toUpperCase(), paymentReference: ref };
    }
    if (!window.confirm(`Confirm: Change status to ${newStatus}?`)) return;
    setIsProcessing(true);
    try {
      await updatePayrollStatus(payrollId, body);
      // Reload
      const updated = await getPayrollById(payrollId);
      setPayroll(updated);
      if (newStatus === 'PAID') {
        alert('Payroll marked as PAID. Budget LABOR category has been updated automatically.');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this payroll? This cannot be undone.')) return;
    setIsProcessing(true);
    try {
      await deletePayroll(payrollId);
      navigate(-1);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const statusColor = (s) => {
    const map = { PENDING: 'bg-orange-100 text-orange-700 border-orange-200', APPROVED: 'bg-blue-100 text-blue-700 border-blue-200', PROCESSED: 'bg-purple-100 text-purple-700 border-purple-200', PAID: 'bg-green-100 text-green-700 border-green-200', CANCELLED: 'bg-red-100 text-red-700 border-red-200' };
    return map[s] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  if (isLoading) return <div className="min-h-screen pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;
  if (!payroll) return null;

  const nextAction = STATUS_FLOW[payroll.status];
  const shiftTypeSummary = payroll.shiftTypeSummary || {};

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-28">
      {/* Header */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-white text-[17px] font-bold">{payroll.payrollNo}</h1>
          <p className="text-blue-200 text-[11px]">{new Date(payroll.periodFrom).toLocaleDateString('en-GB')} – {new Date(payroll.periodTo).toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status + Totals Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-500">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(payroll.status)}`}>{payroll.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0066CC]">{fmtCurrency(payroll.totalAmount)}</div>
              <div className="text-xs text-gray-400 mt-1 font-bold">Gross Amount</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{payroll.totalWorkers}</div>
              <div className="text-xs text-gray-400 mt-1 font-bold">Workers</div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-bold text-gray-500">Period Type</span>
            <span className="font-bold text-gray-800">{payroll.periodType}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="font-bold text-gray-500">Total Days</span>
            <span className="font-bold text-gray-800">{(payroll.totalDays || 0).toFixed(1)}</span>
          </div>
          {payroll.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">{payroll.notes}</p>
            </div>
          )}
        </div>

        {/* Shift Type Summary */}
        {Object.keys(shiftTypeSummary).length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Shift Type Breakdown</h3>
            {Object.entries(shiftTypeSummary).map(([name, data]) => (
              <div key={name} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-bold text-gray-700">{name}</span>
                  <span className="text-xs text-gray-400 ml-2">×{data.days?.toFixed(1)} days</span>
                </div>
                <span className="text-sm font-bold text-[#0066CC]">{fmtCurrency(data.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Budget Sync Info */}
        {payroll.status === 'PAID' && (
          <div className="bg-green-50/60 rounded-2xl p-4 border border-green-100 flex gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div>
              <h4 className="text-sm font-bold text-green-700">Budget Updated</h4>
              <p className="text-xs text-green-600/80 mt-0.5">This payroll has been marked as PAID. The LABOR budget category for the linked projects has been automatically deducted.</p>
            </div>
          </div>
        )}

        {/* Worker Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Worker Breakdown</h3>
          </div>
          {(payroll.items || []).map((item, i) => {
            const isExpanded = expandedWorker === item.id;
            const dailyBreakdown = item.attendanceSummary?.dailyBreakdown || [];
            return (
              <div key={item.id || i} className="border-b border-gray-50 last:border-0">
                <button onClick={() => setExpandedWorker(isExpanded ? null : item.id)} className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors text-left">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{item.workerName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.workerType?.replace('_',' ')} · {item.designation || 'Worker'} · {item.actualDays} days</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-[#0066CC]">{fmtCurrency(item.netAmount)}</div>
                      <div className="text-xs text-gray-400">Rate: {fmtCurrency(item.baseRate)}/day</div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>
                {isExpanded && dailyBreakdown.length > 0 && (
                  <div className="px-5 pb-4 bg-blue-50/30">
                    <div className="text-xs font-bold text-gray-500 mb-2 pt-2">Daily Breakdown</div>
                    {dailyBreakdown.slice(0, 10).map((d, di) => (
                      <div key={di} className="flex justify-between text-xs py-1 border-b border-blue-100/50 last:border-0">
                        <span className="text-gray-600">{new Date(d.date).toLocaleDateString('en-GB')} · {d.shiftType}</span>
                        <span className="font-bold text-[#0066CC]">{fmtCurrency(d.amount)}</span>
                      </div>
                    ))}
                    {dailyBreakdown.length > 10 && (
                      <div className="text-xs text-gray-400 mt-1">+{dailyBreakdown.length - 10} more days</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {(!payroll.items || payroll.items.length === 0) && (
            <div className="p-8 text-center text-gray-400 text-sm">No worker items found.</div>
          )}
        </div>

        {/* Audit Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-2 text-sm">
          <h3 className="font-bold text-gray-800 mb-3">Audit Trail</h3>
          {payroll.createdBy && <div className="flex justify-between"><span className="font-bold text-gray-500">Created By</span><span className="font-bold text-gray-800">{payroll.createdBy.name}</span></div>}
          {payroll.processedBy && <div className="flex justify-between"><span className="font-bold text-gray-500">Processed By</span><span className="font-bold text-gray-800">{payroll.processedBy.name}</span></div>}
          {payroll.approvedBy && <div className="flex justify-between"><span className="font-bold text-gray-500">Approved By</span><span className="font-bold text-gray-800">{payroll.approvedBy.name}</span></div>}
          {payroll.paidBy && <div className="flex justify-between"><span className="font-bold text-gray-500">Paid By</span><span className="font-bold text-gray-800">{payroll.paidBy.name}</span></div>}
          {payroll.paymentMethod && <div className="flex justify-between"><span className="font-bold text-gray-500">Payment Method</span><span className="font-bold text-gray-800">{payroll.paymentMethod}</span></div>}
          {payroll.paymentReference && <div className="flex justify-between"><span className="font-bold text-gray-500">Reference</span><span className="font-bold text-gray-800">{payroll.paymentReference}</span></div>}
        </div>
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 space-y-2 md:left-64">
        {nextAction && (
          <button disabled={isProcessing} onClick={() => handleStatusUpdate(nextAction.next)} className={`w-full py-3.5 text-white font-bold rounded-xl ${nextAction.color} disabled:opacity-50 shadow-md`}>
            {isProcessing ? 'Processing...' : nextAction.label}
          </button>
        )}
        {payroll.status === 'PENDING' && (
          <button disabled={isProcessing} onClick={handleDelete} className="w-full py-3 bg-white border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 disabled:opacity-50">
            Delete Payroll
          </button>
        )}
      </div>
    </div>
  );
}
