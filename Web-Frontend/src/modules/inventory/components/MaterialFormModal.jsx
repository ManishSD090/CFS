// src/modules/inventory/components/MaterialFormModal.jsx
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory.service';

const MaterialFormModal = ({ isOpen, onClose, onSuccess, editId = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '', category: '', hsnCode: '', minimumStock: '', unitPrice: '', supplier: '', unit: 'nos'
  });

  useEffect(() => {
    setErrorMessage('');
    if (isOpen && editId) {
      inventoryService.getMaterialById(editId).then(res => {
        if (res.success) setFormData(res.data);
      }).catch(() => setErrorMessage('Failed to load material data.'));
    } else if (isOpen) {
      setFormData({ name: '', category: '', hsnCode: '', minimumStock: '', unitPrice: '', supplier: '', unit: 'nos' });
    }
  }, [isOpen, editId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      name: formData.name,
      unit: formData.unit,
      materialCode: formData.hsnCode || undefined,
      minimumStock: Number(formData.minimumStock) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      supplier: formData.supplier || undefined,
    };

    try {
      if (editId) await inventoryService.updateMaterial(editId, payload);
      else await inventoryService.createMaterial(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save material. Please ensure the code is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'w-full px-3.5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Material' : 'Create Material'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
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
              <label className={label}>Material Name *</label>
              <input required type="text" placeholder="e.g. Portland Cement" className={field}
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div>
              <label className={label}>Category</label>
              <select className={field} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Select category</option>
                <option value="Cement">Cement</option>
                <option value="Steel">Steel</option>
                <option value="Sand">Sand</option>
                <option value="Bricks">Bricks</option>
                <option value="Aggregates">Aggregates</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Consumables">Consumables</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>HSN / Material Code</label>
                <input type="text" placeholder="e.g. HSN-2523" className={field}
                  value={formData.hsnCode} onChange={e => setFormData({ ...formData, hsnCode: e.target.value })} />
              </div>
              <div>
                <label className={label}>Low Stock Threshold</label>
                <input type="number" min="0" placeholder="0" className={field}
                  value={formData.minimumStock} onChange={e => setFormData({ ...formData, minimumStock: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Cost per Unit (₹)</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" className={field}
                  value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} />
              </div>
              <div>
                <label className={label}>Unit *</label>
                <select required className={field} value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                  <option value="nos">Nos</option>
                  <option value="kg">KG</option>
                  <option value="ton">Ton</option>
                  <option value="bags">Bags</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                  <option value="sqft">Sq.Ft</option>
                  <option value="cft">CFT</option>
                </select>
              </div>
            </div>

            <div>
              <label className={label}>Supplier</label>
              <input type="text" placeholder="e.g. Ultratech Cements Ltd." className={field}
                value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Saving...' : (editId ? 'Update Material' : 'Create Material')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialFormModal;