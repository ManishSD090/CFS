import React, { useState } from 'react';

export default function CreateRequestModal({ isOpen, onClose, onCreate }) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [dateRequired, setDateRequired] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!description || !amount) return;
    
    // Defaulting mapped API payload since it creates DEBIT transactions when creating requests
    await onCreate({
      description,
      amount: Number(amount),
      type: 'DEBIT',
      category: category || 'Other',
      status: 'Pending',
    });
    
    // Clear form
    setDescription('');
    setCategory('');
    setAmount('');
    setDateRequired('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend pointer-events-auto">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 animate-zoom-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create Fund Request</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description <span className="text-red-500">*</span></label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Cement – 200 Bags" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option value="">Select category</option>
                <option>Labour</option>
                <option>Materials</option>
                <option>Admin</option>
                <option>Equipment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Amount (₹) <span className="text-red-500">*</span></label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date Required</label>
            <input type="date" value={dateRequired} onChange={(e) => setDateRequired(e.target.value)} className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Notes</label>
            <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details…" className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 dark:placeholder-slate-500 resize-none outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"></textarea>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">Submit Request</button>
        </div>
      </div>
    </div>
  );
}
