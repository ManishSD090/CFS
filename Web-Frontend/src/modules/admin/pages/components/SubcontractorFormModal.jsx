import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SubcontractorFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    workType: '',
    phone: '',
    email: '',
    project: '',
    start: '',
    end: '',
    contract: '',
    budget: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        workType: initialData.workType || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        project: initialData.project || '',
        start: initialData.start || '',
        end: initialData.end || '',
        contract: initialData.contract || '',
        budget: initialData.budget || ''
      });
    } else {
      setFormData({
        name: '',
        workType: '',
        phone: '',
        email: '',
        project: '',
        start: '',
        end: '',
        contract: '',
        budget: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[3px] animate-fade-in font-lexend pointer-events-auto">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-100 dark:border-slate-700 fade-up">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 z-10 flex-shrink-0">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Edit sub-contractor' : 'Create new sub-contractor'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 md:px-6 py-5 space-y-4 overflow-y-auto">
          {/* Row 1: Name, Work Type, Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sub-contractor Name</label>
              <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Enter the sub-contractor name"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Work Type</label>
              <input name="workType" value={formData.workType} onChange={handleChange} type="text" placeholder="Enter type of work"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Enter the phone number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
            </div>
          </div>

          {/* Row 2: Email, Assigned Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email ID</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter the Email ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Project</label>
              <select name="project" value={formData.project} onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option value="">Select...</option>
                <option value="Site A — Residential Block">Site A — Residential Block</option>
                <option value="Site B — Commercial Complex">Site B — Commercial Complex</option>
                <option value="Site C — Infrastructure Road">Site C — Infrastructure Road</option>
                <option value="Site D — Township Phase 1">Site D — Township Phase 1</option>
              </select>
            </div>
          </div>

          {/* Row 3: Start date, End date, Total Contract, Estimated Budget */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start date</label>
              <div className="relative">
                <input name="start" value={formData.start} onChange={handleChange} type="date"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm pr-9 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End date</label>
              <div className="relative">
                <input name="end" value={formData.end} onChange={handleChange} type="date"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm pr-9 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Contract</label>
              <input name="contract" value={formData.contract} onChange={handleChange} type="number" placeholder="Enter..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Budget</label>
              <input name="budget" value={formData.budget} onChange={handleChange} type="number" placeholder="Enter..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"/>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-colors shadow-sm">
            {initialData ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
