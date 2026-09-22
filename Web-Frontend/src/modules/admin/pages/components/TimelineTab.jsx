import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useTimeline from "../../hooks/useTimeline";

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ─── Modal Portal Wrapper ───
const ModalPortal = ({ children }) => {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
      {children}
    </div>,
    document.body
  );
};

export default function TimelineTab({ projectId }) {
  const {
    timelines,
    currentTimeline,
    loading,
    error,
    create,
    update,
    refetch: fetchTimelines,
  } = useTimeline(projectId);

  // 📝 LOCAL STATE
  const [activeWeekIndex, setActiveWeekIndex] = useState(0); 
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  // ✅ Fallback: if no currentTimeline, pick first one or null
  const activeTimeline = currentTimeline || timelines?.[0] || null;

  // ─── Handlers ───
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTimeline && formData.id) {
        await update(formData.id, formData);
        setToastMessage("Timeline updated successfully!");
      } else {
        await create(formData);
        setToastMessage("Timeline created successfully!");
      }
      setShowSuccessToast(true);
      setShowCreateModal(false);
      setFormData({ name: "", startDate: "", endDate: "" });
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  const handleUpdateClick = () => {
    if (activeTimeline) {
      setFormData({
        id: activeTimeline.id,
        name: activeTimeline.name,
        startDate: activeTimeline.startDate,
        endDate: activeTimeline.endDate,
      });
      setShowEditConfirm(false);
      setShowCreateModal(true);
    }
  };

  const prevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(next => next + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const tlUpdateMonthLabels = () => {
    const prev = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const next = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
    return { prev: MONTHS[prev], next: MONTHS[next], current: MONTHS[currentMonthIndex] };
  };

  const labels = tlUpdateMonthLabels();

  if (loading) return <div className="p-16 text-center text-slate-500 animate-pulse">Loading project timeline...</div>;
  if (error) return <div className="p-16 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {/* ❌ EMPTY STATE */}
      {!activeTimeline && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-up">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center ring-4 ring-blue-50/50">
             <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
               <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
             </svg>
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 italic">Timeline Not Found!</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">No timeline has been created for this project yet. Create one to start tracking progress, tasks, and deadlines.</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ name: "", startDate: "", endDate: "" });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Timeline
          </button>
        </div>
      )}

      {/* ✅ ACTIVE TIMELINE VIEW */}
      {activeTimeline && (
        <div className="space-y-5 animate-fade-up">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                {activeTimeline.name}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <span className="text-slate-400">Start: <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{activeTimeline.startDate}</span></span>
                <span className="text-slate-400">Estimated End: <span className="text-slate-600 dark:text-slate-300 font-bold uppercase">{activeTimeline.endDate}</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 bg-white dark:bg-slate-800/50 p-1.5 px-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <StatItem label="Tasks" value={activeTimeline.weeks?.reduce((a,w)=>a+(w.tasks?.length||0), 0)} />
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-700"></div>
              <StatItem label="Elapsed" value="48" suffix="d" />
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-700"></div>
              <StatItem label="Total" value="365" suffix="d" />
              
              <button 
                onClick={() => setShowEditConfirm(true)}
                className="ml-2 p-2 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                title="Edit Timeline"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="group flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-slate-500 dark:text-slate-400 font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              <span className="text-xs uppercase">{labels.prev}</span>
            </button>
            
            <select 
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="appearance-none border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-4 py-2 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            <button 
              onClick={nextMonth}
              className="group flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-slate-500 dark:text-slate-400 font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <span className="text-xs uppercase">{labels.next}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">{labels.current} {currentYear}</span>
          </div>

          {/* Weeks Accordion */}
          <div className="space-y-3">
            {activeTimeline.weeks?.map((week, idx) => (
              <div key={idx} className="group rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-slate-800/40 hover:shadow-md transition-all duration-300">
                <button 
                  onClick={() => setActiveWeekIndex(activeWeekIndex === idx ? -1 : idx)}
                  className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${activeWeekIndex === idx ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-blue-600/20">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{week.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400">{week.tasks?.length || 0} Task{(week.tasks?.length !== 1) ? 's' : ''}</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeWeekIndex === idx ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeWeekIndex === idx ? 'max-h-[500px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-4">
                    {(!week.tasks || week.tasks.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No tasks assigned for this week.</p>
                    ) : (
                      week.tasks.map((task, tidx) => (
                        <div key={tidx} className="group/task relative pl-6 py-2 border-l-2 border-blue-100 dark:border-blue-900/30 hover:border-blue-500 transition-colors">
                          <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 group-hover/task:scale-125 transition-transform"></div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{task.name}</p>
                          {task.sub?.length > 0 && (
                            <div className="mt-1.5 space-y-1 ml-1">
                               {task.sub.map((s, si) => (
                                 <p key={si} className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                   <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                   {s}
                                 </p>
                               ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gantt Chart Section */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-slate-800/40">
             <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-700/20">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="5"/><rect x="3" y="13" width="18" height="5"/></svg>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Gantt Overview</span>
                  <span className="text-xs font-medium text-slate-400">— {labels.current} {currentYear}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-500"></span>Backlog</div>
                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>Ongoing</div>
                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500"></span>Done</div>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-xs">
                   <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700/30">
                        <th className="text-left font-bold text-slate-400 uppercase p-4 w-40">Tasks</th>
                        {MONTHS.slice(0, 6).map(m=>(
                          <th key={m} className="text-center font-bold text-slate-400 uppercase p-4">{m}</th>
                        ))}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                      {activeTimeline.gantt?.map((row, ridx) => (
                        <tr key={ridx} className="group hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="p-4 font-bold text-slate-700 dark:text-slate-200 truncate max-w-[160px]">{row.name}</td>
                          {[1,2,3,4,5,6].map(cIndex => {
                             const bar = row.bars?.find(b => b.col === cIndex);
                             if (bar) {
                               return (
                                 <td key={cIndex} className="p-2" colSpan={bar.span}>
                                    <div 
                                      style={{ backgroundColor: bar.color }}
                                      className="h-5 rounded-lg w-full flex items-center px-2 shadow-sm animate-fade-in"
                                    >
                                       {bar.color === '#ef4444' && <span className="text-[9px] font-bold text-white uppercase truncate">Urgent</span>}
                                    </div>
                                 </td>
                               );
                             }
                             // skip if covered by colspan
                             const prevOverlap = row.bars?.find(b => b.col < cIndex && (b.col + b.span) > cIndex);
                             if (prevOverlap) return null;
                             
                             return <td key={cIndex} className="p-2"><div className="h-5 w-full bg-transparent"></div></td>;
                          })}
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {/* ─── MODALS ─── */}
      {showCreateModal && (
        <ModalPortal>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-fade-up">
             <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 z-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {activeTimeline && formData.name === activeTimeline.name ? 'Edit Timeline' : 'Create New Timeline'}
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
             </div>
             <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Timeline Name</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
                          placeholder="E.g. Phase 1 Timeline" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                        <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-500 italic text-sm">
                           Active Tracking
                        </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                        <input 
                          required
                          type="date" 
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                        <input 
                          required
                          type="date" 
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
                        />
                      </div>
                   </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                   <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                   <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all">
                     {activeTimeline && formData.name === activeTimeline.name ? 'Save Changes' : 'Create Timeline'}
                   </button>
                </div>
             </form>
          </div>
        </ModalPortal>
      )}

      {/* Edit confirm modal */}
      {showEditConfirm && (
        <ModalPortal>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-slate-700 animate-zoom-in">
             <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-4 ring-8 ring-amber-50/50">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Timeline?</h3>
             <p className="text-sm text-slate-400 mt-2 leading-relaxed">Modify the project timeline details. This will update the tracking end dates for all associated tasks.</p>
             <div className="mt-6 flex flex-col gap-2">
                <button onClick={handleUpdateClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">Open Editor</button>
                <button onClick={() => setShowEditConfirm(false)} className="w-full bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 font-bold py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">Dismiss</button>
             </div>
          </div>
        </ModalPortal>
      )}

      {/* Success Success Toast (Simplified fallback) */}
      {showSuccessToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-up">
           <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
           </div>
           <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// ─── HELPER COMPONENTS ───
const StatItem = ({ label, value, suffix="" }) => (
  <div className="text-center group">
    <p className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">
      {value}<span className="text-[10px] text-slate-400 ml-0.5">{suffix}</span>
    </p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);