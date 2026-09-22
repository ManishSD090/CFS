import { useState, useEffect } from 'react';

export default function PayrollSettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('workers'); // 'workers' | 'staff'
  const [editMode, setEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset success state when modal is opened/closed
  useEffect(() => {
    if (!isOpen) setShowSuccess(false);
  }, [isOpen]);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500); // Wait 1.5 seconds and close
  };

  if (!isOpen) return null;

  const getTabClass = (tabName) => {
    return `px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      activeTab === tabName 
        ? 'bg-brand-600 text-white shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col border border-slate-100 dark:border-slate-700 animate-zoom-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <button onClick={onClose} className="text-slate-500 hover:text-brand-600 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex-1">Payroll Settings</h3>
          
          {activeTab === 'staff' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setEditMode(!editMode)} 
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                  editMode 
                    ? 'border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:border-brand-600 dark:text-brand-400' 
                    : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              {editMode && (
                <button className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <button onClick={() => { setActiveTab('workers'); setEditMode(false); }} className={getTabClass('workers')}>Workers</button>
            <button onClick={() => setActiveTab('staff')} className={getTabClass('staff')}>Staff</button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'workers' ? (
          <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-2 custom-scrollbar">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Labour Rate</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-600">₹</span>
                  <input type="number" defaultValue="600" className="field-input w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none" />
                </div>
                <span className="text-sm font-semibold text-brand-600 whitespace-nowrap">per Day</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available shifts</label>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="px-3 py-1.5 rounded-xl border-2 border-brand-400 text-brand-600 text-xs font-bold bg-white dark:bg-slate-700 cursor-default">1.0</div>
                <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold bg-white dark:bg-slate-700 cursor-default">0.75</div>
                <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold bg-white dark:bg-slate-700 cursor-default">0.5</div>
                <button className="flex items-center justify-center w-8 h-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">*1.0 is considered as Full Day</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pb-2 custom-scrollbar">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 pt-2">Role and Salary/Month</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input readOnly={!editMode} defaultValue="Site Engineer" className={`field-input flex-1 px-3 py-2 rounded-xl text-sm outline-none ${editMode ? 'border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200' : 'border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`} />
                <input readOnly={!editMode} defaultValue="₹21,600" className={`field-input w-28 px-3 py-2 rounded-xl text-sm outline-none ${editMode ? 'border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200' : 'border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`} />
              </div>
              <div className="flex gap-2">
                <input readOnly={!editMode} defaultValue="Project Manager" className={`field-input flex-1 px-3 py-2 rounded-xl text-sm outline-none ${editMode ? 'border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200' : 'border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`} />
                <input readOnly={!editMode} defaultValue="₹45,000" className={`field-input w-28 px-3 py-2 rounded-xl text-sm outline-none ${editMode ? 'border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200' : 'border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`} />
              </div>
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <select className="field-input flex-1 px-3 py-2 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none">
                    <option value=""></option>
                    <option>Site Engineer</option>
                    <option>Project Manager</option>
                    <option>Supervisor</option>
                  </select>
                  <input type="text" placeholder="Salary" className="field-input w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm outline-none" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex-shrink-0 space-y-2">
          <button onClick={handleSave} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend pointer-events-auto">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-64 border border-slate-100 dark:border-slate-700 animate-zoom-in p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Changes Saved!</p>
          </div>
        </div>
      )}
    </div>
  );
}
