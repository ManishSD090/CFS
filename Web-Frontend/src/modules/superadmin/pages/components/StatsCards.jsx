import { useEffect, useState } from "react";
import { getSuperAdminStats } from "../../services/adminServices";
import { CardSkeleton } from "../../../../shared/components/Skeletons";

export default function StatsCards() {

   const [data, setStatsData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const statsData = await getSuperAdminStats();
        setStatsData(statsData.data);
      } catch (error) {
        console.error("Error fetching super admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <CardSkeleton count={4} gridClass="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4" />
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {/* Total Companies */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,.06),0_1px_2px_-1px_rgba(0,0,0,.04)] border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Companies</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{(Number(data?.activeCompanies)) + (Number(data?.suspendedCompanies))}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-slate-400">All time</p>
            <span className="stat-tag bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">▲ 8 this month</span>
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,.06),0_1px_2px_-1px_rgba(0,0,0,.04)] border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{data?.activeCompanies}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-slate-400">Paying & active</p>
            <span className="stat-tag bg-green-500 text-white">77.8%</span>
          </div>
        </div>
      </div>

      {/* Suspended */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,.06),0_1px_2px_-1px_rgba(0,0,0,.04)] border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Suspended</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{data?.suspendedCompanies}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-slate-400">Access blocked</p>
            <span className="stat-tag bg-red-50 dark:bg-red-900/30 text-red-500">Needs review</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,.06),0_1px_2px_-1px_rgba(0,0,0,.04)] border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Warning</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{data?.suspendedCompanies}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-slate-400">Inactivity</p>
            <span className="stat-tag bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">▲ 8 this month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
