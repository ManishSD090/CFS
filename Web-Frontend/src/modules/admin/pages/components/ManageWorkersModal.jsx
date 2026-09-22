import { useState, useMemo } from 'react';

const mockPeoplePool = [
  { id: 1, name: 'Rahul Mehta', role: 'Project Manager', created: '12 FEB 2026', pay: 5600, phone: '+91 91234 56789', email: 'rahul.mehta@example.com', dob: 'July 14, 1995' },
  { id: 2, name: 'Ankit Verma', role: 'Site Engineer', created: '12 FEB 2026', pay: 5600, phone: '+91 98765 43210', email: 'ankit.verma@example.com', dob: 'March 5, 1993' },
  { id: 3, name: 'Priya Nair', role: 'Supervisor', created: '12 FEB 2026', pay: 5600, phone: '+91 87654 32109', email: 'priya.nair@example.com', dob: 'Aug 20, 1990' },
  { id: 4, name: 'Rakesh Sharma', role: 'Foreman', created: '12 FEB 2026', pay: 5600, phone: '+91 76543 21098', email: 'rakesh.sharma@example.com', dob: 'Feb 12, 1988' },
  { id: 5, name: 'Sanjay Gupta', role: 'Safety Officer', created: '15 FEB 2026', pay: 5600, phone: '+91 65432 10987', email: 'sanjay.gupta@example.com', dob: 'Dec 1, 1992' },
];

export default function ManageWorkersModal({ isOpen, onClose, mode, onPersonSelect, onOpenCreatePerson }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredList = useMemo(() => {
    return mockPeoplePool.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]); // deselect all if already all selected
    } else {
      setSelectedIds(filteredList.map(p => p.id));
    }
  };

  const handleAction = () => {
    if (selectMode) {
      alert("Modal Logic for placeholder 'Add to Project' disabled during edit, or taking specific bulk action.");
    } else {
      alert("Modal Logic for placeholder 'Add to Project'");
    }
  };

  const handleDelete = () => {
    alert(`Deleting ${selectedIds.length} users`);
    setSelectedIds([]);
    setSelectMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-lexend">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col border border-slate-100 dark:border-slate-700 animate-zoom-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {mode === 'workers' ? 'Workers' : 'Staff'} List / Payroll
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search / Actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search People" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field-input w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
            />
          </div>

          {!selectMode && (
            <button 
              onClick={onOpenCreatePerson}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create {mode === 'workers' ? 'Worker' : 'Staff'}</span>
            </button>
          )}

          <button 
            onClick={() => setSelectMode(!selectMode)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors flex-shrink-0 ${
              selectMode 
                ? 'bg-brand-50 border-brand-400 text-brand-600 dark:bg-brand-900/20 dark:border-brand-600 dark:text-brand-400' 
                : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500'
            }`}
            title="Select to delete"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </button>

          {selectMode && (
            <>
              <button 
                onClick={handleDelete}
                className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
              <button onClick={handleSelectAll} className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 whitespace-nowrap">
                Select all
              </button>
            </>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 min-h-[200px] custom-scrollbar">
          {filteredList.map((person) => (
            <div
              key={person.id}
              onClick={() => selectMode ? toggleSelect(person.id) : onPersonSelect(person)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedIds.includes(person.id) 
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 shadow-sm' 
                  : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              {selectMode && (
                <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                  selectedIds.includes(person.id) ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800'
                }`}>
                  {selectedIds.includes(person.id) && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{person.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">{person.role}</p>
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-600"></span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{person.created}</p>
                </div>
              </div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">₹{person.pay.toLocaleString()}</p>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm font-bold">No people found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
          <button 
            onClick={handleAction}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Add to Project
          </button>
        </div>
      </div>
    </div>
  );
}
