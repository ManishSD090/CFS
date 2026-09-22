import React, { useState, useEffect } from 'react';
import { updateContractorProject } from '../../../../services/subcontractor.service';

const STATUS_OPTS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'];

export default function EditProjectSubcontractorModal({ isOpen, onClose, onSuccess, contractData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    scopeOfWork: '',
    startDate: '',
    endDate: '',
    contractAmount: '',
    advanceAmount: '',
    retentionAmount: '',
    paymentTerms: '',
    status: 'TODO'
  });

  useEffect(() => {
    if (isOpen && contractData) {
      setForm({
        title: contractData.title || '',
        scopeOfWork: contractData.scopeOfWork || '',
        startDate: contractData.startDate ? contractData.startDate.split('T')[0] : '',
        endDate: contractData.endDate ? contractData.endDate.split('T')[0] : '',
        contractAmount: contractData.contractAmount || '',
        advanceAmount: contractData.advanceAmount || '',
        retentionAmount: contractData.retentionAmount || '',
        paymentTerms: contractData.paymentTerms || '',
        status: contractData.status || 'TODO'
      });
    }
  }, [isOpen, contractData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        contractAmount: form.contractAmount ? parseFloat(form.contractAmount) : undefined,
        advanceAmount: form.advanceAmount ? parseFloat(form.advanceAmount) : undefined,
        retentionAmount: form.retentionAmount ? parseFloat(form.retentionAmount) : undefined,
      };
      
      await updateContractorProject(contractData.id, payload);
      onSuccess?.();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Contract Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <form id="edit-contract-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Contract Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]">
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Financials</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Contract Amount (₹)</label>
                <input type="number" step="0.01" value={form.contractAmount} onChange={e => setForm({...form, contractAmount: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Advance Amount (₹)</label>
                <input type="number" step="0.01" value={form.advanceAmount} onChange={e => setForm({...form, advanceAmount: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Retention Amount (₹)</label>
                <input type="number" step="0.01" value={form.retentionAmount} onChange={e => setForm({...form, retentionAmount: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe]" />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />
            
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Scope of Work</label>
              <textarea rows={3} value={form.scopeOfWork} onChange={e => setForm({...form, scopeOfWork: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe] resize-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Payment Terms</label>
              <textarea rows={2} value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#0f62fe] resize-none" />
            </div>

          </form>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-contract-form" disabled={isSubmitting} className="flex-1 py-2.5 bg-[#0f62fe] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
