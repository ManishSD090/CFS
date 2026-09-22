import { useState, useEffect } from 'react';

export default function EditCompanyModal({ isOpen, onClose, company, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    gstNumber: '',
    officeAddress: '',
    email: '',
    website: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && company) {
      setFormData({
        name: company.name || '',
        registrationNumber: company.registrationNumber || company.subId || '',
        gstNumber: company.gst || '',
        officeAddress: company.address || company.location || '',
        email: company.email || '',
        website: company.website || '',
        phone: company.phone || '',
      });
      setError('');
    }
  }, [isOpen, company]);

  if (!isOpen || !company) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(company.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update company.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-2xl mx-4 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Company</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Company name*</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Company name" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Registration number</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Registration number" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">GST number</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GST number" className={inputCls} />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Office Address</label>
              <input type="text" name="officeAddress" value={formData.officeAddress} onChange={handleChange} placeholder="Office address" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@email.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Website</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="www.company.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 55849" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
                </svg>
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
