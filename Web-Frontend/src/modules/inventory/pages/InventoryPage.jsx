// src/modules/inventory/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { inventoryService } from '../services/inventory.service';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValue: 0,
    materialCount: 0,
    equipmentCount: 0,
    lowStockCount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [globalRes, lowStockRes] = await Promise.all([
          inventoryService.getGlobalInventory(),
          inventoryService.getLowStockReport().catch(() => ({ data: [] })) // Safe fallback if report fails
        ]);

        if (globalRes.success) {
          setStats({
            totalValue: globalRes.data?.summary?.totalValue || 0,
            materialCount: globalRes.data?.summary?.materialCount || 0,
            equipmentCount: globalRes.data?.summary?.equipmentCount || 0,
            lowStockCount: lowStockRes.data?.length || 0
          });
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">Inventory Dashboard</h1>
            <p className="text-gray-500 font-medium text-sm">Overview of your global assets and materials</p>
          </div>
          <button onClick={() => navigate('/inventory/po')} className="hidden md:block px-6 py-3 bg-[#0f62fe] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all">
            Manage Purchase Orders
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Total Inventory Value</p>
            {isLoading ? <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-2/3"></div> : (
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">₹{stats.totalValue.toLocaleString()}</h3>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Total Materials</p>
            {isLoading ? <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-1/3"></div> : (
              <h3 className="text-3xl font-black text-[#0f62fe]">{stats.materialCount}</h3>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Total Equipment</p>
            {isLoading ? <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-1/3"></div> : (
              <h3 className="text-3xl font-black text-[#0f62fe]">{stats.equipmentCount}</h3>
            )}
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30">
            <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Low Stock Alerts</p>
            {isLoading ? <div className="h-8 bg-red-200 dark:bg-red-800 rounded animate-pulse w-1/3"></div> : (
              <h3 className="text-3xl font-black text-red-600">{stats.lowStockCount}</h3>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => navigate('/inventory/list?tab=materials')} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-[#0f62fe] transition-all group">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-[#0f62fe] mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Global List</h4>
            <p className="text-sm text-gray-500">View and manage all materials and equipment across the company.</p>
          </div>

          <div onClick={() => navigate('/inventory/requests')} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-[#0f62fe] transition-all group">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Material Requests</h4>
            <p className="text-sm text-gray-500">Approve site requests and fulfill them via stock transfers.</p>
          </div>

          <div onClick={() => navigate('/inventory/history')} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-[#0f62fe] transition-all group">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Transaction History</h4>
            <p className="text-sm text-gray-500">Track all movements, transfers, and adjustments globally.</p>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default InventoryPage;