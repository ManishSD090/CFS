import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../../../shared/components/PageContainer';
import { getSubcontractorById } from '../../services/subcontractor.service';
import SubcontractorFormModal from './components/SubcontractorFormModal';

export default function SubcontractorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subcontractor, setSubcontractor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const res = await getSubcontractorById(id);
      setSubcontractor(res);
    } catch (e) {
      alert('Failed to load details: ' + e.message);
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <svg className="animate-spin h-8 w-8 text-[#0f62fe]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
    </div>
  );

  if (!subcontractor) return null;

  return (
    <PageContainer>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-[85vh] font-sans pb-28">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-gray-900 dark:text-white text-lg font-bold">Subcontractor Profile</h1>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-[#0f62fe] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 bg-blue-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-3xl font-black text-[#0f62fe]">{subcontractor.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{subcontractor.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0f62fe] uppercase tracking-wider">
                  {subcontractor.type?.replace(/_/g, ' ')}
                </span>
                {subcontractor.isVerified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    Verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {subcontractor.workTypes?.map(wt => (
                  <span key={wt} className="text-[10px] font-bold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {wt}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-auto mt-4 md:mt-0 flex md:flex-col gap-3">
              <button onClick={() => navigate(`/admin/subcontractors/${id}/workers`)} className="flex-1 py-2.5 px-5 bg-white border border-[#0f62fe] text-[#0f62fe] font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-sm">
                Manage Workers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Contact Information</h3>
              <InfoRow label="Contact Person" value={subcontractor.contactPerson} />
              <InfoRow label="Phone" value={subcontractor.phone} />
              <InfoRow label="Email" value={subcontractor.email} />
              <InfoRow label="Address" value={subcontractor.address} />
            </div>

            {/* Compliance & Bank */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Compliance & Bank</h3>
              <InfoRow label="GST No." value={subcontractor.gstNumber} />
              <InfoRow label="PAN No." value={subcontractor.panNumber} />
              <InfoRow label="Bank Name" value={subcontractor.bankName} />
              <InfoRow label="Account No." value={subcontractor.bankAccount} />
              <InfoRow label="IFSC Code" value={subcontractor.bankIfsc} />
            </div>

          </div>
        </div>
      </div>

      <SubcontractorFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchDetails}
        initialData={subcontractor}
      />
    </PageContainer>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-1">
      <span className="text-sm text-gray-500 font-medium w-32">{label}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex-1">{value || 'N/A'}</span>
    </div>
  );
}
