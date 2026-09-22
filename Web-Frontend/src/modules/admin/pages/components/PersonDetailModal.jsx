export default function PersonDetailModal({ isOpen, onClose, person }) {
  if (!isOpen || !person) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 overflow-hidden animate-zoom-in">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{person.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">User ID: SYS-ADM-00{person.id}</p>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">ABC Infrastructure Pvt Ltd</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{person.role}</p>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <p className="text-slate-400">Name</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{person.name}</p>
            </div>
            <div>
              <p className="text-slate-400">Password</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">••••••••</p>
            </div>
            <div>
              <p className="text-slate-400">Mobile Number</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{person.phone || '+91 91234 56789'}</p>
            </div>
            <div>
              <p className="text-slate-400">Email Address</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 break-all text-xs">{person.email || 'not.set@example.com'}</p>
            </div>
            <div>
              <p className="text-slate-400">Account created</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{person.created || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Payroll</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">₹{person.pay ? person.pay.toLocaleString() : '0'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-slate-400 mb-1.5">Aadhar Card</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 w-fit">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs text-slate-600 dark:text-slate-300">aadhar.png</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
