export default function CompanyDetailModal({ isOpen, onClose, company, onSuspendClick, onEditClick }) {
  if (!isOpen || !company) return null;

  const total = company.totalProjects;
  const active = company.activeProjectCount;
  const inactive = company.inactiveProjects;
  const activePercent = (active / total) * 100;
  const circumference = 2 * Math.PI * 40;
  const activeStroke = (activePercent / 100) * circumference;
  const inactiveStroke = circumference - activeStroke;
  console.log(company)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-4xl mx-4 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {company.status === 'Active' ? (
              <span className="badge badge-active">Active</span>
            ) : (
              <span className="badge badge-suspended bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-semibold">Suspended</span>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{company.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{company.location} | {company.subId}</p>
              <p className="text-xs text-slate-400">Created on {company.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEditClick && onEditClick(company)} className="action-btn p-1.5 text-slate-400 hover:text-brand-600 rounded-lg transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left Column */}
          <div className="w-full md:w-64 p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
            {/* Donut Chart */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="8" fill="none"
                    strokeDasharray={`${activeStroke} ${inactiveStroke}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Total Projects: {total}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-500 dark:text-slate-400">Active Projects: {active}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="text-slate-500 dark:text-slate-400">Inactive Projects: {inactive}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{company.totalStaff}</p>
                <p className="text-xs text-slate-400">Total users</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{company.totalWorkers}</p>
                <p className="text-xs text-slate-400">Workers</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Company details</h3>
                <div className="space-y-2.5">
                  <Detail label="Registration Number" value={company.registrationNumber} />
                  <Detail label="GST Number" value={company.gst} />
                  <Detail label="Email" value={company.email} />
                  <Detail label="Website" value={company.website} isLink />
                  <Detail label="Phone" value={company.phone} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Admin details</h3>
                <div className="space-y-2.5">
                  <Detail label="Name" value={company.admin?.name} />
                  <Detail label="Role" value={company.admin?.role} />
                  <Detail label="Phone" value={company.admin?.phone} />
                  <Detail label="Email" value={company.admin?.email} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Company Location</h3>
                <div className="space-y-2.5">
                  <Detail label="Address" value={company.address} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Bank details</h3>
                <div className="space-y-2.5">
                  <Detail label="Bank Name" value={company.bank?.bankName} />
                  <Detail label="Account Number" value={company.bank?.accountNumber} />
                  <Detail label="IFSC Code" value={company.bank?.ifscCode} />
                  <Detail label="Branch" value={company.bank?.branch} />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => onSuspendClick(company)}
                className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm ${
                  company.status === 'Active'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {company.status === 'Active' ? 'Suspend company' : 'Activate company'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, isLink }) {
  return (
    <div>
      <span className="text-xs text-slate-400">{label}:</span>
      {isLink && value ? (
        <a href={`https://${value}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-brand-500 hover:underline">{value}</a>
      ) : (
        <p className="text-sm text-slate-700 dark:text-slate-200">{value || '—'}</p>
      )}
    </div>
  );
}
