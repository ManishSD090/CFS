import React, { useState, useEffect } from 'react';
import { X, Sun, Cloud, CloudRain, Image as ImageIcon, FileText, Trash2, Edit, Loader2 } from 'lucide-react';
import apiClient from '../../../../../api/apiClient';

const DPRDetailsModal = ({ isOpen, onClose, dpr, onDelete }) => {
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        team: [],
        tasks: [],
        inventory: [],
        subcontractors: []
    });

    useEffect(() => {
        if (isOpen && dpr?.projectId) {
            const fetchContextData = async () => {
                setIsFetchingData(true);
                try {
                    const [teamRes, tasksRes, invRes, subsRes] = await Promise.allSettled([
                        apiClient.get(`/projects/${dpr.projectId}/team`),
                        apiClient.get(`/tasks?projectId=${dpr.projectId}`),
                        apiClient.get(`/inventory?projectId=${dpr.projectId}`),
                        apiClient.get(`/subcontractors?projectId=${dpr.projectId}`)
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];

                    setDropdownData({
                        team: extractData(teamRes),
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
    }, [isOpen, dpr]);

    if (!isOpen || !dpr) return null;

    const getTaskName = (id) => {
        const item = dropdownData.tasks.find(t => String(t.id) === String(id) || String(t._id) === String(id));
        return item ? (item.name || item.taskName) : id;
    };
    const getInventoryName = (id) => {
        const item = dropdownData.inventory.find(i => String(i.id) === String(id) || String(i._id) === String(id));
        return item ? (item.name || item.itemName) : id;
    };
    const getUserName = (id) => {
        const item = dropdownData.team.find(u => String(u.id) === String(id) || String(u.userId) === String(id));
        return item ? (item.name || item.fullName) : id;
    };
    const getSubcontractorName = (id) => {
        const item = dropdownData.subcontractors.find(s => String(s.id) === String(id) || String(s._id) === String(id));
        return item ? (item.name || item.companyName) : id;
    };

    const getFileUrl = (file) => {
        if (!file) return '';
        let path = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath);
        if (!path) return '';

        const filename = path.split(/[/\\]/).pop().split('?')[0];
        return `/uploads/dpr-photos/${filename}`; // Adjust based on your API routing
    };

    const getWeatherIcon = (weather) => {
        if (!weather) return <Sun className="w-4 h-4" />;
        const w = weather.toLowerCase();
        if (w.includes('cloud')) return <Cloud className="w-4 h-4" />;
        if (w.includes('rain')) return <CloudRain className="w-4 h-4" />;
        return <Sun className="w-4 h-4" />;
    };

    const safeJSONParse = (data, fallback = []) => {
        if (!data) return fallback;
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } catch (_error) { return fallback; }
    };

    const parsedTasks = safeJSONParse(dpr.completedWork);
    const parsedMaterials = safeJSONParse(dpr.materialsUsed);
    const parsedEquipments = safeJSONParse(dpr.equipmentsUsed || dpr.equipmentUsed);
    const parsedSubcontractors = safeJSONParse(dpr.subcontractors);
    const parsedNextDayTasks = safeJSONParse(dpr.nextDayTasks || dpr.nextDayPlan);

    const attendance = dpr.attendances || {};
    const budget = dpr.budget || {};
    
    const allMedia = dpr.photos || [];
    
    const actualPhotos = allMedia.filter(media => {
        const url = (typeof media === 'string' ? media : (media.imageUrl || media.url || '')).toLowerCase();
        return !url.match(/\.(pdf|doc|docx|txt)$/i); 
    });

    const actualDocs = allMedia.filter(media => {
        const url = (typeof media === 'string' ? media : (media.imageUrl || media.url || '')).toLowerCase();
        return url.match(/\.(pdf|doc|docx|txt)$/i); 
    });

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
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
                            <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <div>
                            <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">DPR Details</h2>
                            <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                                {dpr.project?.name || 'Project'} | {dpr.reportNo || `DPR-${dpr.projectId?.substring(0, 4)}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={() => alert("Edit Modal Integration Pending")} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => onDelete(dpr.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold hover:bg-red-500 hover:text-white transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    
                    <section>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                Site Visitor: <span className="font-semibold text-slate-600 dark:text-slate-400 capitalize">{getUserName(dpr.visitorId) || 'No visitors recorded'}</span>
                            </span>
                            <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-bold capitalize bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg">
                                {getWeatherIcon(dpr.weather)} {dpr.weather || 'Sunny'}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Work Description</span>
                            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                                {dpr.workDescription || dpr.description || 'No description provided for this date.'}
                            </p>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                        
                        <DataSection title="Attendance" subTitle="Daily Count">
                            <Row label="Workers" value={`${dpr.totalWorkers || attendance.workers || dpr.workersPresent || 0}`} isBlue />
                            <Row label="Staff" value={`${dpr.staffCount || attendance.staff || dpr.staffPresent || 0}`} isBlue />
                        </DataSection>

                        <DataSection title="Tasks Completed">
                            {parsedTasks.length > 0 ? (
                                parsedTasks.map((taskId, idx) => (
                                    <Row key={idx} label={`Task ${idx + 1}`} value={getTaskName(taskId)} badge="emerald" />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-semibold">No tasks recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Materials Consumed">
                            {parsedMaterials.length > 0 ? (
                                parsedMaterials.map((m, idx) => (
                                    <Row key={idx} label={getInventoryName(m.materialId)} value={`${m.quantity} Units`} isBlue />
                                ))
                            ) : dpr.materialConsumptions?.length > 0 ? (
                                dpr.materialConsumptions.map((m, idx) => (
                                    <Row key={idx} label={m.material?.name || 'Material'} value={`${m.quantity} ${m.unit || ''}`} isBlue />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-semibold">No materials recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Equipments Used">
                            {parsedEquipments.length > 0 ? (
                                parsedEquipments.map((e, idx) => (
                                    <Row key={idx} label={getInventoryName(e.equipmentId)} value={`${e.hrsUsed || e.hours || 0} Hrs`} isBlue />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-semibold">No equipment recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Sub-contractors On Site">
                            {parsedSubcontractors.length > 0 ? (
                                parsedSubcontractors.map((subId, idx) => (
                                    <Row key={idx} label={`Sub-contractor ${idx+1}`} value={getSubcontractorName(subId)} isBold />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-semibold">No sub-contractors recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Budget Utilized">
                            <Row label="Labour Cost" value={`₹ ${(budget.labor || dpr.laborCost || 0).toLocaleString()}`} isBold />
                            <Row label="Material Cost" value={`₹ ${(budget.materials || dpr.materialsCost || 0).toLocaleString()}`} isBold />
                            <Row label="Equipment Cost" value={`₹ ${(budget.equipment || dpr.equipmentCost || 0).toLocaleString()}`} isBold />
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-between font-bold text-slate-800 dark:text-slate-200 text-[11px] mt-1">
                                <span className="uppercase">Total Utilized</span>
                                <span className="text-brand-600 dark:text-brand-400">₹ {(budget.used || dpr.budgetUsed || 0).toLocaleString()}</span>
                            </div>
                        </DataSection>

                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Site Photos</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {actualPhotos.length > 0 ? actualPhotos.map((photo, idx) => {
                                    const url = getFileUrl(photo);
                                    return (
                                        <a href={url} target="_blank" rel="noreferrer" key={idx} className="block group relative">
                                            <img 
                                                src={url} 
                                                alt={`Photo ${idx+1}`} 
                                                className="aspect-square w-full object-cover rounded-xl border border-slate-200 dark:border-slate-600 hover:border-brand-500 transition-colors bg-slate-50 dark:bg-slate-800 shadow-sm" 
                                                onError={(e) => { 
                                                    e.target.style.display = 'none'; 
                                                    e.target.nextSibling.style.display = 'flex'; 
                                                }}
                                            />
                                            <div style={{display: 'none'}} className="aspect-square border border-slate-100 dark:border-slate-700 rounded-xl flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-300">
                                                <ImageIcon className="w-5 h-5 mb-1" />
                                                <span className="text-[8px] font-bold text-center px-1">Missing</span>
                                            </div>
                                        </a>
                                    );
                                }) : (
                                    <p className="text-[11px] font-medium text-slate-400 col-span-4 italic">No photos uploaded.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Documents</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {actualDocs.length > 0 ? actualDocs.map((doc, idx) => {
                                    const url = getFileUrl(doc);
                                    const title = doc.title || doc.name || url.split('/').pop() || `Document ${idx + 1}`;
                                    return (
                                        <a href={url} target="_blank" rel="noreferrer" key={idx} className="aspect-square border border-slate-200 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 dark:hover:border-brand-700 transition-all text-brand-500 p-2 text-center shadow-sm">
                                            <FileText className="w-6 h-6 mb-1.5" />
                                            <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 truncate w-full px-1 leading-tight" title={title}>{title}</span>
                                        </a>
                                    );
                                }) : (
                                    <p className="text-[11px] font-medium text-slate-400 col-span-4 italic">No documents uploaded.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/40 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Next Day Planning</span>
                                {parsedNextDayTasks.length > 0 ? (
                                    <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                                        {parsedNextDayTasks.map((taskId, idx) => <li key={idx}>{getTaskName(taskId)}</li>)}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{dpr.nextDayPlan || 'No tasks planned.'}</p>
                                )}
                            </div>

                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-800/40 shadow-sm">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Notes / Issues</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-wrap">
                                    {dpr.notes || dpr.remarks || dpr.challenges || dpr.issuesFound || 'No additional notes provided.'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const DataSection = ({ title, subTitle, children }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
            <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">{title}</h3>
            {subTitle && <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded uppercase tracking-widest">{subTitle}</span>}
        </div>
        <div className="space-y-2.5">{children}</div>
    </div>
);

const Row = ({ label, value, badge, isBlue, isBold }) => (
    <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
        {badge ? (
            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase text-white ${
                badge === 'emerald' ? 'bg-[#00A86B]' : badge === 'yellow' ? 'bg-[#FBBF24]' : 'bg-[#EF4444]'
            }`}>{value}</span>
        ) : (
            <span className={`text-xs font-bold ${isBlue ? 'text-brand-600 dark:text-brand-400' : isBold ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>{value}</span>
        )}
    </div>
);

export default DPRDetailsModal;
