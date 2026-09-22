// src/modules/inventory/components/MaterialRequestModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const MaterialRequestModal = ({ isOpen, onClose, material, projectId, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    projectId: projectId || '', quantity: '', purpose: '', urgency: 'MEDIUM', expectedDelivery: ''
  });

  // Sync projectId prop when it changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, projectId: projectId || prev.projectId }));
      setErrorMessage('');
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      projectId: formData.projectId,
      materialId: material?.id,
      materialName: material?.name,
      quantity: Number(formData.quantity),
      unit: material?.unit || 'nos',
      purpose: formData.purpose,
      urgency: formData.urgency,
      expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined,
    };

    try {
      await inventoryService.requestItem(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit request. Ensure Project ID is correct.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = 'w-full px-3.5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  const urgencyColors = { LOW: 'text-emerald-600', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-zoom-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Request Material</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Material highlight card */}
          {material && (
            <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Requesting</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{material.name}</p>
                <p className="text-xs text-slate-500">{material.materialCode || ''} · Stock: {material.stockQuantity ?? '—'} {material.unit}</p>
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
              <label className={label}>Project ID *</label>
              <input
                required type="text" placeholder="e.g. project-abc-123" className={field}
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                readOnly={!!projectId}
              />
              {projectId && <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Auto-filled from current project</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Quantity *</label>
                <input required type="number" min="1" placeholder="0" className={field}
                  value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <div>
                <label className={label}>Urgency</label>
                <select className={`${field} font-semibold ${urgencyColors[formData.urgency]}`}
                  value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className={label}>Expected Delivery</label>
              <input type="date" className={field}
                value={formData.expectedDelivery} onChange={e => setFormData({ ...formData, expectedDelivery: e.target.value })} />
            </div>

            <div>
              <label className={label}>Purpose *</label>
              <textarea required rows="3" placeholder="Why is this material needed?" className={`${field} resize-none`}
                value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Submitting...' : '→ Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestModal;