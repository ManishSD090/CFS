import React, { useState, useEffect } from 'react';
import { getSuperAdminStats, fetchCompanies } from '../services/adminServices';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, companiesRes] = await Promise.all([
          getSuperAdminStats(),
          fetchCompanies()
        ]);

        if (statsRes?.data) {
          setStats(statsRes.data);
        }

        if (companiesRes?.success && companiesRes?.data?.companies) {
          setCompanies(companiesRes.data.companies);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Derive stats
  const activeCount = stats?.activeCompanies ?? 0;
  const suspendedCount = stats?.suspendedCompanies ?? 0;

  // Derive total users from companies (sum of all user counts)
  const totalUsers = companies.reduce((sum, c) => {
    const count = c._count?.users ?? c.employeeCount ?? c.adminCount ?? 0;
    return sum + Number(count);
  }, 0);

  // New companies this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const companiesThisMonth = companies.filter(c => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Compute percentage of active companies change (compared to suspended)
  const totalCompanies = activeCount + suspendedCount;
  const activePct = totalCompanies > 0 ? Math.round((activeCount / totalCompanies) * 100) : 0;

  // Build recent activities from companies (sorted by createdAt descending)
  const recentActivities = [...companies]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 6)
    .map(c => {
      const isActive = c.isActive;
      const createdAt = new Date(c.createdAt);
      const timeDiff = getTimeAgo(createdAt);

      // Determine activity type
      let activityType = 'created';
      let activityText = 'New company created';
      let iconBg = 'bg-green-100 dark:bg-green-900/30';
      let iconColor = 'text-green-600 dark:text-green-400';
      let iconSvg = (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        </svg>
      );

      if (!isActive) {
        activityType = 'suspended';
        activityText = 'Company suspended';
        iconBg = 'bg-red-100 dark:bg-red-900/30';
        iconColor = 'text-red-600 dark:text-red-400';
        iconSvg = (
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="9"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/>
          </svg>
        );
      }

      return {
        id: c.id,
        company: c.name,
        activityText,
        iconBg,
        iconColor,
        iconSvg,
        time: timeDiff,
      };
    });

  if (loading) {
    return (
      <div className="font-lexend flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-lexend flex items-center justify-center py-20">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-lexend space-y-7 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-500">
              <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V8l8-5 8 5v13M9 21v-4h6v4"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Companies</span>
          </div>
          <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{activeCount.toLocaleString()}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-400">All regions</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {activePct}% active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 text-red-500">
              <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
                <circle cx="12" cy="12" r="9"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Suspended</span>
          </div>
          <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{suspendedCount.toLocaleString()}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-400">Pending review</span>
            {suspendedCount > 0 ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Attention</span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">All clear</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-500">
              <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</span>
          </div>
          <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{totalUsers.toLocaleString()}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-400">All companies</span>
            {companiesThisMonth > 0 ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                ▲ {companiesThisMonth} new this month
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                No new this month
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">Recent Activities</h2>
        
        <div className="grid grid-cols-[1fr_1.4fr_100px] gap-3 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Company</span>
          <span>Activity</span>
          <span>Time</span>
        </div>

        <div className="space-y-1">
          {recentActivities.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No recent activities found.</div>
          ) : (
            recentActivities.map((act, idx) => (
              <div key={act.id || idx} className="grid grid-cols-[1fr_1.4fr_100px] gap-3 py-3 items-center border-b border-slate-50 dark:border-slate-700/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/20 rounded-lg transition-colors px-2 -mx-2">
                <span className={`text-sm ${idx === 0 ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                  {act.company}
                </span>
                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <div className={`w-6 h-6 rounded-md ${act.iconBg} flex items-center justify-center flex-shrink-0 ${act.iconColor}`}>
                    {act.iconSvg}
                  </div>
                  {act.activityText}
                </div>
                <span className="text-sm text-slate-400">{act.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}