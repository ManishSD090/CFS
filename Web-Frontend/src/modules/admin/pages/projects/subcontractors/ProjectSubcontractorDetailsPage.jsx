import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../../../../shared/components/PageContainer';
import { getContractorProjectById, deleteContractorProject } from '../../../services/subcontractor.service';
import EditProjectSubcontractorModal from './components/EditProjectSubcontractorModal';

export default function ProjectSubcontractorDetailsPage() {
  const { id: projectId, contractorProjectId } = useParams();
  const navigate = useNavigate();
  
  const [contractData, setContractData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const res = await getContractorProjectById(contractorProjectId);
      setContractData(res);
    } catch (e) {
      alert('Failed to load contract details: ' + e.message);
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [contractorProjectId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove this subcontractor from the project?")) return;
    try {
      await deleteContractorProject(contractorProjectId);
      navigate(-1);
    } catch (e) {
      alert('Failed to remove: ' + e.message);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <svg className="animate-spin h-8 w-8 text-[#0f62fe]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
    </div>
  );

  if (!contractData) return null;

  const contractor = contractData.contractor || {};
  const totalAmount = Number(contractData.contractAmount || 0);
  const advance = Number(contractData.advanceAmount || 0);
  const retention = Number(contractData.retentionAmount || 0);

  // Date Formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <PageContainer>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-[85vh] font-sans pb-28">
        
        {/* Header */}
        <div className="bg-[#0f62fe] sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 shadow-md text-white">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 className="text-lg font-bold">Subcontractor Contract</h1>
              <p className="text-xs text-blue-100 font-medium">Project: {contractData.project?.name || 'Project'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Edit Contract"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
              title="Remove Subcontractor"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
          
          {/* Main Info */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{contractor.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {contractor.type?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0f62fe] uppercase tracking-wider">
                    Work: {contractData.workType}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    contractData.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    contractData.status === 'IN_PROGRESS' ? 'bg-blue-100 text-[#0f62fe]' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {contractData.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Contract Details</h3>
                <InfoRow label="Title" value={contractData.title || 'N/A'} />
                <InfoRow label="Start Date" value={formatDate(contractData.startDate)} />
                <InfoRow label="End Date" value={formatDate(contractData.endDate)} />
                <InfoRow label="Scope of Work" value={contractData.scopeOfWork} isTextarea />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Financials</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Contract Amount</span>
                    <span className="text-lg font-bold text-[#0f62fe]">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Advance Amount</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{advance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Retention Amount</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{retention.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <InfoRow label="Payment Terms" value={contractData.paymentTerms} isTextarea />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <EditProjectSubcontractorModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchDetails}
        contractData={contractData}
      />
    </PageContainer>
  );
}

function InfoRow({ label, value, isTextarea = false }) {
  return (
    <div className={`flex ${isTextarea ? 'flex-col' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} py-1 gap-1`}>
      <span className="text-sm text-gray-500 font-medium w-32 shrink-0">{label}</span>
      <span className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${isTextarea ? 'bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800' : 'flex-1 text-right sm:text-left'}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}
