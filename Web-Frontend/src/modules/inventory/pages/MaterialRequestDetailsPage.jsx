// src/modules/inventory/pages/MaterialRequestDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { inventoryService } from '../services/inventory.service';
import { DetailSkeleton } from '../../../shared/components/Skeletons';

const MaterialRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const res = await inventoryService.getMaterialRequestById(id);
      if (res.success) setRequest(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDetails(); 
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setIsProcessing(true);
    try {
      await inventoryService.updateMaterialRequestStatus(id, { status });
      fetchDetails(); // Refresh to see new status
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFulfillFromStock = async () => {
    if(!window.confirm("This will automatically create a Transfer from Global Inventory to the Project. Proceed?")) return;
    setIsProcessing(true);
    try {
      await inventoryService.fulfillRequestFromStock({ requestId: id });
      alert("Transfer Initiated Successfully!");
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fulfill from stock. Ensure Global Inventory has enough quantity.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <PageContainer><DetailSkeleton /></PageContainer>;
  }

  if (!request) {
    return <PageContainer><div className="text-center p-20 font-bold text-xl">Request Not Found</div></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white hover:text-[#0f62fe] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{request.materialName}</h3>
                <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">{request.requestNo}</p>
              </div>
              <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-wider ${
                request.status === 'REQUESTED' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                request.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {request.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quantity Requested</p>
                <p className="text-3xl font-black text-[#0f62fe]">{request.quantity} <span className="text-sm text-gray-500 font-bold">{request.unit || 'nos'}</span></p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Urgency Level</p>
                <p className={`text-2xl font-black ${request.urgency === 'CRITICAL' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{request.urgency}</p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm mb-4">Request Context</h4>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 font-medium">Target Project</span>
                <span className="font-bold text-gray-900 dark:text-white">{request.project?.name || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 font-medium">Requested By</span>
                <span className="font-bold text-gray-900 dark:text-white">{request.requestedBy?.name || 'N/A'}</span>
              </div>
              
              {request.expectedDelivery && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                  <span className="text-gray-500 font-medium">Expected By</span>
                  <span className="font-bold text-gray-900 dark:text-white">{new Date(request.expectedDelivery).toLocaleDateString('en-GB')}</span>
                </div>
              )}

              <div className="pt-4">
                <span className="block text-gray-500 font-medium mb-2">Purpose / Justification</span>
                <p className="text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-900 p-4 rounded-xl leading-relaxed">
                  {request.purpose || 'No purpose provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 h-fit flex flex-col gap-4">
            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm mb-2">Admin Actions</h4>
            
            {request.status === 'REQUESTED' ? (
              <>
                <button onClick={() => handleStatusUpdate('APPROVED')} disabled={isProcessing} className="w-full py-3.5 bg-[#00a887] text-white font-bold rounded-xl shadow-md hover:bg-teal-600 transition-all active:scale-95 disabled:opacity-50">
                  Approve Request
                </button>
                <button onClick={() => handleStatusUpdate('REJECTED')} disabled={isProcessing} className="w-full py-3.5 bg-white border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50">
                  Reject Request
                </button>
              </>
            ) : request.status === 'APPROVED' ? (
              <>
                <button onClick={handleFulfillFromStock} disabled={isProcessing} className="w-full py-3.5 bg-[#0f62fe] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                  Fulfill from Global Stock
                </button>
                <button onClick={() => navigate('/inventory/po/create')} disabled={isProcessing} className="w-full py-3.5 bg-white border-2 border-[#0f62fe] text-[#0f62fe] font-bold rounded-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50">
                  Create Purchase Order
                </button>
              </>
            ) : (
              <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 font-medium mb-1">Status</p>
                <p className="font-black text-gray-900 dark:text-white text-lg uppercase">{request.status}</p>
                <p className="text-xs text-gray-400 mt-2">No further admin actions required.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageContainer>
  );
};

export default MaterialRequestDetailsPage;