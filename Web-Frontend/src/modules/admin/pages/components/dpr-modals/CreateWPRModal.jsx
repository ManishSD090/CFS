import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import apiClient from '../../../../../api/apiClient';
import { getWPRPreviewAPI, createWPRAPI } from '../../../../projects/services/wpr.service';

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
            <a href={url} target="_blank" rel="noreferrer" className="aspect-square bg-[#F8FAFC] dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors text-brand-500 p-2 text-center shadow-sm">
                <FileText size={18} className="mb-1" />
                <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 truncate w-full px-1">{title}</span>
            </a>
        );
    }

    return (
        <a href={url} target="_blank" rel="noreferrer" className="block relative">
            <img src={url} alt="Site" className="aspect-square w-full object-cover rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            <div style={{display: 'none'}} className="aspect-square border border-slate-100 dark:border-slate-700 rounded-xl flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-300"><ImageIcon className="w-5 h-5 mb-1" /><span className="text-[8px] font-bold text-center px-1">Missing</span></div>
        </a>
    );
};

const CreateWPRModal = ({ isOpen, onClose, projectId, onSuccess }) => {
    const [fetchingData, setFetchingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [weekData, setWeekData] = useState(null); 
    
    const [contextData, setContextData] = useState({ tasks: [], inventory: [], subcontractors: [] });
    
    const [formData, setFormData] = useState({ 
        weekDate: '', 
        description: '', 
        notes: '',
        nextWeekTasks: [{ id: Date.now(), task: '', description: '' }] 
    });

    useEffect(() => {
        if (isOpen && projectId) {
            const fetchContext = async () => {
                try {
                    const [tasksRes, invRes, subsRes] = await Promise.allSettled([
                        apiClient.get(`/tasks?projectId=${projectId}`),
                        apiClient.get(`/inventory?projectId=${projectId}`),
                        apiClient.get(`/subcontractors?projectId=${projectId}`)
                    ]);

                    const extract = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];
                    setContextData({ 
                        tasks: extract(tasksRes), 
                        inventory: extract(invRes),
                        subcontractors: extract(subsRes)
                    });
                } catch (err) {
                    console.error("Failed to load translation context", err);
                }
            };
            fetchContext();
        }
    }, [isOpen, projectId]);

    const fetchRealTimeAggregation = useCallback(async () => {
        setFetchingData(true);
        try {
            const res = await getWPRPreviewAPI(projectId, formData.weekDate);
            if (res.success && res.hasData) {
                setWeekData(res.data);
            } else {
                setWeekData(null);
                alert("No DPRs found for this week. Cannot aggregate data.");
            }
        } catch (err) { 
            console.error("Aggregation error:", err); 
        } finally { 
            setFetchingData(false); 
        }
    }, [projectId, formData.weekDate]);

    useEffect(() => {
        if (formData.weekDate && isOpen) {
            fetchRealTimeAggregation();
        }
    }, [formData.weekDate, isOpen, fetchRealTimeAggregation]);

    const formatName = (item, type) => {
        if (!item) return 'Unnamed Item';
        try {
            const list = type === 'task' ? contextData.tasks : type === 'subcontractor' ? contextData.subcontractors : contextData.inventory;
            
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
                return item.name || item.taskName || 'Unnamed Item';
            }
            return String(item);
        } catch (_error) {
            return typeof item === 'string' ? item.replace(/['"\[\]]/g, '') : 'Unnamed Item'; 
        }
    };

    const getFileUrl = useCallback((file) => {
        if (!file) return null;
        if (file instanceof File) return URL.createObjectURL(file);

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

    const parseNestedJSON = (data) => {
        if (!data) return [];
        let parsed = data;
        if (typeof data === 'string') {
            try { parsed = JSON.parse(data); } catch (e) { parsed = [data]; }
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

    const wprData = weekData?.aggregatedData || weekData || {};
    
    const parsedTasks = parseNestedJSON(wprData.tasks);
    const parsedMaterials = parseNestedJSON(wprData.materials?.consumed || wprData.materials);
    const parsedEquipment = parseNestedJSON(wprData.equipment);
    const parsedSubcontractors = parseNestedJSON(wprData.subcontractors);
    
    let allExtractedMedia = [
        ...extractAllMedia(wprData.photos),
        ...extractAllMedia(wprData.documents)
    ];
    
    const dprList = wprData.dprs || wprData.dailyReports || wprData.reports || [];
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

    const handleSave = async () => {
        if (!weekData) return alert("Please select a valid week first.");
        setIsSaving(true);
        try {
            const payload = {
                projectId,
                weekStartDate: weekData.weekInfo.startDate,
                weekEndDate: weekData.weekInfo.endDate,
                description: formData.description,
                notes: formData.notes,
                previewData: weekData,
                nextWeekPlanning: formData.nextWeekTasks.filter(t => t.task.trim() !== '')
            };

            await createWPRAPI(payload);
            setTimeout(() => {
                if (onSuccess) onSuccess(); 
                onClose();
                setIsSaving(false);
            }, 500);
        } catch (error) {
            setIsSaving(false);
            alert(error.message || "Failed to save the WPR. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 flex flex-col animate-in zoom-in-95 duration-200">
                
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 shrink-0">
                    <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Create Weekly Progress Report</h2>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 custom-scrollbar">
                    
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">WPR Week</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={formData.weekDate} 
                                onChange={e => setFormData({...formData, weekDate: e.target.value})} 
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 appearance-none transition-all" 
                            />
                            <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                        </div>
                    </div>

                    {fetchingData ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                            <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wide">Aggregating Weekly Data...</p>
                        </div>
                    ) : weekData ? (
                        <div className="space-y-7 animate-in fade-in duration-500">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Weather</label>
                                <div className="grid grid-cols-7 gap-2">
                                    {weekData.weather?.map((w, i) => (
                                        <div key={i} className="flex flex-col items-center p-2 text-center border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                                            <span className="text-[9px] font-bold text-slate-400">{w.day}</span>
                                            <span className="text-sm mt-1">{w.code}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none focus:border-brand-500 min-h-[80px] resize-none transition-all" placeholder="Enter the description"></textarea>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Attendance Summary</h3>
                                <div className="h-32 flex items-end justify-between px-6 pb-2 border-b border-dashed border-slate-200 dark:border-slate-700 relative">
                                    <div className="absolute -left-1 top-0 bottom-0 flex flex-col justify-between text-[9px] font-bold text-slate-400"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
                                    {weekData.attendance?.daily?.map((d, i) => {
                                        const workerHeight = Math.min(((d.workers || 0) / 40) * 100, 100);
                                        const staffHeight = Math.min(((d.staff || 0) / 40) * 100, 100);
                                        return (
                                            <div key={i} className="relative w-3.5 flex flex-col justify-end h-full gap-0.5 mt-1">
                                                <div className="w-full bg-[#00B69B] rounded-sm" style={{ height: `${staffHeight}%`, minHeight: '3px' }}></div>
                                                <div className="w-full bg-[#0066CC] rounded-sm" style={{ height: `${workerHeight}%`, minHeight: '3px' }}></div>
                                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400">{d.date}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-center gap-8 mt-5">
                                    <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-[#0066CC] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{weekData.attendance?.summary?.avgWorkers || 0} Workers (avg)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-[#00B69B] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{weekData.attendance?.summary?.avgStaff || 0} Staff (avg)</span></div>
                                </div>
                            </div>

                            <FigmaSection title="Sub-contractors Overview">
                                {parsedSubcontractors.length > 0 
                                    ? parsedSubcontractors.map((sc, i) => <FigmaRow key={i} label={formatName(sc, 'subcontractor')} value={`${sc.specialization || 'Active'}`} isBlue />) 
                                    : <p className="text-[10px] font-medium text-slate-400 italic px-2">No active subcontractors.</p>}
                            </FigmaSection>

                            <FigmaSection title="Tasks Progress">
                                {parsedTasks.length > 0 
                                    ? parsedTasks.map((t, i) => <FigmaRow key={i} label={formatName(t, 'task')} badge={t.status || 'IN PROGRESS'} color={(t.status || '').toUpperCase() === 'COMPLETED' ? 'emerald' : 'amber'} />) 
                                    : <p className="text-[10px] font-medium text-slate-400 italic px-2">No tasks progressed.</p>}
                            </FigmaSection>

                            <FigmaSection title="Materials Consumed">
                                {parsedMaterials.length > 0 
                                    ? parsedMaterials.map((m, i) => <FigmaRow key={i} label={formatName(m, 'inventory')} value={m.quantity || 'Used'} isBlue />) 
                                    : <p className="text-[10px] font-medium text-slate-400 italic px-2">No materials consumed.</p>}
                            </FigmaSection>

                            <FigmaSection title="Equipments Utilized">
                                {parsedEquipment.length > 0 
                                    ? parsedEquipment.map((e, i) => <FigmaRow key={i} label={formatName(e, 'inventory')} value={e.hrsUsed || e.hours || 'Used'} isBlue />) 
                                    : <p className="text-[10px] font-medium text-slate-400 italic px-2">No equipment used.</p>}
                            </FigmaSection>

                            <FigmaSection title="Weekly Budget Estimate">
                                <div className="space-y-2 bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <FigmaRow label="Labour" value={`₹ ${(weekData.budget?.labor || 0).toLocaleString()}`} isBlue />
                                    <FigmaRow label="Material" value={`₹ ${(weekData.budget?.materials || 0).toLocaleString()}`} isBlue />
                                    <FigmaRow label="Equipment" value={`₹ ${(weekData.budget?.equipment || 0).toLocaleString()}`} isBlue />
                                    <FigmaRow label="Sub-contractor" value={`₹ ${(weekData.budget?.subcontractor || 0).toLocaleString()}`} isBlue />
                                    <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-800 dark:text-slate-200 text-[11px]"><span className="uppercase">Total Weekly Spend</span><span className="text-brand-600 dark:text-brand-400">₹ {(weekData.budget?.used || weekData.budget?.total || 0).toLocaleString()}</span></div>
                                </div>
                            </FigmaSection>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Aggregated Photos</label>
                                <div className="grid grid-cols-5 gap-2.5">
                                    {actualPhotos.length > 0 ? actualPhotos.map((photo, i) => (
                                        <SecureMediaFetcher key={i} file={photo} getFileUrl={getFileUrl} isDoc={false} />
                                    )) : <p className="text-[10px] font-medium text-slate-400 col-span-5 px-1 truncate">No photos generated from DPRs this week.</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-3 mt-2">
                                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Aggregated Documents</label>
                                <div className="grid grid-cols-5 gap-2.5">
                                    {actualDocs.length > 0 ? actualDocs.map((doc, i) => (
                                        <SecureMediaFetcher key={i} file={doc} getFileUrl={getFileUrl} isDoc={true} />
                                    )) : <p className="text-[10px] font-medium text-slate-400 col-span-5 px-1 truncate">No documents generated from DPRs this week.</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={28} />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Select a week to aggregate data</p>
                        </div>
                    )}

                    <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-700">
                        <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Next Week Planning</label>
                        {formData.nextWeekTasks.map((t, idx) => (
                            <div key={t.id} className="flex gap-2">
                                <input 
                                    className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 bg-white dark:bg-slate-700/50 transition-all" 
                                    placeholder="Enter planned task..." 
                                    value={t.task}
                                    onChange={(e) => {
                                        const updated = [...formData.nextWeekTasks];
                                        updated[idx].task = e.target.value;
                                        setFormData({...formData, nextWeekTasks: updated});
                                    }}
                                />
                                <button type="button" onClick={() => setFormData({...formData, nextWeekTasks: formData.nextWeekTasks.filter(x => x.id !== t.id)})} className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setFormData({...formData, nextWeekTasks: [...formData.nextWeekTasks, {id: Date.now(), task: '', description: ''}]})} 
                            className="w-full py-2.5 border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-bold text-[11px] uppercase tracking-wide rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex justify-center items-center gap-1.5">+ Add Task</button>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Closing Notes</label>
                        <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} 
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none min-h-[80px] resize-none bg-white dark:bg-slate-700/50 focus:border-brand-500 transition-all" placeholder="Add any notes..."></textarea>
                    </div>

                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <button 
                        onClick={handleSave} 
                        disabled={!weekData || isSaving} 
                        className="w-full py-3 bg-brand-600 text-white font-bold text-[13px] rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                        {isSaving && <Loader2 className="animate-spin" size={16} />} Create WPR
                    </button>
                </div>
            </div>
        </div>
    );
};

const FigmaSection = ({ title, children }) => (
    <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-700">
        <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">{title}</label>
        <div className="space-y-2.5">{children}</div>
    </div>
);

const FigmaRow = ({ label, value, isBlue, badge, color }) => (
    <div className="flex justify-between items-center text-xs px-1">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        {badge ? (
            <span className={`px-2.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide text-white ${color === 'emerald' ? 'bg-[#00B69B]' : color === 'amber' ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'}`}>{badge}</span>
        ) : (
            <span className={`font-bold ${isBlue ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-100'}`}>{value}</span>
        )}
    </div>
);

export default CreateWPRModal;
