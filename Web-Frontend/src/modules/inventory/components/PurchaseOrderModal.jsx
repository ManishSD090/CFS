// src/modules/inventory/components/PurchaseOrderModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const PurchaseOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    projectId: '', supplierName: '', location: '', expectedDate: '', gst: '',
    materialDesc: '', quantity: '', totalAmount: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      projectId: formData.projectId,
      title: `PO for ${formData.materialDesc}`,
      type: 'MATERIAL',
      supplierName: formData.supplierName,
      deliveryAddress: formData.location,
      expectedDelivery: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
      items: [
        {
          description: formData.materialDesc,
          quantity: Number(formData.quantity) || 1,
          unit: 'nos',
          unitPrice: Number(formData.totalAmount) / (Number(formData.quantity) || 1),
          taxPercent: Number(formData.gst) || 0,
        },
      ],
    };

    try {
      await inventoryService.createPurchaseOrder(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Validation failed. Check if Project ID is correct.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'w-full px-3.5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Purchase Order</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800/50">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Project ID *</label>
              <input required type="text" placeholder="e.g. clu123abc456" className={field}
                value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} />
            </div>

            <div>
              <label className={label}>Supplier Name *</label>
              <input required type="text" placeholder="e.g. Ultratech Cements Ltd." className={field}
                value={formData.supplierName} onChange={e => setFormData({ ...formData, supplierName: e.target.value })} />
            </div>

            <div>
              <label className={label}>Delivery Address</label>
              <input type="text" placeholder="Enter delivery location" className={field}
                value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Expected Delivery *</label>
                <input required type="date" className={field}
                  value={formData.expectedDate} onChange={e => setFormData({ ...formData, expectedDate: e.target.value })} />
              </div>
              <div>
                <label className={label}>GST % (Optional)</label>
                <input type="number" min="0" max="100" placeholder="18" className={field}
                  value={formData.gst} onChange={e => setFormData({ ...formData, gst: e.target.value })} />
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Order Item</p>
              <div className="space-y-3">
                <div>
                  <label className={label}>Material Description *</label>
                  <input required type="text" placeholder="e.g. OPC Cement 53 Grade" className={field}
                    value={formData.materialDesc} onChange={e => setFormData({ ...formData, materialDesc: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Quantity *</label>
                    <input required type="number" min="1" placeholder="0" className={field}
                      value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className={label}>Total Amount (₹) *</label>
                    <input required type="number" min="1" placeholder="0" className={field}
                      value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;