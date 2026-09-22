import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateBudgetTransactionStatus, convertCommitmentToExpense, getBudgetTransactions } from '../../../services/budgetServices';

export default function BudgetTransactionDetailsPage() {
  const { budgetId, transactionId } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertAmount, setConvertAmount] = useState('');
  const [convertTax, setConvertTax] = useState('0');

  useEffect(() => {
    // We don't have a getBudgetTransactionById endpoint, so we fetch all for the budget and find it
    setIsLoading(true);
    getBudgetTransactions(budgetId)
      .then(res => {
        const txs = Array.isArray(res) ? res : (res?.data || []);
        const tx = txs.find(t => t.id === transactionId || t._id === transactionId);
        if (tx) {
          setTransaction(tx);
          setConvertAmount(tx.amount.toString());
        } else {
          alert('Transaction not found');
          navigate(-1);
        }
      })
      .catch(e => {
        alert('Failed to load transaction details');
        navigate(-1);
      })
      .finally(() => setIsLoading(false));
  }, [budgetId, transactionId, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    setIsProcessing(true);
    try {
      await updateBudgetTransactionStatus(transactionId, newStatus);
      alert(`Transaction marked as ${newStatus}`);
      navigate(-1);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConversion = async () => {
    setIsProcessing(true);
    setShowConvertModal(false);
    try {
      await convertCommitmentToExpense(transactionId, {
        actualAmount: parseFloat(convertAmount) || transaction.amount,
        taxAmount: parseFloat(convertTax) || 0
      });
      alert('Commitment successfully converted to Expense');
      navigate(-1);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 pt-12 flex justify-center"><svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;
  }

  if (!transaction) return null;

  const status = transaction.status.toUpperCase();
  const type = transaction.transactionType.toUpperCase();

  const canCancel = status === 'PENDING' || status === 'COMMITTED';
  const canApprove = status === 'PENDING';
  const canConvert = type === 'COMMITMENT' && status === 'COMMITTED';

  let badgeColor = 'bg-gray-100 text-gray-700';
  if (status === 'COMMITTED') badgeColor = 'bg-orange-100 text-orange-700';
  if (status === 'DISBURSED') badgeColor = 'bg-green-100 text-green-700';
  if (status === 'CANCELLED') badgeColor = 'bg-red-100 text-red-700';

  let iconStr = '₹';
  if (type === 'TRANSFER') iconStr = '⇄';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-[#0066CC] flex items-center px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold">Transaction Details</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center mb-5">
          <div className={`px-3 py-1 rounded text-xs font-bold mb-4 ${badgeColor}`}>
            {status}
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#0066CC] text-2xl font-bold mb-4">
            {iconStr}
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            ₹{Number(transaction.amount).toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-500 font-bold tracking-wide">
            {type}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Transaction Details</h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="w-1/3 text-sm text-gray-500 font-medium">Transaction No</div>
              <div className="flex-1 text-sm font-bold text-gray-800 text-right">{transaction.transactionNo}</div>
            </div>
            <div className="flex">
              <div className="w-1/3 text-sm text-gray-500 font-medium">Date</div>
              <div className="flex-1 text-sm font-bold text-gray-800 text-right">
                {new Date(transaction.transactionDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {type === 'TRANSFER' ? (
              <>
                <div className="flex">
                  <div className="w-1/3 text-sm text-gray-500 font-medium">From Category</div>
                  <div className="flex-1 text-sm font-bold text-gray-800 text-right">
                    {transaction.category?.category?.name || 'UNCATEGORIZED'}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm text-gray-500 font-medium">To Category</div>
                  <div className="flex-1 text-sm font-bold text-gray-800 text-right">
                    {transaction.transferToCategory?.category?.name || 'UNKNOWN'}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex">
                <div className="w-1/3 text-sm text-gray-500 font-medium">Budget Category</div>
                <div className="flex-1 text-sm font-bold text-gray-800 text-right">
                  {transaction.category?.category?.name?.replace(/_/g, ' ') || 'UNCATEGORIZED'}
                </div>
              </div>
            )}
            <div className="flex">
              <div className="w-1/3 text-sm text-gray-500 font-medium">Description</div>
              <div className="flex-1 text-sm font-bold text-gray-800 text-right">{transaction.description}</div>
            </div>
            {transaction.createdBy && (
              <div className="flex">
                <div className="w-1/3 text-sm text-gray-500 font-medium">Created By</div>
                <div className="flex-1 text-sm font-bold text-gray-800 text-right">{transaction.createdBy.name || 'Unknown'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Reference Card */}
        {transaction.referenceType && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              <h2 className="text-base font-bold text-blue-600">Linked Request</h2>
            </div>
            <div className="space-y-4">
              <div className="flex">
                <div className="w-1/3 text-sm text-gray-500 font-medium">Source</div>
                <div className="flex-1 text-sm font-bold text-gray-800 text-right">{transaction.referenceType.replace(/_/g, ' ')}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-sm text-gray-500 font-medium">Reference No.</div>
                <div className="flex-1 text-sm font-bold text-gray-800 text-right">{transaction.referenceNo || transaction.referenceId || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {(canCancel || canApprove || canConvert) && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3 ml-1">Actions</h3>
            <div className="flex gap-3">
              {canConvert && (
                <button disabled={isProcessing} onClick={() => setShowConvertModal(true)} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Pay / Finalize
                </button>
              )}
              {canApprove && (
                <button disabled={isProcessing} onClick={() => handleStatusUpdate('COMMITTED')} className="flex-1 py-3 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Approve
                </button>
              )}
              {canCancel && (
                <button disabled={isProcessing} onClick={() => handleStatusUpdate('CANCELLED')} className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Convert to Expense</h3>
            <p className="text-sm text-gray-600 mb-5">Confirm the final spent amount and taxes for this commitment.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Actual Amount</label>
                <input type="number" value={convertAmount} onChange={e => setConvertAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Tax Amount</label>
                <input type="number" value={convertTax} onChange={e => setConvertTax(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066CC]" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConvertModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
              <button disabled={isProcessing} onClick={handleConversion} className="flex-1 py-2.5 bg-[#0066CC] text-white font-bold rounded-xl hover:bg-blue-700">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
