import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBudgetById, getBudgetRevisions, createBudgetRevision, submitRevisionForApproval, applyRevision } from '../../../services/budgetServices';

export default function BudgetRevisionsPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const budgetId = searchParams.get('budgetId');

  const [budget, setBudget] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchRevisions = async () => {
    try {
      setIsLoading(true);
      const [b, revs] = await Promise.all([
        getBudgetById(budgetId),
        getBudgetRevisions(budgetId)
      ]);
      setBudget(b);
      setRevisions(Array.isArray(revs) ? revs : (revs?.data || []));
    } catch (e) {
      alert('Failed to load: ' + e.message);
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!budgetId) navigate(-1);
    else fetchRevisions();
  }, [budgetId]);

  const handleSubmitApproval = async (revId) => {
    try {
      await submitRevisionForApproval(revId);
      alert('Submitted for approval');
      fetchRevisions();
    } catch (e) { alert('Failed: ' + e.message); }
  };

  const handleApplyRevision = async (revId) => {
    try {
      await applyRevision(revId);
      alert('Revision Applied Successfully');
      fetchRevisions();
    } catch (e) { alert('Failed: ' + e.message); }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;
  }

  if (isCreating) {
    return <CreateRevisionView budget={budget} onCancel={() => setIsCreating(false)} onSuccess={() => { setIsCreating(false); fetchRevisions(); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-[#0066CC] flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-white text-[18px] font-bold">Budget Revisions</h1>
        </div>
        <button onClick={() => setIsCreating(true)} className="bg-white text-[#0066CC] px-3 py-1.5 rounded text-sm font-bold shadow-sm">
          + New Revision
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {revisions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-12 flex flex-col items-center text-center shadow-sm">
            <p className="text-gray-500 text-sm mb-4">No revisions found for this budget.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {revisions.map(rev => {
              const statusStr = rev.status.toUpperCase();
              let statusText = "Draft";
              let statusColor = "bg-gray-100 text-gray-700";
              if (statusStr === 'APPLIED') { statusText = "Applied"; statusColor = "bg-green-100 text-green-700"; }
              else if (statusStr === 'REJECTED') { statusText = "Rejected"; statusColor = "bg-red-100 text-red-700"; }
              else if (statusStr === 'APPROVED') { statusText = "Approved (Ready)"; statusColor = "bg-blue-100 text-[#0066CC]"; }
              else if (statusStr === 'PENDING_APPROVAL' || statusStr === 'PENDINGAPPROVAL') { statusText = "Pending Approval"; statusColor = "bg-orange-100 text-orange-700"; }

              return (
                <div key={rev.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-[#0066CC]">{rev.revisionNo}</h3>
                      <p className="text-sm text-gray-600 mt-1">Reason: {rev.reason}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  {statusStr === 'REJECTED' && rev.rejectionReason && (
                    <div className="bg-red-50 text-red-800 text-xs p-2 rounded mb-3">
                      Rejection Reason: {rev.rejectionReason}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-gray-500">Net Change:</span>
                    <span className={`font-bold ${rev.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rev.changeAmount >= 0 ? '+' : ''}₹{Number(rev.changeAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {statusStr === 'DRAFT' && (
                    <button onClick={() => handleSubmitApproval(rev.id)} className="w-full py-2 bg-[#0066CC] text-white font-bold rounded-lg hover:bg-blue-700 text-sm">
                      Submit for Approval
                    </button>
                  )}
                  {statusStr === 'APPROVED' && (
                    <button onClick={() => handleApplyRevision(rev.id)} className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-sm">
                      Apply Revision
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateRevisionView({ budget, onCancel, onSuccess }) {
  const [reason, setReason] = useState('');
  const [revisionType, setRevisionType] = useState('PRICE_ADJUSTMENT');
  const [rows, setRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budget?.categories) {
      setRows(budget.categories.map(cat => ({
        ...cat,
        adjustment: '0',
        newAmount: cat.allocatedAmount
      })));
    }
  }, [budget]);

  const handleAdjustmentChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].adjustment = value;
    const adj = parseFloat(value) || 0;
    newRows[index].newAmount = newRows[index].allocatedAmount + adj;
    setRows(newRows);
  };

  const totalNewAmount = rows.reduce((acc, row) => acc + row.newAmount, 0);
  const totalChange = totalNewAmount - budget.totalApproved;

  const handleSubmit = async () => {
    if (!reason.trim()) return alert('Reason is required');

    const categoryChanges = {};
    for (const row of rows) {
      const change = parseFloat(row.adjustment) || 0;
      if (change !== 0) {
        categoryChanges[row.id] = {
          previous: row.allocatedAmount,
          new: row.newAmount,
          change: change
        };
      }
    }

    if (Object.keys(categoryChanges).length === 0) {
      return alert('No changes detected in the budget.');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        revisionType,
        reason: reason.trim(),
        effectiveDate: new Date().toISOString(),
        previousTotal: budget.totalApproved,
        newTotal: totalNewAmount,
        changeAmount: totalChange,
        categoryChanges
      };
      await createBudgetRevision(budget.id, payload);
      onSuccess();
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={onCancel} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Create Revision</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-32">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 mb-1">Revision Type</label>
            <select value={revisionType} onChange={e => setRevisionType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]">
              <option value="PRICE_ADJUSTMENT">Price Adjustment</option>
              <option value="QUANTITY_CHANGE">Quantity Change</option>
              <option value="SCOPE_CHANGE">Scope Change</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Reason for Amendment *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows="2" placeholder="e.g. Price escalation in steel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC] resize-none" />
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={row.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center">
              <div className="flex-1">
                <div className="font-bold text-[#0066CC] text-sm">{row.category}</div>
                <div className="text-xs text-gray-500">{row.subCategory || '-'}</div>
              </div>
              <div className="text-right mr-4">
                <div className="text-[10px] text-gray-500">Current</div>
                <div className="text-sm font-semibold">₹{Number(row.allocatedAmount).toLocaleString('en-IN')}</div>
              </div>
              <div className="w-28">
                <input type="number" value={row.adjustment} onChange={e => handleAdjustmentChange(i, e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#0066CC] text-center font-bold" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex flex-col">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="font-bold">Net Change:</span>
            <span className={`font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}₹{Number(totalChange).toLocaleString('en-IN')}
            </span>
          </div>
          <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-3 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Revision'}
          </button>
        </div>
      </div>
    </div>
  );
}
