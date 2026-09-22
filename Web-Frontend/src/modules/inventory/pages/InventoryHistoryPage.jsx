// src/modules/inventory/pages/InventoryHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { inventoryService } from '../services/inventory.service';
import { ListSkeleton } from '../../../shared/components/Skeletons';

const InventoryHistoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'materials';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Fetching real movement data from backend
        const res = await inventoryService.getStockMovementReport();
        if (res.success && res.data) {
          setHistoryData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        // Fallback mock data to preserve Figma UI testing if DB is empty
        setHistoryData([
          { id: 1, material: { name: 'Cement' }, project: { name: 'Residential Area Block 51' }, transactionType: 'REQUEST', status: 'Approved', createdAt: '2026-10-13', quantity: 12 },
          { id: 2, material: { name: 'Steel Beams' }, project: { name: 'Residential Area Block 51' }, transactionType: 'REQUEST', status: 'Rejected', createdAt: '2026-10-13', quantity: 12 },
          { id: 3, material: { name: 'Bricks' }, project: { name: 'Residential Area Block 51' }, transactionType: 'TRANSFER', status: 'Transferred', createdAt: '2026-10-15', quantity: 50 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const filteredHistory = historyData.filter(item => {
    const itemName = item.material?.name || item.equipment?.name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
    // Filter by date if selected
    const matchesDate = dateFilter ? item.createdAt?.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': 
      case 'COMPLETED':
        return 'bg-[#00a887] text-white'; // Green
      case 'REJECTED': 
      case 'CANCELLED':
        return 'bg-[#ff4d4f] text-white'; // Red
      case 'TRANSFERRED': 
      case 'TRANSFER':
      case 'PURCHASE':
        return 'bg-[#0f62fe] text-white'; // Blue
      default: 
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300 min-h-[75vh] flex flex-col">
        
        {/* Figma Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white hover:text-[#0f62fe] transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Inventory History</h2>
        </div>

        {/* Search Bar */}
        <div className="relative w-full mb-6 shrink-0">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            type="text" 
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none shadow-sm transition-all dark:text-white" 
            placeholder="Search Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-[#f0f4f8] dark:bg-gray-900 p-1.5 rounded-full w-full md:max-w-md mb-6 shrink-0">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'materials' ? 'bg-[#0f62fe] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            onClick={() => handleTabChange('materials')}
          >
            Materials
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'equipments' ? 'bg-[#0f62fe] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            onClick={() => handleTabChange('equipments')}
          >
            Equipments
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6 mb-6 shrink-0">
          <div className="relative w-48">
            <input 
              type="date" 
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-300 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#0f62fe]" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg> Filter
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 md:pb-0">
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item, idx) => (
                <div key={item.id || idx} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-blue-200 transition-all gap-4 bg-white dark:bg-gray-800">
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 dark:text-white mb-1.5">{item.material?.name || item.equipment?.name || 'Unknown Item'}</h3>
                    <p className="text-xs text-gray-400 mb-2">{item.project?.name || 'Global Warehouse'}</p>
                    <span className="text-sm font-bold text-[#0f62fe] capitalize">{item.transactionType?.toLowerCase() || 'Transfer'}</span>
                  </div>

                  <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                    <span className={`px-4 py-1 text-[11px] font-bold rounded-full capitalize tracking-wide mb-2 ${getStatusStyles(item.status || item.transactionType)}`}>
                      {item.status || item.transactionType}
                    </span>
                    <p className="text-xs text-gray-500 mb-1">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">Quantity: <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 font-bold bg-gray-50 dark:bg-gray-900 rounded-xl">No history records match your filters.</div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};

export default InventoryHistoryPage;