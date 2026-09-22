// src/modules/inventory/pages/MaterialRequestListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { inventoryService } from '../services/inventory.service';
import { ListSkeleton } from '../../../shared/components/Skeletons';

const MaterialRequestListPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await inventoryService.getAllMaterialRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error("Error fetching Material Requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchRequests(); 
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.requestNo?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.materialName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'ORDERED': return 'bg-blue-50 text-[#0f62fe] border border-blue-200';
      case 'DELIVERED': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border border-red-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300 min-h-[75vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white hover:text-[#0f62fe] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Material Requests</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 shrink-0">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none dark:text-white transition-all font-medium" 
              placeholder="Search by ID or Material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {['All', 'REQUESTED', 'APPROVED', 'ORDERED', 'DELIVERED', 'REJECTED'].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-[#0f62fe] text-white shadow-md' : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-100 dark:border-gray-600'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 md:pb-0">
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div 
                  key={req.id} 
                  onClick={() => navigate(`/inventory/requests/${req.id}`)}
                  className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md hover:border-blue-100 transition-all bg-white dark:bg-gray-800 cursor-pointer group"
                >
                  <div className="space-y-2 mb-4 md:mb-0">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-[#0f62fe] transition-colors">{req.materialName || 'Unknown Material'}</span>
                      <span className="text-xs text-gray-500 font-bold tracking-wider">{req.requestNo}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Project: <span className="text-gray-900 dark:text-white">{req.project?.name || 'N/A'}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <span className={`px-4 py-1.5 text-[11px] font-black rounded-full uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Qty: <span className="font-bold text-gray-900 dark:text-white text-base">{req.quantity} {req.unit || 'nos'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 font-bold bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              No material requests found.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default MaterialRequestListPage;