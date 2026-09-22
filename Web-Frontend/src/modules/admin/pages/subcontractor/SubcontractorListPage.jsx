import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../../shared/components/PageContainer';
import { getSubcontractors } from '../../services/subcontractor.service';
import { ListSkeleton } from '../../../../shared/components/Skeletons';
import SubcontractorFormModal from './components/SubcontractorFormModal';

const SubcontractorListPage = () => {
  const navigate = useNavigate();
  const [subcontractors, setSubcontractors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubcontractors = async () => {
    setIsLoading(true);
    try {
      const res = await getSubcontractors();
      setSubcontractors(res || []);
    } catch (error) {
      console.error("Error fetching subcontractors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const filteredSubcontractors = subcontractors.filter(sc => 
    sc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sc.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sc.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[75vh] flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Subcontractors</h2>
            <p className="text-sm text-gray-500 mt-1">Manage global subcontractor directory</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f62fe] text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Subcontractor
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Search by name, contact person, or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : filteredSubcontractors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubcontractors.map((sc) => (
                <div 
                  key={sc.id} 
                  onClick={() => navigate(`/admin/subcontractors/${sc.id}`)}
                  className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0f62fe] uppercase tracking-wider">
                      {sc.type?.replace(/_/g, ' ') || 'GENERAL'}
                    </span>
                    {sc.isVerified && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 uppercase tracking-wider flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0f62fe] transition-colors mb-1 truncate">
                    {sc.name}
                  </h3>
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      <span className="truncate">{sc.contactPerson || 'No contact'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      <span className="truncate">{sc.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              <p className="text-sm font-medium text-gray-500">No subcontractors found.</p>
            </div>
          )}
        </div>
      </div>

      <SubcontractorFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSubcontractors} 
      />
    </PageContainer>
  );
};

export default SubcontractorListPage;
