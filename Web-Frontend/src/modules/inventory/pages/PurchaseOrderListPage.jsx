// src/modules/inventory/pages/PurchaseOrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import GRNModal from '../components/GRNModal';
import { inventoryService } from '../services/inventory.service';
import { ListSkeleton } from '../../../shared/components/Skeletons';

const PurchaseOrderListPage = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal States
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPOs = async () => {
    setIsLoading(true);
    try {
      const res = await inventoryService.getAllPurchaseOrders();
      if (res.success && res.data) {
        setPurchaseOrders(res.data);
      }
    } catch (error) {
      console.error("Error fetching POs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchPOs(); 
  }, []);

  const filteredPOs = dateFilter 
    ? purchaseOrders.filter(po => po.expectedDelivery && po.expectedDelivery.startsWith(dateFilter)) 
    : purchaseOrders;

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
      case 'PENDING_APPROVAL':
      case 'REJECTED':
      case 'CANCELLED':
        return 'text-[#ff4d4f]'; // Red
      case 'ORDERED':
      case 'PARTIALLY_RECEIVED':
      case 'PARTIALLY_PAID':
        return 'text-[#0f62fe]'; // Blue
      case 'APPROVED':
      case 'RECEIVED':
      case 'PAID':
      case 'CLOSED':
        return 'text-[#00a887]'; // Green
      default: 
        return 'text-gray-500';
    }
  };

  const handleCreateGRN = (po, e) => {
    e.stopPropagation();
    setSelectedPO(po);
    setIsGRNModalOpen(true);
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
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h2>
          </div>
          
          <button 
            onClick={() => setIsPOModalOpen(true)} 
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#0f62fe] text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all"
          >
            Create PO
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6 mb-6 shrink-0">
          <div className="relative w-48">
            <input 
              type="date" 
              className="w-full pl-3 pr-10 py-2.5 border border-[#0f62fe] rounded-xl text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-100 bg-white dark:bg-gray-900" 
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
          ) : filteredPOs.length > 0 ? (
            <div className="space-y-4">
              {filteredPOs.map((po) => (
                <div key={po.id} onClick={() => navigate(`/admin/inventory/po/${po.id}`)} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl flex justify-between items-center hover:shadow-md hover:border-blue-100 transition-all bg-white dark:bg-gray-800 group cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-[#0f62fe] transition-colors">
                        {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'}) : 'No Date'}
                      </span>
                      <span className="text-xs text-gray-500 font-bold tracking-wider uppercase">{po.poNumber || po.id}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      {po.supplierName || po.supplier?.name || 'Unknown Supplier'}
                    </p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-3">
                    <span className={`text-sm font-bold ${getStatusColor(po.status)}`}>{po.status.replace(/_/g, ' ')}</span>
                    
                    {/* Only show Create GRN if it's Ordered or Partially Received */}
                    {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && (
                      <button onClick={(e) => handleCreateGRN(po, e)} className="px-5 py-2 bg-[#0f62fe] text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all active:scale-95 shadow-sm">
                        Create GRN
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 font-bold bg-gray-50 dark:bg-gray-900 rounded-2xl">
              No Purchase Orders found.
            </div>
          )}
        </div>
      </div>

      {/* Floating Mobile Create Button */}
      <button onClick={() => setIsPOModalOpen(true)} className="md:hidden fixed bottom-8 right-6 w-14 h-14 bg-[#0f62fe] text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
      </button>

      <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => setIsPOModalOpen(false)} onSuccess={fetchPOs} />
      <GRNModal isOpen={isGRNModalOpen} onClose={() => setIsGRNModalOpen(false)} poData={selectedPO} onSuccess={fetchPOs} />
      
    </PageContainer>
  );
};

export default PurchaseOrderListPage;