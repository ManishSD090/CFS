// src/modules/inventory/pages/EquipmentDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';
import PageContainer from '../../../shared/components/PageContainer';
import EquipmentFormModal from '../components/EquipmentFormModal';
import TransferModal from '../components/TransferModal';
import { DetailSkeleton } from '../../../shared/components/Skeletons';

const EquipmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [equipment, setEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await inventoryService.getEquipmentById(id);
      if (response.success) setEquipment(response.data);
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

  if (!equipment) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Equipment Not Found</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment Details</h2>
          </div>
          
          <button onClick={() => setIsEditModalOpen(true)} className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                <span className={`px-3 py-1 text-[10px] font-black rounded uppercase tracking-wider ${equipment.ownershipType === 'OWNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{equipment.ownershipType}</span>
                <span className={`px-3 py-1 text-[10px] font-black rounded uppercase tracking-wider ${equipment.status === 'AVAILABLE' ? 'bg-blue-50 text-[#0f62fe]' : 'bg-orange-50 text-orange-600'}`}>{equipment.status || 'AVAILABLE'}</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{equipment.name}</h3>
              <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">{equipment.type || 'Heavy Machinery'}</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">Financial Info</h4>
              <div className="space-y-3 text-sm md:text-base">
                {equipment.ownershipType === 'OWNED' ? (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium">Purchase Cost</span><span className="font-bold text-gray-900 dark:text-white">₹{equipment.purchaseCost || 0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium">Purchase Date</span><span className="font-bold text-gray-900 dark:text-white">{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('en-GB') : 'N/A'}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium">Rental Rate</span><span className="font-bold text-gray-900 dark:text-white">₹{equipment.rentalRate || 0} / {equipment.rentalUnit || 'Day'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 font-medium">Provider</span><span className="font-bold text-gray-900 dark:text-white">{equipment.rentalProvider || 'N/A'}</span></div>
                  </>
                )}
                <div className="flex justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 font-medium">Location</span>
                  <span className="font-black text-[#0f62fe] uppercase tracking-wider text-xs px-3 py-1 bg-blue-50 rounded-full">{equipment.location === 'PROJECT' ? 'Assigned to Site' : 'Global Warehouse'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col justify-center bg-white dark:bg-gray-800">
            <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Operational Specs</h4>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Fuel Type</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{equipment.fuelType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Avg Consumption</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{equipment.fuelConsumption ? `${equipment.fuelConsumption} L/Hr` : 'N/A'}</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => setIsTransferModalOpen(true)} 
            className="flex-1 py-4 bg-[#0f62fe] text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            Assign / Transfer
          </button>
        </div>
      </div>

      {/* Render Modals */}
      <EquipmentFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={fetchDetails} 
        editId={equipment.id} 
      />
      
      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        itemData={equipment} 
        type="EQUIPMENT" 
        onSuccess={fetchDetails}
      />
      
    </PageContainer>
  );
};

export default EquipmentDetailsPage;