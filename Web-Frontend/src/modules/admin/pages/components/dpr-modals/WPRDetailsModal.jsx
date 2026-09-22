import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Trash2, Cloud, CloudRain, Sun, FileText, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../../../../../api/apiClient';

const SecureMediaFetcher = ({ file, getFileUrl, isDoc }) => {
    const [url, setUrl] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchMedia = async () => {
            const targetUrl = getFileUrl(file);
            if (!targetUrl) { if (isMounted) setError(true); return; }
            if (targetUrl.startsWith('blob:') || targetUrl.startsWith('http')) { if (isMounted) setUrl(targetUrl); return; }

            try {
                const response = await apiClient.get(targetUrl, { responseType: 'blob' });
                if (isMounted) setUrl(URL.createObjectURL(response.data));
            } catch (e) {
                if (isMounted) setUrl(targetUrl); 
            }
        };
        fetchMedia();
        return () => { isMounted = false; };
    }, [file, getFileUrl]);

    if (error) {
        return isDoc ? (
            <div className="aspect-square border border-slate-100 rounded-xl flex flex-col items-center justify-center bg-red-50 text-red-300 shadow-sm"><FileText className="w-4 h-4 mb-1" /><span className="text-[8px] font-bold">Failed</span></div>
        ) : (
            <div className="aspect-square border border-slate-100 rounded-xl flex flex-col items-center justify-center bg-red-50 text-red-300 shadow-sm"><ImageIcon className="w-4 h-4 mb-1" /><span className="text-[8px] font-bold">Missing</span></div>
        );
    }
    
    if (!url) return <div className="aspect-square flex items-center justify-center bg-slate-50 rounded-xl shadow-sm"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>;

    if (isDoc) {
        const title = typeof file === 'string' ? file.split(/[/\\]/).pop() : (file.name || 'Document');
        return (
            <a href={url} target="_blank" rel="noreferrer" className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 transition-all text-brand-500 p-2 text-center shadow-sm">
                <FileText size={18} className="mb-1" />
                <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 truncate w-full px-1">{title}</span>
            </a>
        );
    }

    return (
        <a href={url} target="_blank" rel="noreferrer" className="block relative group">
            <img src={url} alt="Site" className="aspect-square w-full object-cover rounded-xl border border-slate-200 hover:border-brand-500 transition-colors bg-slate-50 shadow-sm" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            <div style={{display: 'none'}} className="aspect-square border border-slate-100 rounded-xl flex-col items-center justify-center bg-red-50 text-red-300"><ImageIcon className="w-5 h-5 mb-1" /><span className="text-[8px] font-bold text-center px-1">Missing</span></div>
        </a>
    );
};

const WPRDetailsModal = ({ isOpen, onClose, wpr }) => {
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        tasks: [],
        inventory: [],
        subcontractors: []
    });

    useEffect(() => {
        if (isOpen && wpr?.projectId) {
            const fetchContextData = async () => {
                setIsFetchingData(true);
                try {
                    const [tasksRes, invRes, subsRes] = await Promise.allSettled([
                        apiClient.get(`/tasks?projectId=${wpr.projectId}`),
                        apiClient.get(`/inventory?projectId=${wpr.projectId}`),
                        apiClient.get(`/subcontractors?projectId=${wpr.projectId}`)
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];

                    setDropdownData({
                        tasks: extractData(tasksRes),
                        inventory: extractData(invRes),
                        subcontractors: extractData(subsRes)
                    });
                } catch (error) {
                    console.error("Failed to load context data:", error);
                } finally {
                    setIsFetchingData(false);
                }
            };
            fetchContextData();
        }
    }, [isOpen, wpr]);

    const getFileUrl = useCallback((file) => {
        if (!file) return null;
        let pathStr = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath || file.name || file.fileName || file.path || '');
        if (!pathStr || typeof pathStr !== 'string') return null;
        
        pathStr = pathStr.replace(/['"\[\]]/g, '');
        if (pathStr.startsWith('blob:') || pathStr.startsWith('http')) return pathStr;

        let normalizedPath = pathStr.replace(/\\/g, '/');
        if (normalizedPath.includes('uploads/')) {
            const exactPath = normalizedPath.substring(normalizedPath.indexOf('uploads/'));
            return `/${exactPath}`;
        }
        
        const filename = normalizedPath.split('/').pop().split('?')[0];
        if (!filename || filename.length < 4) return null;

        const isDocument = filename.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i);
        const targetFolder = isDocument ? 'documents' : 'dpr-photos';
        
        return `/uploads/${targetFolder}/${filename}`;
    }, []);

    if (!isOpen || !wpr) return null;

    const data = wpr.aggregatedData || wpr;
    const projectInfo = data.projectInfo || {};
    const progress = data.progress || { currentOverall: '0%', todayAdded: '+0%' };

    const parseNestedJSON = (inputData) => {
        if (!inputData) return [];
        let parsed = inputData;
        if (typeof inputData === 'string') {
            try { parsed = JSON.parse(inputData); } catch (e) { parsed = [inputData]; }
        }
        if (!Array.isArray(parsed)) parsed = [parsed];
        
        let flat = [];
        parsed.forEach(item => {
            if (typeof item === 'string') {
                try {
                    const inner = JSON.parse(item);
                    if (Array.isArray(inner)) flat.push(...inner);
                    else flat.push(inner);
                } catch (e) { flat.push(item); }
            } else if (Array.isArray(item)) {
                flat.push(...item);
            } else {
                flat.push(item);
            }
        });
        return flat.filter(Boolean);
    };

    const formatName = (item, type) => {
        if (!item) return 'Unnamed';
        try {
            const list = type === 'task' ? dropdownData.tasks : type === 'inventory' ? dropdownData.inventory : dropdownData.subcontractors;
            
            const findName = (idToFind) => {
                if (!idToFind) return '';
                const strId = String(idToFind).trim().replace(/['"\[\]]/g, '');
                const found = list.find(x => String(x.id) === strId || String(x._id) === strId);
                return found ? (found.name || found.itemName || found.taskName || found.companyName || found.title) : strId;
            };

            if (typeof item === 'string') {
                if (item.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(item);
                        if (Array.isArray(parsed)) return parsed.map(findName).join(', ');
                    } catch(e) {}
                }
                return findName(item);
            }

            if (typeof item === 'object') {
                const actualId = item.taskId || item.materialId || item.equipmentId || item.subcontractorId || item.id || item._id;
                if (actualId) return findName(actualId);
                return item.name || item.taskName || 'Unnamed';
            }
            return String(item);
        } catch (_error) {
            return typeof item === 'string' ? item.replace(/['"\[\]]/g, '') : 'Unnamed';
        }
    };

    const extractAllMedia = (source) => {
        let media = [];
        if (!source) return media;
        if (Array.isArray(source)) {
            source.forEach(item => { media = media.concat(extractAllMedia(item)); });
        } else if (typeof source === 'string') {
            if (source.includes('[') || source.includes(',')) {
                const cleaned = source.replace(/[\[\]"'\\]/g, '').split(',');
                cleaned.forEach(c => { if (c.trim()) media.push(c.trim()); });
            } else {
                media.push(source.replace(/['"\\]/g, ''));
            }
        } else if (typeof source === 'object') {
            media.push(source);
        }
        return media;
    };

    const parsedMaterials = parseNestedJSON(data.materials?.consumed || data.materials);
    const parsedTasks = parseNestedJSON(data.tasks);
    const parsedEquipment = parseNestedJSON(data.equipment);
    const parsedSubcontractors = parseNestedJSON(data.subcontractors);
    const parsedNextWeekPlanning = parseNestedJSON(data.nextWeekPlanning || data.nextWeekTasks || wpr.nextWeekPlanning);
    const weather = Array.isArray(data.weather) ? data.weather : [];
    const attendance = data.attendance || { daily: [], summary: { avgWorkers: 0, avgStaff: 0 } };

    let allExtractedMedia = [
        ...extractAllMedia(data.photos),
        ...extractAllMedia(data.documents),
        ...extractAllMedia(wpr.photos),
        ...extractAllMedia(wpr.documents)
    ];
    
    const dprList = data.dprs || data.dailyReports || data.reports || [];
    if (Array.isArray(dprList)) {
        dprList.forEach(report => {
            allExtractedMedia = allExtractedMedia.concat(extractAllMedia(report.photos));
            allExtractedMedia = allExtractedMedia.concat(extractAllMedia(report.documents));
        });
    }

    const actualPhotos = [];
    const actualDocs = [];
    const seenUrls = new Set();

    allExtractedMedia.forEach(media => {
        const url = getFileUrl(media);
        if (!url || seenUrls.has(url)) return;
        seenUrls.add(url);
        
        if (url.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i)) actualDocs.push(media);
        else actualPhotos.push(media);
    });

    const getWeatherIcon = (code) => {
        if (!code) return <Cloud className="text-slate-400 w-4 h-4"/>;
        const lowerCode = code.toLowerCase();
        if (lowerCode.includes('sun') || lowerCode.includes('☀️')) return <Sun className="text-amber-500 w-4 h-4"/>;
        if (lowerCode.includes('rain') || lowerCode.includes('🌧️')) return <CloudRain className="text-blue-400 w-4 h-4"/>;
        return <Cloud className="text-slate-400 w-4 h-4"/>;
    };

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 flex flex-col animate-in zoom-in-95 duration-200">
                
                {isFetchingData && (
                    <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Loading Report Details...</p>
                    </div>
                )}

                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={isFetchingData} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors disabled:opacity-50">
                            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <div>
                            <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">WPR Details</h2>
                            <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                                {projectInfo.name || wpr.projectName || 'Project'} | {projectInfo.projectId || 'PRJ-XXX'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={() => alert("Edit Modal Integration Pending")} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => alert("Delete Logic Pending")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold hover:bg-red-500 hover:text-white transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        <button onClick={onClose} className="ml-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    
                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Generated By: <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize ml-1">{wpr.preparedBy?.name || data.generatedBy || 'N/A'}</span>
                            </p>
                        </div>
                        <div className="">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Weather Log</label>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {weather.length > 0 ? weather.map((w, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600 min-w-[3rem]">
                                        <span className="text-[9px] font-bold text-slate-400">{w.day}</span>
                                        {getWeatherIcon(w.code)}
                                    </div>
                                )) : <p className="text-xs font-semibold text-slate-400">No weather data.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Weekly Overview Description</label>
                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-brand-500 pl-3">
                            {wpr.description || 'No description provided for this week.'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">Progress <span className="text-brand-500 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded text-[9px]">{progress.todayAdded || '+0%'} Today</span></span>
                            <span className="text-slate-800 dark:text-slate-200">{progress.currentOverall || '0%'} Overall</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden relative">
                            <div className="bg-brand-500 h-full rounded-full transition-all duration-1000" style={{ width: progress.currentOverall || '0%' }}></div>
                        </div>
                    </div>

                    <div className="border border-slate-100 dark:border-slate-700 p-5 rounded-2xl">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">Attendance Summary</label>
                        <div className="flex items-end justify-between h-32 mt-3 px-2 border-b border-dashed border-slate-200 dark:border-slate-600">
                            {attendance.daily?.length > 0 ? attendance.daily.map((d, i) => {
                                const workerHeight = Math.min(((d.workers || 0) / 40) * 100, 100);
                                const staffHeight = Math.min(((d.staff || 0) / 40) * 100, 100);
                                return (
                                    <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end pb-2">
                                        <div className="w-2.5 bg-[#00B69B] rounded-sm" style={{ height: `${staffHeight}%`, minHeight: '3px' }}></div>
                                        <div className="w-2.5 bg-brand-500 rounded-sm" style={{ height: `${workerHeight}%`, minHeight: '3px' }}></div>
                                        <span className="text-[8px] font-bold text-slate-400 mt-1">{d.date?.substring(0,3) || d.date}</span>
                                    </div>
                                );
                            }) : <p className="text-xs font-semibold text-slate-400 w-full text-center pb-4">No attendance data.</p>}
                        </div>
                        <div className="flex justify-center gap-8 mt-5">
                            <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-brand-500 rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{attendance.summary?.avgWorkers || 0} Workers (Avg)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-[#00B69B] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{attendance.summary?.avgStaff || 0} Staff (Avg)</span></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5 block">Sub-contractors Assigned</label>
                            <div className="space-y-2">
                                {parsedSubcontractors.length > 0 ? parsedSubcontractors.map((sub, idx) => {
                                    const name = formatName(sub, 'subcontractor');
                                    return (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-xl">
                                            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{name}</span>
                                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded tracking-wide uppercase">{sub.specialization || 'General'}</span>
                                        </div>
                                    )
                                }) : <p className="text-xs font-semibold text-slate-400 italic px-1">No subcontractors assigned this week.</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5 block">Tasks Progress</label>
                            <div className="space-y-0.5 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                                {parsedTasks.length > 0 ? parsedTasks.map((task, idx) => {
                                    let statusBg = "bg-amber-500";
                                    let statusText = task.status || "In Progress";
                                    if (statusText.toUpperCase() === 'COMPLETED') statusBg = "bg-[#00B69B]";
                                    else if (statusText.toUpperCase() === 'PENDING') statusBg = "bg-[#FF3B30]";
                                    const name = formatName(task, 'task');
                                    return (
                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-3">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{name} {task.completed && <span className="text-brand-500 font-bold ml-1">({task.completed})</span>}</span>
                                            <span className={`${statusBg} text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded`}>{statusText}</span>
                                        </div>
                                    );
                                }) : <div className="bg-white dark:bg-slate-800 p-4"><p className="text-xs font-semibold text-slate-400 italic">No tasks recorded.</p></div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Materials Used</label>
                                <div className="space-y-2">
                                    {parsedMaterials.length > 0 ? parsedMaterials.map((mat, idx) => {
                                        const name = formatName(mat, 'inventory');
                                        return (
                                            <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 px-1">
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{name}</span>
                                                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">{mat.quantity || ''}</span>
                                            </div>
                                        )
                                    }) : <p className="text-xs font-semibold text-slate-400 italic px-1">No materials used.</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Equipments Used</label>
                                <div className="space-y-2">
                                    {parsedEquipment.length > 0 ? parsedEquipment.map((eq, idx) => {
                                        const name = formatName(eq, 'inventory');
                                        return (
                                            <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 px-1">
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{name}</span>
                                                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">{eq.hrsUsed || eq.hours || ''}</span>
                                            </div>
                                        )
                                    }) : <p className="text-xs font-semibold text-slate-400 italic px-1">No equipment used.</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5 block">Budget Estimate</label>
                            <div className="space-y-2.5 bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Labour Cost</span><span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹ {(data.budget?.labor || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Material Cost</span><span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹ {(data.budget?.materials || data.budget?.material || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Equipment Cost</span><span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹ {(data.budget?.equipment || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sub-contractor</span><span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹ {(data.budget?.subcontractor || 0).toLocaleString()}</span></div>
                                <div className="pt-2.5 mt-1 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center font-bold text-[11px]"><span className="uppercase text-slate-800 dark:text-slate-200 tracking-wide">Total Estimated Cost</span><span className="text-brand-600 dark:text-brand-400">₹ {(data.budget?.total || data.budget?.used || 0).toLocaleString()}</span></div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5 block text-center md:text-left">Attached Photos</label>
                            <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5 pb-2">
                                {actualPhotos.length > 0 ? actualPhotos.map((url, i) => (
                                    <SecureMediaFetcher key={i} file={url} getFileUrl={getFileUrl} isDoc={false} />
                                )) : <p className="text-[11px] font-medium text-slate-400 col-span-4 md:col-span-5 italic px-1">No photos aggregated.</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5 block text-center md:text-left">Attached Documents</label>
                            <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5 pb-2">
                                {actualDocs.length > 0 ? actualDocs.map((url, i) => (
                                    <SecureMediaFetcher key={i} file={url} getFileUrl={getFileUrl} isDoc={true} />
                                )) : <p className="text-[11px] font-medium text-slate-400 col-span-4 md:col-span-5 italic px-1">No documents aggregated.</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5 block">Next Week Planning!</label>
                            <div className="space-y-2">
                                {parsedNextWeekPlanning.length > 0 ? parsedNextWeekPlanning.map((plan, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-3 px-4 rounded-xl shadow-sm">
                                        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{formatName(plan, 'task')}</p>
                                        {plan.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>}
                                    </div>
                                )) : <p className="text-xs font-semibold text-slate-400 italic px-1">No tasks planned for next week.</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Closing Notes</label>
                            <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 p-4 rounded-xl">
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{wpr.notes || 'No additional notes provided.'}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default WPRDetailsModal;
