// src/modules/inventory/components/TransferModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const TransferModal = ({ isOpen, onClose, itemData, type = 'MATERIAL', onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ toProjectId: '', quantity: '', notes: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      fromLocation: 'GLOBAL',
      toLocation: 'PROJECT',
      toProjectId: formData.toProjectId,
      description: formData.notes || undefined,
      items: [
        {
          itemType: type,
          materialId:  type === 'MATERIAL'   ? itemData?.id : undefined,
          equipmentId: type === 'EQUIPMENT'  ? itemData?.id : undefined,
          quantity: type === 'MATERIAL' ? Number(formData.quantity) : 1,
        },
      ],
    };

    try {
      await inventoryService.transferItem(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to transfer. Verify Destination Project ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'w-full px-3.5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  const iconColor  = type === 'MATERIAL' ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'bg-sky-50 dark:bg-sky-900/30 text-sky-600';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center`}>
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Transfer {type === 'MATERIAL' ? 'Material' : 'Equipment'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Item card */}
          {itemData && (
            <div className="mb-5 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800/50 flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-100 dark:bg-brand-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-0.5">Item to Transfer</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{itemData.name}</p>
                <p className="text-xs text-slate-500">{type === 'MATERIAL' ? `Stock: ${itemData.stockQuantity ?? '—'} ${itemData.unit}` : itemData.type}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800/50">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Destination Project ID *</label>
              <input required type="text" placeholder="e.g. project-abc-123" className={field}
                value={formData.toProjectId} onChange={e => setFormData({ ...formData, toProjectId: e.target.value })} />
            </div>

            {type === 'MATERIAL' && (
              <div>
                <label className={label}>Quantity to Transfer *</label>
                <input required type="number" min="1" placeholder="0" className={field}
                  value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
            )}

            <div>
              <label className={label}>Notes (Optional)</label>
              <textarea rows="3" placeholder="Any notes about this transfer..." className={`${field} resize-none`}
                value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Transferring...' : '→ Confirm Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;