// src/modules/inventory/pages/MaterialDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';
import PageContainer from '../../../shared/components/PageContainer';
import MaterialFormModal from '../components/MaterialFormModal';
import TransferModal from '../components/TransferModal';
import MaterialRequestModal from '../components/MaterialRequestModal';
import { DetailSkeleton } from '../../../shared/components/Skeletons';

const MaterialDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await inventoryService.getMaterialById(id);
      if (response.success) setMaterial(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDetails(); 
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    );
  }

  if (!material) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Material Not Found</h2>
          <button onClick={() => navigate(-1)} className="text-[#0f62fe] hover:underline font-bold">Go Back</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
        
        {/* Header Area */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white hover:text-[#0f62fe] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Material Details</h2>
          </div>
          
          <button onClick={() => setIsEditModalOpen(true)} className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{material.name}</h3>
              <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">{material.materialCode || material.hsnCode || 'NO CODE'}</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">Inventory Info</h4>
              <div className="space-y-3 text-sm md:text-base">
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Category</span><span className="font-bold text-gray-900 dark:text-white">{material.category || 'General'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Cost per unit</span><span className="font-bold text-gray-900 dark:text-white">₹{material.unitPrice || 0} / {material.unit || 'Unit'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Remaining</span><span className="font-black text-[#0f62fe]">{material.stockQuantity || 0} {material.unit || 'Unit'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Threshold</span><span className="font-bold text-red-500">{material.minimumStock || 0} {material.unit || 'Unit'}</span></div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col justify-center bg-white dark:bg-gray-800">
            <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Vendor Info</h4>
            <div className="space-y-4">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{material.supplier || 'N/A'}</p>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> 
                {material.supplierEmail || 'supplier@email.com'}
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> 
                +91 {material.supplierContact || '0000000000'}
              </div>
            </div>
          </div>
          
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => setIsRequestModalOpen(true)} 
            className="flex-1 py-4 bg-[#00a887] text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-teal-600 transition-all active:scale-95"
          >
            Request
          </button>
          <button 
            onClick={() => setIsTransferModalOpen(true)} 
            className="flex-1 py-4 bg-[#0f62fe] text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            Transfer
          </button>
        </div>
      </div>

      {/* Render the 3 Connected Modals */}
      <MaterialFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={fetchDetails} 
        editId={material.id} 
      />
      
      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        itemData={material} 
        type="MATERIAL" 
      />

      <MaterialRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        material={material} 
      />
      
    </PageContainer>
  );
};

export default MaterialDetailsPage;