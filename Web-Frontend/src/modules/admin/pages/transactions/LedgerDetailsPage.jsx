import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionById, approveTransactionEntry, rejectTransactionEntry, voidTransactionEntry } from '../../services/transactionServices';

export default function LedgerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getTransactionById(id)
      .then(res => {
        setTransaction(res.data || res);
      })
      .catch(e => {
        console.error(e);
        alert('Failed to load transaction details');
        navigate(-1);
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleAction = async (actionFn, payload, successMsg) => {
    setIsProcessing(true);
    try {
      await actionFn(id, payload);
      alert(successMsg);
      navigate(-1);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) handleAction(rejectTransactionEntry, { reason }, 'Transaction Rejected');
  };

  const handleVoid = () => {
    const reason = prompt('Enter reason for voiding:');
    if (reason) handleAction(voidTransactionEntry, { reason }, 'Transaction Voided');
  };

  if (isLoading) return <div className="min-h-screen pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;
  if (!transaction) return null;

  const status = transaction.status;
  const isIncome = transaction.type === 'INCOME' || transaction.type === 'PETTY_CASH_REPLENISHMENT';

  let statusColor = 'bg-gray-100 text-gray-700 border-gray-300';
  if (status === 'APPROVED') statusColor = 'bg-green-100 text-green-700 border-green-300';
  if (status === 'PENDING_APPROVAL') statusColor = 'bg-orange-100 text-orange-700 border-orange-300';
  if (status === 'REJECTED' || status === 'VOID') statusColor = 'bg-red-100 text-red-700 border-red-300';

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Transaction Details</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 uppercase">{transaction.type.replace(/_/g, ' ')}</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {isIncome ? '+' : '-'}₹{Number(transaction.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between py-1.5">
            <span className="text-sm font-bold text-gray-500">Base Amount</span>
            <span className="text-sm font-bold text-gray-900">₹{Number(transaction.amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-sm font-bold text-gray-500">Tax Amount</span>
            <span className="text-sm font-bold text-gray-900">₹{Number(transaction.taxAmount).toLocaleString('en-IN')}</span>
          </div>
          <hr className="my-2 border-gray-100" />
          <div className="flex justify-between py-1.5">
            <span className="text-sm font-bold text-gray-800">Total Amount</span>
            <span className={`text-base font-bold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
              ₹{Number(transaction.totalAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Financial Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-500">Transaction ID</span>
              <span className="text-sm font-bold text-gray-900">{transaction.transactionNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-500">Date</span>
              <span className="text-sm font-bold text-gray-900">{new Date(transaction.transactionDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-500">Counterparty</span>
              <span className="text-sm font-bold text-gray-900">{transaction.counterpartyName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-500">Project</span>
              <span className="text-sm font-bold text-gray-900">{transaction.project?.name || 'Global'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-500">Category</span>
              <span className="text-sm font-bold text-gray-900">{transaction.category || 'General'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-500">Description</span>
              <span className="text-sm font-bold text-gray-900 text-right max-w-[60%]">{transaction.description || 'N/A'}</span>
            </div>
            {transaction.rejectionReason && (
              <div className="flex justify-between bg-red-50 p-2 rounded">
                <span className="text-sm font-bold text-red-500">Rejection Reason</span>
                <span className="text-sm font-bold text-red-600 text-right max-w-[60%]">{transaction.rejectionReason}</span>
              </div>
            )}
            {transaction.voidReason && (
              <div className="flex justify-between bg-red-50 p-2 rounded">
                <span className="text-sm font-bold text-red-500">Void Reason</span>
                <span className="text-sm font-bold text-red-600 text-right max-w-[60%]">{transaction.voidReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget Sync Link */}
        {transaction.budgetId && (
          <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100 flex gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <div>
              <h4 className="text-sm font-bold text-green-700 mb-1">Budget Sync Enabled</h4>
              <p className="text-xs text-green-600/80">This expense is linked to a project budget and will update the category allocation automatically.</p>
            </div>
          </div>
        )}

        {/* Linked Source */}
        {transaction.sourceType !== 'DIRECT' && (
          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#0066CC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              <h4 className="text-sm font-bold text-[#0066CC]">Linked Source</h4>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm font-bold text-blue-500">Source Type</span>
              <span className="text-sm font-bold text-blue-900">{transaction.sourceType.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm font-bold text-blue-500">Reference No.</span>
              <span className="text-sm font-bold text-blue-900">{transaction.referenceNo || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {status === 'PENDING_APPROVAL' && (
          <div className="flex gap-3 pt-4">
            <button disabled={isProcessing} onClick={() => handleAction(approveTransactionEntry, {}, 'Transaction Approved')} className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-sm disabled:opacity-50">
              Approve
            </button>
            <button disabled={isProcessing} onClick={handleReject} className="flex-1 py-3.5 bg-white border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 disabled:opacity-50">
              Reject
            </button>
          </div>
        )}

        {status === 'APPROVED' && (
          <div className="pt-4">
            <button disabled={isProcessing} onClick={handleVoid} className="w-full py-3.5 bg-white border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg> Void Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
