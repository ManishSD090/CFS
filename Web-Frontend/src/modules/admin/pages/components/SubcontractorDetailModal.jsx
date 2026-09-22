import React from 'react';
import { createPortal } from 'react-dom';

export default function SubcontractorDetailModal({ isOpen, onClose, contractor, onEditClick }) {
  if (!isOpen || !contractor) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[3px] animate-fade-in font-lexend pointer-events-auto">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-700 fade-up overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{contractor.name}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onEditClick} className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Sub-contractor Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Sub-contractor Info</h4>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
              <div><span className="text-slate-400">Name: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.name}</span></div>
              <div><span className="text-slate-400">Work Type: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.workType}</span></div>
              <div><span className="text-slate-400">Phone: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.phone || 'N/A'}</span></div>
              <div><span className="text-slate-400">Email: </span><span className="font-semibold text-slate-700 dark:text-slate-200 break-all">{contractor.email || 'N/A'}</span></div>
              <div><span className="text-slate-400">Start Date: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.start || 'N/A'}</span></div>
              <div><span className="text-slate-400">Estimated End Date: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.end || 'N/A'}</span></div>
              <div className="sm:col-span-2"><span className="text-slate-400">Assigned Project: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.project || 'N/A'}</span></div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Budget</h4>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2.5">
              <p className="text-xs"><span className="text-slate-400">Total Contract: </span><span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.contract ? `₹${contractor.contract}` : 'N/A'}</span></p>
              {/* Budget progress bar */}
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: contractor.budget && contractor.contract ? `${(contractor.budget / contractor.contract) * 100}%` : '0%' }}></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Used: <span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.budget ? `₹${contractor.budget}` : '0'}</span></span>
                <span className="text-slate-500 dark:text-slate-400">Remaining: <span className="font-semibold text-slate-700 dark:text-slate-200">{contractor.contract && contractor.budget ? `₹${contractor.contract - contractor.budget}` : '0'}</span></span>
              </div>
            </div>
          </div>

          {/* Workforce */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Workforce</h4>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex flex-wrap items-center gap-4">
              <p className="text-xs">Total Workers: <span className="font-bold text-brand-600 dark:text-brand-400">{contractor.totalWorkers || '15'}</span></p>
              <p className="text-xs">Active Today: <span className="font-bold text-brand-600 dark:text-brand-400">{contractor.activeWorkers || '12'}</span></p>
              <button className="ml-auto flex-shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                Mark Attendance
              </button>
            </div>
          </div>

          {/* Blacklist */}
          <button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors mt-1">
            Blacklist
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
