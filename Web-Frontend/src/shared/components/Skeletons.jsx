import React from 'react';

export const CardSkeleton = ({ count = 3, gridClass = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" }) => (
  <div className={gridClass}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
        </div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,.06),0_1px_2px_-1px_rgba(0,0,0,.04)]">
    <div className="flex justify-between items-center px-4 md:px-5 py-4 border-b border-slate-100 dark:border-slate-700">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-32"></div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              {Array.from({ length: columns }).map((_, cj) => (
                <td key={cj} className="px-5 py-3.5">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-1"></div>
                  {cj === 0 && <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/2"></div>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="animate-pulse p-4 md:p-6 space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      <div>
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 h-64"></div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 h-48"></div>
      </div>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 h-40"></div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 h-40"></div>
      </div>
    </div>
  </div>
);

export const GeneralSkeleton = ({ heightClass = "h-40" }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl ${heightClass} w-full`}></div>
);

export const ListSkeleton = ({ rows = 4 }) => (
  <div className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 w-full">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex justify-between items-center p-4">
        <div className="space-y-2 w-1/2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
      </div>
    ))}
  </div>
);
