import { useState } from 'react';

export default function CreateCompanyModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    companyName: '', registrationNumber: '', gstNumber: '', address: '',
    email: '', website: '', phone: '',
    adminName: '', adminEmail: '', adminPhone: '', giveAllPermissions: false,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ companyName: '', registrationNumber: '', gstNumber: '', address: '', email: '', website: '', phone: '', adminName: '', adminEmail: '', adminPhone: '', giveAllPermissions: false });
    onClose();
  };

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-2xl mx-4 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">Create new company</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Company Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Company Details
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Company name*</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="ABC Constructions Pvt Ltd" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Registration number*</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Registration number" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">GST number*</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GST number" className={inputCls} />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Address*</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Site no. 24, Andheri East, Mumbai" className={inputCls} required />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email*</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@company.com" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Website</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="www.company.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Phone*</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 55849" className={inputCls} required />
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Admin Details
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Admin Name*</label>
                <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} placeholder="Rahul Sharma" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email*</label>
                <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="admin@company.com" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Phone*</label>
                <input type="tel" name="adminPhone" value={formData.adminPhone} onChange={handleChange} placeholder="+91 98765 55849" className={inputCls} required />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <label className="flex items-center gap-2 mb-6 cursor-pointer">
            <input type="checkbox" name="giveAllPermissions" checked={formData.giveAllPermissions} onChange={handleChange} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Give all permissions to admin</span>
          </label>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
