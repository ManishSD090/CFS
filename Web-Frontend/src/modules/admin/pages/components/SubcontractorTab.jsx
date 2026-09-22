import React, { useState } from 'react';
import SubcontractorFormModal from './SubcontractorFormModal';
import SubcontractorDetailModal from './SubcontractorDetailModal';
import useSubcontractor from '../../hooks/useSubcontractor';

export default function SubcontractorTab({ projectId }) {
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const { subcontractors, loading, error, addSubcontractor, editSubcontractor, removeSubcontractor } = useSubcontractor(projectId);

  const handleOpenCreate = () => {
    setCurrentEdit(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (e, contractor) => {
    e.stopPropagation();
    setCurrentEdit(contractor);
    setShowFormModal(true);
  };

  const handleOpenDetail = (contractor) => {
    setSelectedDetail(contractor);
    setShowDetailModal(true);
  };

  const handleDelete = async (e, id, contractorProjectId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this sub-contractor?")) {
      try {
        await removeSubcontractor(id);
      } catch (err) {
        alert("Failed to remove subcontractor");
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (currentEdit) {
        await editSubcontractor(currentEdit.id, currentEdit.contractorProjectId, data);
      } else {
        await addSubcontractor(data);
      }
      setShowFormModal(false);
      setCurrentEdit(null);
    } catch (err) {
      alert("Error saving sumcontractor");
    }
  };

  const safeSubcontractors = Array.isArray(subcontractors) ? subcontractors : [];
  const filteredData = safeSubcontractors.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.workType || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / perPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-sans"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap font-sans"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Sub-contractor
          </button>
          <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors font-sans">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 font-sans">Contractor Name</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 font-sans">Contractor Type</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 font-sans">Work Type</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 font-sans">Status</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 font-sans">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((contractor) => (
                <tr key={contractor.id} onClick={() => handleOpenDetail(contractor)} className="hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors cursor-pointer text-sm">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 font-sans">{contractor.name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-sans">{contractor.type}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-sans">{contractor.workType}</td>
                  <td className="px-4 py-3 font-sans">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${contractor.status === 'Active' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                      {contractor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       <button onClick={(e) => handleOpenEdit(e, contractor)} className="text-slate-400 hover:text-brand-600 transition-colors p-1">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                         </svg>
                       </button>
                       <button onClick={(e) => handleDelete(e, contractor.id, contractor.contractorProjectId)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                           <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                         </svg>
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-sm font-sans">No sub-contractors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-sans">
          <span>Showing</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 font-sans">
          <p className="text-sm text-slate-400 whitespace-nowrap">
            Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredData.length)} out of {filteredData.length} records
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-sans"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition bg-brand-600 text-white shadow-sm font-sans"
            >
              {currentPage}
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-sans"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <SubcontractorFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setCurrentEdit(null); }}
        onSubmit={handleFormSubmit}
        initialData={currentEdit}
      />
      
      <SubcontractorDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        contractor={selectedDetail}
        onEditClick={() => {
          setShowDetailModal(false);
          setCurrentEdit(selectedDetail);
          setShowFormModal(true);
        }}
      />
      
    </div>
  );
}
