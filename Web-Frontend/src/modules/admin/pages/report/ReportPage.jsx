import React, { useState, useEffect, useCallback } from "react";
import { reportService } from "../../services/report.service";
import {
  ProgressChart, AttendanceChart, ExpenseChart,
  BudgetDonut, TaskDonut, WorkforceDonut
} from "./components/ReportCharts";

const statusStyle = {
  Ongoing:   { bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-600 dark:text-green-400'   },
  Completed: { bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600 dark:text-blue-400'     },
  'On Hold': { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-500 dark:text-amber-400'   },
};
const priorityColor = { High: 'text-red-500', Medium: 'text-amber-500', Low: 'text-green-600' };
const dprColors = { Approved: 'bg-green-500 text-white', Submitted: 'bg-blue-600 text-white', Pending: 'bg-amber-400 text-white' };
const msStyle = { Done: 'bg-green-100 dark:bg-green-900/30 text-green-600', Active: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', Upcoming: 'bg-slate-100 dark:bg-slate-700 text-slate-500' };

export default function ReportPage() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reportService.getProjects().then(setProjects);
  }, []);

  const loadProject = useCallback(async (id) => {
    setSelectedId(id);
    if (!id) { setProject(null); return; }
    setLoading(true);
    const p = await reportService.getProjectById(id);
    setProject(p);
    setLoading(false);
  }, []);

  const handleExportPDF = () => {
    setTimeout(() => window.print(), 400);
  };

  const r = project?.rptData;
  const ss = project ? (statusStyle[project.status] || statusStyle.Ongoing) : null;

  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }} className="flex-1 p-4 md:p-6 space-y-4 fade-up">
      <style>
        {`
          @media print {
            aside, header { display: none !important; }
            body, html, #root { height: auto !important; overflow: visible !important; background: white !important; }
            .h-screen { height: auto !important; }
            .overflow-hidden, .overflow-y-auto { overflow: visible !important; }
            main { padding: 0 !important; }
            .no-print { display: none !important; }
            /* Make panels printer friendly */
            .shadow-sm { box-shadow: none !important; border-color: #f1f5f9 !important; }
            .fade-up { animation: none !important; transform: none !important; opacity: 1 !important; }
          }
        `}
      </style>

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3 no-print">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Select Project
        </span>
        <select
          value={selectedId}
          onChange={e => loadProject(e.target.value)}
          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Select a project…</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.idCode})</option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button onClick={() => loadProject(selectedId)} className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {!project && !loading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">Select a project to view its report</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">Choose a project from the dropdown above to generate a complete analysis report</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 flex items-center justify-center min-h-[60vh]">
          <p className="text-sm font-bold text-slate-400">Loading report…</p>
        </div>
      )}

      {/* ── Report Content ── */}
      {project && !loading && (
        <div className="space-y-4">

          {/* Row 1: Project Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{project.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{project.location} | {project.idCode} · {project.client}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${ss?.bg} ${ss?.text}`}>{project.status}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Priority: <span className={`font-bold ${priorityColor[project.priority]}`}>{project.priority}</span></span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Start: {project.start} → End: {project.end}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[{v: project.budget, l: 'Budget Used'}, {v: project.daysLeft || '—', l: 'Days Left'}, {v: project.tasks, l: 'Tasks Done'}].map((item, i) => (
                <div key={i} className="rpt-kpi-card bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.v}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{project.progress}% complete</p>
            </div>
          </div>

          {/* Row 2: KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'DPRs Submitted', val: r.dprs, sub: `${Math.ceil(r.dprs / 7)} this week`, cls: 'text-brand-600 dark:text-brand-400' },
              { label: 'WPRs Submitted', val: r.wprs, sub: `Covering ${r.wprs} weeks`, cls: '' },
              { label: 'Avg Daily Attendance', val: `${r.attPct}%`, sub: `${Math.round(r.workersCount * 0.75)}/${r.workersCount} workers`, cls: '' },
              { label: 'Total Payroll Spent', val: r.payrollTotal, sub: 'This month', cls: 'text-brand-600 dark:text-brand-400' }
            ].map((k, i) => (
              <div key={i} className="rpt-kpi-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
                <p className="text-xs text-slate-400 font-semibold">{k.label}</p>
                <p className={`text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 ${k.cls}`}>{k.val}</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Row 3: Progress Chart + Budget Utilisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Project Progress Over Time</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Weekly % completed</p>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Last 8 weeks</span>
              </div>
              <ProgressChart bars={r.progressBars} labels={r.weekLabels} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Budget Utilisation</h4>
                <span className="text-xs text-slate-400 font-semibold">{r.budgetUsedPct}% total approved</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <BudgetDonut usedPct={r.budgetUsedPct} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100">{r.budgetUsedPct}%</span>
                    <span className="text-xs text-slate-400">Used</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {r.budgetItems.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.amt}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-600 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, background: item.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Attendance + Workforce */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Attendance Overview</h4>
                <span className="text-xs text-slate-400 font-semibold">This week</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Workers & Staff daily average</p>
              <AttendanceChart />
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-blue-600"></span>Workers avg {Math.round(r.workersCount * 0.75)}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-green-500"></span>Staff avg {Math.round(r.staffCount * 0.3)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Workforce</h4>
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <WorkforceDonut labours={r.workersCount} staff={r.staffCount} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100">{r.workersCount + r.staffCount}</span>
                    <span className="text-xs text-slate-400">Total</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-8"><span className="text-slate-500">Labours</span><span className="font-bold text-brand-600">{r.workersCount}</span></div>
                  <div className="flex justify-between gap-8"><span className="text-slate-500">Staff</span><span className="font-bold text-brand-600">{r.staffCount}</span></div>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Payroll Summary</p>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Labours</span><span className="font-bold text-brand-600">{r.payrollL}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Staff</span><span className="font-bold text-brand-600">{r.payrollS}</span></div>
                <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-700 pt-1.5 mt-1">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Overall Payroll</span>
                  <span className="font-bold text-brand-600">{r.payrollTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: DPR + WPR + Task Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">DPR Submissions</h4>
                <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View all</button>
              </div>
              <p className="text-xs text-slate-400 mb-4">{r.dprs} total · {r.dprList.filter(d => d.st === 'Pending').length} pending approval</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {r.dprList.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                    <div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.date}</p><p className="text-xs text-slate-400">By {d.by}</p></div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${dprColors[d.st] || dprColors.Pending}`}>{d.st}</span>
                      <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">WPR Submissions</h4>
                  <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View all</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {r.wprList.map((w, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                      <div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{w.label}</p><p className="text-xs text-slate-400">{w.by}</p></div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${dprColors[w.st] || dprColors.Pending}`}>{w.st}</span>
                        <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Task Status</h4>
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <TaskDonut done={r.taskDone} inProg={r.taskInProg} pend={r.taskPend} total={r.taskTotal || 1} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.taskTotal}</span>
                      <span className="text-xs text-slate-400">Total</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[{color:'#22c55e',label:'Completed',val:r.taskDone},{color:'#f59e0b',label:'In Progress',val:r.taskInProg},{color:'#ef4444',label:'Pending',val:r.taskPend}].map((x, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:x.color}}></span>
                        <span className="text-slate-500">{x.label}</span>
                        <span className="ml-auto font-bold text-slate-700 dark:text-slate-200">{x.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 6: Milestones + Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Milestones</h4>
              <div className="space-y-3">
                {r.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:m.color}}></span>
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${msStyle[m.status] || msStyle.Upcoming}`}>{m.status}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0 w-24 text-right">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Issues & Delays</h4>
                <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2.5 py-0.5 rounded-full">
                  {r.issues.filter(x => x.open).length} Open
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Reported across DPRs</p>
              <div className="space-y-2.5">
                {r.issues.map((iss, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{background: iss.open ? '#ef4444' : '#22c55e'}}></span>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{iss.t}</p>
                      <p className="text-xs text-slate-400">{iss.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 7: Material Usage + Equipment Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Material Usage</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      {['Material','Used','Remaining','Status'].map(h => (
                        <th key={h} className="text-left text-slate-400 font-semibold uppercase tracking-wider pb-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {r.materials.map((m, i) => (
                      <tr key={i}>
                        <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">{m.mat}</td>
                        <td className="py-2.5 font-bold text-brand-600 dark:text-brand-400">{m.used}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{m.rem}</td>
                        <td className="py-2.5"><span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${m.sc}`}>{m.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Equipment Log</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      {['Equipment','Hrs Used','Fuel (L)','Status'].map(h => (
                        <th key={h} className="text-left text-slate-400 font-semibold uppercase tracking-wider pb-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {r.equipment.map((e, i) => (
                      <tr key={i}>
                        <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">{e.eq}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{e.hrs}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{e.fuel}</td>
                        <td className="py-2.5"><span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${e.sc}`}>{e.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Row 8: Sub-contractors */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Sub-contractors Summary</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    {['Name','Work Type','Workers','Weeks Active','Total Paid','Status'].map(h => (
                      <th key={h} className="text-left text-slate-400 font-semibold uppercase tracking-wider pb-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {r.subcontractors.map((sc, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-200">{sc.name}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{sc.work}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{sc.workers}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{sc.weeks} weeks</td>
                      <td className="py-2.5 font-bold text-brand-600 dark:text-brand-400">{sc.paid}</td>
                      <td className="py-2.5"><span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${sc.sc}`}>{sc.st}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 9: Transaction Summary + Monthly Expense Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Transaction Summary</h4>
                <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">View all</button>
              </div>
              <p className="text-xs text-slate-400 mb-4">Total approved: {r.txnApproved}</p>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Total Expenses', val: r.txnExpenses, cls: 'text-brand-600' },
                  { label: 'Available Balance', val: r.txnBalance, cls: 'text-green-600' },
                  { label: 'Funds Released', val: r.txnReleased, cls: 'text-slate-700 dark:text-slate-200' }
                ].map((x, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{x.label}</span>
                    <span className={`font-bold ${x.cls}`}>{x.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${r.txnPct}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{r.txnPct}% of approved budget spent</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Monthly Expense Trend</h4>
              <ExpenseChart trend={r.expenseTrend} months={r.expenseMonths} />
            </div>
          </div>

          {/* Completed Banner */}
          {project.status === 'Completed' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">Project Completed Successfully</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    Completed on {project.end} · All {project.tasks.split('/')[0]} tasks done · Budget fully utilized
                  </p>
                </div>
                <button onClick={handleExportPDF} className="ml-auto flex-shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm no-print">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Full Report
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
