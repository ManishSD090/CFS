import React, { useState } from "react";
import { inspectionService } from "../../../services/inspection.service";

export default function InspectionDetailsModal({ isOpen, onClose, data, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !data) return null;

  const handleAction = async (status) => {
    try {
      setIsSubmitting(true);
      await inspectionService.updateInspectionStatus(data.id, status);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmt = (v) => '₹ ' + Number(v).toLocaleString('en-IN');

  const tStyle = {
    Completed: 'bg-green-500',
    'In Progress': 'bg-amber-400',
    Pending: 'bg-red-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-wrap bg-black/40 fade-up" style={{ fontFamily: "'Lexend', sans-serif" }}>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-100 dark:border-slate-700" style={{ height: '90vh' }}>
        
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-none">DPR Details</h2>
            <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5 uppercase truncate">{data.location}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          {/* Project + visitor + weather */}
          <div>
            <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mb-0.5">{data.project}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Site Visitor: {data.visitor}</p>
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
                <span>{data.weather}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.desc}</p>
          </div>

          {/* Progress */}
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Progress</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${data.progress}%` }}></div>
                <div className="h-full bg-brand-200 dark:bg-brand-900/50 flex-1"></div>
              </div>
              <div className="text-xs font-bold space-y-1 flex-shrink-0">
                <p className="text-slate-500 dark:text-slate-400">Today Progress Added: +{data.todayProgress}%</p>
                <p className="text-slate-500 dark:text-slate-400">Current Overall Progress: {data.progress}%</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Tasks</p>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Subtasks</span>
            </div>
            <div>
              {data.tasks?.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.name} <span className="text-brand-500">{t.done}/{t.total}</span></span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg text-white ${tStyle[t.st] || 'bg-slate-400'}`}>{t.st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Attendance</p>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-md">{data.att?.label} Present</span>
            </div>
            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Workers</span><span className="text-brand-600 dark:text-brand-400">{data.att?.workers}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Staff</span><span className="text-brand-600 dark:text-brand-400">{data.att?.staff}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Sub-contractor</span><span className="text-brand-600 dark:text-brand-400">{data.att?.sub}</span></div>
            </div>
          </div>

          {/* Materials */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Materials</p>
            <div>
              {data.mats?.map((mt, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{mt.name}</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{mt.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipments */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Equipments</p>
            <div>
              {data.equip?.map((eq, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{eq.name}</span>
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Hrs Used</span>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Fuel</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          {data.budget && (
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Budget</p>
            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-wide">Labour</span><span className="text-brand-600 dark:text-brand-400">{fmt(data.budget.labour)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-wide">Material</span><span className="text-brand-600 dark:text-brand-400">{fmt(data.budget.material)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-wide">Equipment</span><span className="text-brand-600 dark:text-brand-400">{fmt(data.budget.equipment)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-wide">Sub-contractor</span><span className="text-brand-600 dark:text-brand-400">{fmt(data.budget.sub)}</span></div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2.5 mt-1">
                <span className="text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">Total</span>
                <span className="text-slate-800 dark:text-slate-100 text-sm">{fmt(data.budget.total)}</span>
              </div>
            </div>
          </div>
          )}

          {/* Photos */}
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Photos</p>
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map((n) => (
                <div key={n} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Documents</p>
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map((n) => (
                <div key={n} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Issues</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[32px]">{data.issues || '—'}</p>
          </div>

          {/* Tasks list */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Tasks</p>
            <div className="space-y-1">
              {data.tasks2?.map((t, i) => (
                <p key={i} className="text-sm text-slate-600 dark:text-slate-300">{t}</p>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Notes</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[32px]">{data.notes || '—'}</p>
          </div>

          {/* Remarks textarea */}
          {data.status === 'Pending' && (
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">Remarks</p>
            <textarea placeholder="Enter remarks..." rows="3"
              className="field-input w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 resize-none placeholder-slate-300 dark:placeholder-slate-500 focus:border-brand-400"></textarea>
          </div>
          )}

        </div>

        {/* Footer: Approve / Reject */}
        {data.status === 'Pending' && (
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-3 flex-shrink-0">
          <button 
            disabled={isSubmitting}
            onClick={() => handleAction('Approved')}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: '#00b894' }}>
            Approve
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => handleAction('Rejected')}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: '#ff4757' }}>
            Reject
          </button>
        </div>
        )}

      </div>
    </div>
  );
}
