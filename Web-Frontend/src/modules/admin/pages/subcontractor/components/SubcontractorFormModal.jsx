import React, { useState, useEffect } from 'react';
import { createSubcontractor, updateSubcontractor } from '../../../services/subcontractor.service';

const TYPE_OPTS = ['LABOR', 'EQUIPMENT', 'MATERIAL_SUPPLY', 'TRANSPORTATION', 'OTHER'];
const WORK_TYPE_OPTS = ['CONCRETE', 'STEEL', 'CARPENTRY', 'ELECTRICAL', 'PLUMBING', 'PAINTING', 'TILING', 'EXCAVATION', 'DEMOLITION', 'RENOVATION', 'MAINTENANCE', 'CLEANING', 'LANDSCAPING', 'OTHER'];

export default function SubcontractorFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'LABOR',
    workTypes: [],
    contactPerson: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    registrationNumber: '',
    gstNumber: '',
    panNumber: '',
    aadharNumber: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    bankBranch: ''
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        name: initialData.name || '',
        type: initialData.type || 'LABOR',
        workTypes: initialData.workTypes || [],
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        altPhone: initialData.altPhone || '',
        address: initialData.address || '',
        registrationNumber: initialData.registrationNumber || '',
        gstNumber: initialData.gstNumber || '',
        panNumber: initialData.panNumber || '',
        aadharNumber: initialData.aadharNumber || '',
        bankName: initialData.bankName || '',
        bankAccount: initialData.bankAccount || '',
        bankIfsc: initialData.bankIfsc || '',
        bankBranch: initialData.bankBranch || ''
      });
    } else if (isOpen) {
      setForm({
        name: '', type: 'LABOR', workTypes: [], contactPerson: '', email: '', phone: '', altPhone: '', address: '', registrationNumber: '', gstNumber: '', panNumber: '', aadharNumber: '', bankName: '', bankAccount: '', bankIfsc: '', bankBranch: ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.workTypes.length === 0) return alert('Select at least one work type');
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateSubcontractor(initialData.id, form);
      } else {
        await createSubcontractor(form);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkTypeToggle = (wt) => {
    setForm(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(wt) 
        ? prev.workTypes.filter(t => t !== wt)
        : [...prev.workTypes, wt]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Subcontractor' : 'New Subcontractor'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <form id="sc-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Company / Individual Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]">
                    {TYPE_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Work Types * (Select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {WORK_TYPE_OPTS.map(wt => (
                      <button 
                        key={wt} 
                        type="button" 
                        onClick={() => handleWorkTypeToggle(wt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                          form.workTypes.includes(wt)
                            ? 'bg-[#0f62fe] text-white border-[#0f62fe]'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#0f62fe]'
                        }`}
                      >
                        {wt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Contact Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Contact Person *</label>
                  <input type="text" required value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Phone *</label>
                    <input type="text" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Address</label>
                  <textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe] resize-none" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Compliance & Bank */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Compliance & Bank</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">GST Number</label>
                    <input type="text" value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">PAN Number</label>
                    <input type="text" value={form.panNumber} onChange={e => setForm({...form, panNumber: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Bank Name</label>
                  <input type="text" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Account Number</label>
                    <input type="text" value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">IFSC Code</label>
                    <input type="text" value={form.bankIfsc} onChange={e => setForm({...form, bankIfsc: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#0f62fe]" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" form="sc-form" disabled={isSubmitting} className="flex-1 py-2.5 bg-[#0f62fe] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Subcontractor')}
          </button>
        </div>
      </div>
    </div>
  );
}
