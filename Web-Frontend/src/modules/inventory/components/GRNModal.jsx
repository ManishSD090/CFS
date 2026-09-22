// src/modules/inventory/components/GRNModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const GRNModal = ({ isOpen, onClose, poData, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [receivedQty, setReceivedQty] = useState('');
  const [qualityCheck, setQualityCheck] = useState('Approved');
  const [rateSupplier, setRateSupplier] = useState('5 Stars');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const poItem     = poData?.items?.[0];
  const poItemId   = poItem?.id || 'fallback-id';
  const orderedQty = poItem?.quantity || 0;
  const description = poItem?.description || 'Material Batch';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      purchaseOrderId: poData?.id,
      notes: remarks,
      items: [
        {
          poItemId: poItemId,
          receivedQuantity: Number(receivedQty),
          acceptedQuantity: Number(receivedQty),
          inspectionStatus: qualityCheck === 'Approved' ? 'PASSED' : 'FAILED',
          qualityRating: 'GOOD',
        },
      ],
    };

    try {
      await inventoryService.createGRN(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process GRN. Ensure PO ID and Item ID are valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'w-full px-3.5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Goods Receipt Note</h2>
              <p className="text-xs text-slate-400">{poData?.poNumber || poData?.id || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Supplier info bar */}
          <div className="flex items-center justify-between mb-5 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Supplier</p>
              <p className="text-sm font-bold text-brand-600">{poData?.supplierName || poData?.supplier?.name || 'Unknown Supplier'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium mb-0.5">PO Reference</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">{poData?.poNumber || 'N/A'}</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800/50">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* GRN Items Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="grid grid-cols-4 bg-slate-50 dark:bg-slate-700/60 px-4 py-3">
                {['Sr.', 'Description', 'Ordered', 'Received'].map(h => (
                  <span key={h} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              <div className="grid grid-cols-4 items-center px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <span className="text-sm text-slate-400">01</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-2">{description}</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{orderedQty}</span>
                <input
                  required
                  type="number"
                  min="0"
                  max={orderedQty > 0 ? orderedQty : undefined}
                  className="w-24 px-2.5 py-2 border border-brand-400 dark:border-brand-600 rounded-lg text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={receivedQty}
                  onChange={e => setReceivedQty(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Quality Check</label>
                <select className={field} value={qualityCheck} onChange={e => setQualityCheck(e.target.value)}>
                  <option value="Approved">Approved ✅</option>
                  <option value="Rejected">Rejected ❌</option>
                </select>
              </div>
              <div>
                <label className={label}>Rate Supplier</label>
                <select className={field} value={rateSupplier} onChange={e => setRateSupplier(e.target.value)}>
                  <option value="5 Stars">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4 Stars">⭐⭐⭐⭐ Good</option>
                  <option value="3 Stars">⭐⭐⭐ Average</option>
                  <option value="2 Stars">⭐⭐ Poor</option>
                </select>
              </div>
            </div>

            <div>
              <label className={label}>Remarks (Optional)</label>
              <textarea rows="3" placeholder="Any notes about the delivery..." className={`${field} resize-none`}
                value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Processing...' : '✓ Confirm Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GRNModal;