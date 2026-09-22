import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Calendar, Trash2, ChevronDown, Loader2, X, RefreshCw } from 'lucide-react';
import { dprService } from '../../../projects/services/dpr.service';
import { getProjectWPRsAPI } from '../../../projects/services/wpr.service'; 

import CreateDPRModal from './dpr-modals/CreateDPRModal';
import CreateWPRModal from './dpr-modals/CreateWPRModal';
import DPRDetailsModal from './dpr-modals/DPRDetailsModal';
import WPRDetailsModal from './dpr-modals/WPRDetailsModal';

const DprWprTab = ({ projectId }) => {
  const [reportType, setReportType] = useState('DPR');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [selectedDate, setSelectedDate] = useState(''); 
  const [selectedWeek, setSelectedWeek] = useState(''); 
  const [selectedMonthYear, setSelectedMonthYear] = useState(`${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); 
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReports = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      if (reportType === 'DPR') {
        const queryParams = { 
            page: "1", 
            limit: "100",
            ...(selectedDate && { startDate: selectedDate, endDate: selectedDate }),
            ...(statusFilter && { status: statusFilter })
        };
        const response = await dprService.getDPRsByProject(projectId, queryParams);
        let fetchedReports = Array.isArray(response?.data) ? response.data : (Array.isArray(response?.data?.data) ? response.data.data : []);
        setReports(fetchedReports);
      } else {
        const response = await getProjectWPRsAPI(projectId);
        
        let fetchedWPRs = [];
        if (Array.isArray(response)) fetchedWPRs = response;
        else if (Array.isArray(response?.data)) fetchedWPRs = response.data;
        else if (Array.isArray(response?.data?.data)) fetchedWPRs = response.data.data;
        else if (Array.isArray(response?.data?.wprs)) fetchedWPRs = response.data.wprs;
        
        if (selectedMonthYear && fetchedWPRs.length > 0) {
            const [monthStr, yearStr] = selectedMonthYear.split('/');
            const targetMonth = parseInt(monthStr, 10) - 1;
            const targetYear = parseInt(yearStr, 10);

            fetchedWPRs = fetchedWPRs.filter(wpr => {
                if (!wpr.weekStartDate && !wpr.createdAt) return true;
                const d = new Date(wpr.weekStartDate || wpr.createdAt);
                return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
            });
        }

        if (selectedWeek && selectedWeek !== '' && fetchedWPRs.length > 0) {
            const weekNum = parseInt(selectedWeek.replace('Week ', ''), 10);
            fetchedWPRs = fetchedWPRs.filter(wpr => {
                if (!wpr.weekStartDate && !wpr.createdAt) return true;
                const d = new Date(wpr.weekStartDate || wpr.createdAt);
                const dateOfMonth = d.getDate();
                const calcWeek = Math.ceil(dateOfMonth / 7);
                const finalWeek = calcWeek > 4 ? 4 : calcWeek;
                return finalWeek === weekNum;
            });
        }
        
        if (statusFilter && fetchedWPRs.length > 0) {
             fetchedWPRs = fetchedWPRs.filter(wpr => (wpr.status || '').toUpperCase() === statusFilter);
        }

        setReports(fetchedWPRs);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [projectId, reportType, selectedDate, selectedMonthYear, selectedWeek, statusFilter]);

  const handleOpenDetails = async (report) => {
    if (isDeleteMode) return; 
    
    if (reportType === 'DPR') {
        setLoadingDetailsId(report.id); 
        try {
            const fullDetails = await dprService.getDPRById(report.id);
            let actualData = fullDetails?.data?.data || fullDetails?.data || report;

            try {
                const photoResponse = await dprService.getDPRPhotos(report.id);
                const fetchedPhotos = photoResponse?.data?.photos || photoResponse?.data?.data?.photos || [];
                actualData = {
                    ...actualData,
                    photos: fetchedPhotos.length > 0 ? fetchedPhotos : actualData.photos
                };
            } catch (photoErr) {
                console.error("Failed to fetch specific DPR photos:", photoErr);
            }

            setSelectedReport(actualData);
        } catch (error) {
            console.error("Failed to fetch full DPR details:", error);
            setSelectedReport(report); 
        } finally {
            setLoadingDetailsId(null);
            setIsDetailsModalOpen(true);
        }
    } else {
        setSelectedReport(report);
        setIsDetailsModalOpen(true);
    }
  };

  const handleDeleteRow = async (e, id) => {
    e.stopPropagation(); 
    if (window.confirm(`Are you sure you want to permanently delete this ${reportType}?`)) {
        try {
            if (reportType === 'DPR') await dprService.deleteDPR(id);
            else await dprService.deleteWPRAPI(id); // assuming delete API exposed
            fetchReports();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete report.");
        }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 lg:p-8 animate-in fade-in duration-500 w-full min-h-[500px]">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        
        {/* TAB TOGGLE */}
        <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-full w-fit border border-slate-200 dark:border-slate-600">
          <button 
            onClick={() => { setReportType('DPR'); setIsDeleteMode(false); }}
            className={`px-8 py-2.5 rounded-full text-[13px] font-bold transition-all ${reportType === 'DPR' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            DPR
          </button>
          <button 
            onClick={() => { setReportType('WPR'); setIsDeleteMode(false); }}
            className={`px-8 py-2.5 rounded-full text-[13px] font-bold transition-all ${reportType === 'WPR' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            WPR
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button onClick={fetchReports} className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Sync Reports">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {reportType === 'DPR' ? (
            <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-11 pr-4 py-2 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 w-full cursor-pointer h-10"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative">
                <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer h-10">
                  <option value="">All Weeks</option>
                  <option value="Week 1">Week 1</option>
                  <option value="Week 2">Week 2</option>
                  <option value="Week 3">Week 3</option>
                  <option value="Week 4">Week 4</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                <input type="text" placeholder="MM/YYYY" value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} className="pl-11 pr-4 py-2 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none w-32 h-10" />
              </div>
            </div>
          )}

          <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-colors ${statusFilter || isFilterOpen ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-3 mb-2 mt-2">Filter Status</p>
                      <button onClick={() => { setStatusFilter(''); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-[13px] font-semibold rounded-xl mb-1 ${statusFilter === '' ? 'bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>All Reports</button>
                      <button onClick={() => { setStatusFilter('APPROVED'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-[13px] font-semibold rounded-xl mb-1 ${statusFilter === 'APPROVED' ? 'bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>Approved</button>
                      <button onClick={() => { setStatusFilter('SUBMITTED'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-[13px] font-semibold rounded-xl ${statusFilter === 'SUBMITTED' ? 'bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>Submitted</button>
                  </div>
              )}
          </div>
          
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 shadow-sm transition-all active:scale-95 h-10">
            <Plus className="w-4 h-4" /> Create {reportType}
          </button>
          
          <button 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-colors ${isDeleteMode ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'}`}
          >
            {isDeleteMode ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {reportType === 'DPR' ? 'Daily Progress Reports' : 'Weekly Progress Report List'}
          </h3>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{reports.length} Records</span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="py-20 flex justify-center items-center text-slate-400 font-medium"><Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-500" /> Fetching {reportType}s...</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            No {reportType} records found
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => handleOpenDetails(report)}
              className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all group ${!isDeleteMode ? 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm' : ''}`}
            >
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                  {reportType === 'WPR' 
                    ? `${formatDate(report.weekStartDate)} to ${formatDate(report.weekEndDate)}` 
                    : formatDate(report.date)}
                </p>
                <div className="flex items-center gap-3">
                    {reportType === 'DPR' && (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Prepared by: <span className="font-semibold text-brand-600 dark:text-brand-400">{report.preparedBy?.name || 'Site Engineer'}</span>
                    </p>
                    )}
                    {reportType === 'WPR' && report.reportNo && (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Report No: <span className="font-semibold text-brand-600 dark:text-brand-400">{report.reportNo}</span>
                    </p>
                    )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {loadingDetailsId === report.id && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
                
                {isDeleteMode ? (
                    <button onClick={(e) => handleDeleteRow(e, report.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors animate-in zoom-in">
                        <Trash2 className="w-4 h-4" />
                    </button>
                ) : (
                    report.status && (
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                        report.status.toUpperCase() === 'APPROVED' ? 'bg-[#00A86B]/10 text-[#00A86B] border border-[#00A86B]/20' : 'bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800'
                      }`}>
                        {report.status.toUpperCase() === 'APPROVED' ? 'Approved' : 'Submitted'}
                      </span>
                    )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {reportType === 'DPR' ? (
        <CreateDPRModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchReports} projectId={projectId} />
      ) : (
        <CreateWPRModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchReports} projectId={projectId} />
      )}

      {reportType === 'DPR' ? (
          <DPRDetailsModal 
            isOpen={isDetailsModalOpen} 
            onClose={() => setIsDetailsModalOpen(false)} 
            dpr={selectedReport} 
            onDelete={async (id) => {
                if (window.confirm("Delete this report permanently?")) {
                    await dprService.deleteDPR(id);
                    setIsDetailsModalOpen(false);
                    fetchReports();
                }
            }}
          />
      ) : (
          <WPRDetailsModal 
            isOpen={isDetailsModalOpen} 
            onClose={() => setIsDetailsModalOpen(false)} 
            wpr={selectedReport} 
          />
      )}
    </div>
  );
};

export default DprWprTab;
