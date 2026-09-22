export default function SuspendCompanyModal({ isOpen, onClose, company, onConfirm }) {
  if (!isOpen || !company) return null;

  const isActive = company.status === 'Active';

  const handleConfirm = () => {
    // We pass empty reason since the backend no longer requires it
    onConfirm(company, '');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-sm mx-4 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Confirm Action 
            <span className="text-xl">{isActive ? '⚠️' : '✅'}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-base text-slate-700 dark:text-slate-200 mb-6 text-center">
            Are you sure you want to {isActive ? 'suspend' : 'activate'} <span className="font-semibold">{company.name}</span>?
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm ${
                isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Yes, {isActive ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
