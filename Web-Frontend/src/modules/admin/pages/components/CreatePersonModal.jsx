export default function CreatePersonModal({ isOpen, onClose, mode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 animate-zoom-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="text-slate-500 hover:text-brand-600 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex-1">
            Create {mode === 'workers' ? 'Worker' : 'Staff'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name</label>
            <select className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
              <option value="">Select</option>
              <option>Ramesh Kumar</option>
              <option>Suresh Patil</option>
              <option>Mahesh Yadav</option>
              <option>Dinesh Singh</option>
              <option>Ankit Verma</option>
              <option>Rahul Sharma</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Role Name</label>
            <select className="field-input w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
              <option value="">Select</option>
              <option>Site Engineer</option>
              <option>Project Manager</option>
              <option>Supervisor</option>
              <option>Labour</option>
              <option>Mason</option>
              <option>Carpenter</option>
              <option>Helper</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {mode === 'workers' ? 'Aadhar Card' : 'Receipt'}
            </label>
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-sm text-brand-600 font-medium">Select file</span>
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
            </label>
            <p className="text-xs text-slate-400">Upload a .jpg, .jpeg, .png, .pdf, no larger than 50 MB</p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
