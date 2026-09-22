import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../../../../api/apiClient';

const CreateDPRModal = ({ isOpen, onClose, projectId, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);

    const [dropdownData, setDropdownData] = useState({
        visitors: [],
        tasks: [],
        inventory: [],
        subcontractors: []
    });

    const [formData, setFormData] = useState({
        dprDate: '',
        visitorId: '',
        description: '',
        weather: 'Sunny',
        workersCount: '',
        staffCount: '',
        notes: ''
    });

    const [completedTasks, setCompletedTasks] = useState(['']);
    const [selectedSubcontractors, setSelectedSubcontractors] = useState(['']);
    const [nextDayTasks, setNextDayTasks] = useState(['']);
    const [materialsUsed, setMaterialsUsed] = useState([{ materialId: '', quantity: 1 }]);
    const [equipmentsUsed, setEquipmentsUsed] = useState([{ equipmentId: '', hrsUsed: 1 }]);

    const [sitePhotos, setSitePhotos] = useState([]);
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (isOpen && projectId) {
            const fetchModalData = async () => {
                setIsFetchingData(true);
                try {
                    const [teamRes, tasksRes, invRes, subsRes] = await Promise.allSettled([
                        apiClient.get(`/projects/${projectId}/team`),
                        apiClient.get(`/tasks?projectId=${projectId}`), 
                        apiClient.get(`/inventory?projectId=${projectId}`), 
                        apiClient.get(`/subcontractors?projectId=${projectId}`)
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];

                    setDropdownData({
                        visitors: extractData(teamRes),
                        tasks: extractData(tasksRes),
                        inventory: extractData(invRes), 
                        subcontractors: extractData(subsRes)
                    });
                } catch (error) {
                    console.error("Failed to load dropdown data:", error);
                } finally {
                    setIsFetchingData(false);
                }
            };
            fetchModalData();
        } else {
            setSitePhotos([]);
            setDocuments([]);
            setFormData({
                dprDate: '', visitorId: '', description: '', weather: 'Sunny', workersCount: '', staffCount: '', notes: ''
            });
            setCompletedTasks(['']);
            setSelectedSubcontractors(['']);
            setNextDayTasks(['']);
            setMaterialsUsed([{ materialId: '', quantity: 1 }]);
            setEquipmentsUsed([{ equipmentId: '', hrsUsed: 1 }]);
        }
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    const updateList = (setter, index, value) => setter(prev => { const n = [...prev]; n[index] = value; return n; });
    const addToList = (setter) => setter(prev => [...prev, '']);
    const removeFromList = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

    const updateObjectList = (setter, index, field, value) => setter(prev => { const n = [...prev]; n[index][field] = value; return n; });
    const addObjectToList = (setter, defaultObj) => setter(prev => [...prev, defaultObj]);

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'photos') setSitePhotos(prev => [...prev, ...files]);
        if (type === 'documents') setDocuments(prev => [...prev, ...files]);
    };
    
    const removeFile = (index, type) => {
        if (type === 'photos') setSitePhotos(prev => prev.filter((_, i) => i !== index));
        if (type === 'documents') setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const payload = {
                projectId,
                date: formData.dprDate,
                visitorId: formData.visitorId,
                workDescription: formData.description,
                weather: formData.weather,
                workersCount: Number(formData.workersCount),
                staffCount: Number(formData.staffCount),
                notes: formData.notes,
                completedWork: JSON.stringify(completedTasks.filter(t => t !== '')),
                subcontractors: JSON.stringify(selectedSubcontractors.filter(s => s !== '')),
                nextDayTasks: JSON.stringify(nextDayTasks.filter(t => t !== '')),
                materialsUsed: JSON.stringify(materialsUsed.filter(m => m.materialId !== '')),
                equipmentsUsed: JSON.stringify(equipmentsUsed.filter(eq => eq.equipmentId !== ''))
            };

            const dprResponse = await apiClient.post(`/dpr`, payload);
            const newDprId = dprResponse.data?.data?.id || dprResponse.data?.id;

            if (newDprId && (sitePhotos.length > 0 || documents.length > 0)) {
                const allFiles = [...sitePhotos, ...documents];
                const uploadPromises = [];

                for (const file of allFiles) {
                    const photoData = new FormData();
                    photoData.append('dprId', newDprId);
                    photoData.append('file', file); 
                    photoData.append('title', file.name); 

                    uploadPromises.push(
                        apiClient.post(`/dpr-photos/upload`, photoData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        })
                    );
                }

                const results = await Promise.allSettled(uploadPromises);
                const failedUploads = results.filter(r => r.status === 'rejected');
                
                if (failedUploads.length > 0) {
                    console.error("Media Upload Failures:", failedUploads);
                    const errorMessage = failedUploads[0].reason?.response?.data?.message || "Unknown Upload Error";
                    alert(`DPR Created, but media failed to upload! Backend says: "${errorMessage}"`);
                }
            }
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Submission Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to create DPR. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 flex flex-col animate-in zoom-in-95 duration-200">
                
                {isFetchingData && (
                    <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Loading Site Data...</p>
                    </div>
                )}

                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 shrink-0">
                    <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Create Daily Progress Report</h2>
                    <button onClick={onClose} disabled={isFetchingData} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors disabled:opacity-50">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <form id="dpr-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">DPR Date</label>
                                <input type="date" required value={formData.dprDate} onChange={e => setFormData({...formData, dprDate: e.target.value})} 
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Site Visitor</label>
                                <select required value={formData.visitorId} onChange={e => setFormData({...formData, visitorId: e.target.value})} 
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
                                    <option value="">Select visitor</option>
                                    {dropdownData.visitors.map(v => (
                                        <option key={v.id || v._id || v.userId} value={v.id || v._id || v.userId}>{v.name || v.fullName || 'Unnamed Visitor'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Work Description</label>
                            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter the description" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Weather</label>
                            <div className="flex flex-wrap gap-2">
                                {['Sunny', 'Cloudy', 'Rainy'].map(w => (
                                    <button key={w} type="button" onClick={() => setFormData({...formData, weather: w})} 
                                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors border ${formData.weather === w ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/30 dark:border-brand-400 dark:text-brand-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Daily Attendance</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2">
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-16">Workers</span>
                                    <input type="number" required value={formData.workersCount} onChange={e => setFormData({...formData, workersCount: e.target.value})} className="w-full text-right text-sm font-bold text-slate-800 dark:text-slate-100 outline-none bg-transparent" placeholder="0" min="0" />
                                </div>
                                <div className="flex items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2">
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-16">Staff</span>
                                    <input type="number" required value={formData.staffCount} onChange={e => setFormData({...formData, staffCount: e.target.value})} className="w-full text-right text-sm font-bold text-slate-800 dark:text-slate-100 outline-none bg-transparent" placeholder="0" min="0" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tasks Completed</label>
                            {completedTasks.map((task, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select value={task} onChange={(e) => updateList(setCompletedTasks, index, e.target.value)} 
                                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                        <option value="">Select task</option>
                                        {dropdownData.tasks.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.taskName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setCompletedTasks, index)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setCompletedTasks)} className="w-full py-2.5 border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-bold text-[11px] uppercase tracking-wide rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex justify-center items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5"/> Add Task
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Consumed Materials</label>
                            {materialsUsed.map((material, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select value={material.materialId} onChange={(e) => updateObjectList(setMaterialsUsed, index, 'materialId', e.target.value)} 
                                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                        <option value="">Select material</option>
                                        {dropdownData.inventory.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.itemName}</option>)}
                                    </select>
                                    <div className="flex items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shrink-0">
                                        <button type="button" onClick={() => updateObjectList(setMaterialsUsed, index, 'quantity', Math.max(1, material.quantity - 1))} className="px-3 py-2.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 font-bold">-</button>
                                        <input type="number" value={material.quantity} onChange={(e) => updateObjectList(setMaterialsUsed, index, 'quantity', Number(e.target.value))} className="w-10 text-center text-sm font-bold text-slate-800 dark:text-slate-200 outline-none bg-transparent" min="1" />
                                        <button type="button" onClick={() => updateObjectList(setMaterialsUsed, index, 'quantity', material.quantity + 1)} className="px-3 py-2.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 font-bold">+</button>
                                    </div>
                                    <button type="button" onClick={() => removeFromList(setMaterialsUsed, index)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addObjectToList(setMaterialsUsed, { materialId: '', quantity: 1 })} className="w-full py-2.5 border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-bold text-[11px] uppercase tracking-wide rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex justify-center items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5"/> Add Material
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Equipments Used (Hrs)</label>
                            {equipmentsUsed.map((equipment, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select value={equipment.equipmentId} onChange={(e) => updateObjectList(setEquipmentsUsed, index, 'equipmentId', e.target.value)} 
                                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                        <option value="">Select equipment</option>
                                        {dropdownData.inventory.map(eq => <option key={eq.id || eq._id} value={eq.id || eq._id}>{eq.name || eq.itemName}</option>)}
                                    </select>
                                    <div className="flex items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shrink-0">
                                        <button type="button" onClick={() => updateObjectList(setEquipmentsUsed, index, 'hrsUsed', Math.max(1, equipment.hrsUsed - 1))} className="px-3 py-2.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 font-bold">-</button>
                                        <input type="number" value={equipment.hrsUsed} onChange={(e) => updateObjectList(setEquipmentsUsed, index, 'hrsUsed', Number(e.target.value))} className="w-10 text-center text-sm font-bold text-slate-800 dark:text-slate-200 outline-none bg-transparent" min="1" />
                                        <button type="button" onClick={() => updateObjectList(setEquipmentsUsed, index, 'hrsUsed', equipment.hrsUsed + 1)} className="px-3 py-2.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 font-bold">+</button>
                                    </div>
                                    <button type="button" onClick={() => removeFromList(setEquipmentsUsed, index)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addObjectToList(setEquipmentsUsed, { equipmentId: '', hrsUsed: 1 })} className="w-full py-2.5 border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-bold text-[11px] uppercase tracking-wide rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex justify-center items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5"/> Add Equipment
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sub-contractors</label>
                            {selectedSubcontractors.map((sub, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select value={sub} onChange={(e) => updateList(setSelectedSubcontractors, index, e.target.value)} 
                                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                        <option value="">Select sub-contractor</option>
                                        {dropdownData.subcontractors.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.companyName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setSelectedSubcontractors, index)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setSelectedSubcontractors)} className="w-full py-2.5 border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-bold text-[11px] uppercase tracking-wide rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex justify-center items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5"/> Add Sub-contractor
                            </button>
                        </div>

                        <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Site Photos</label>
                                <label className="flex flex-col items-center justify-center w-full py-6 bg-brand-50/50 dark:bg-brand-900/20 border-2 border-dashed border-brand-200 dark:border-brand-800 rounded-2xl cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-colors">
                                    <ImageIcon className="text-brand-500 mb-1.5" size={20} />
                                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">Click to upload</span>
                                    <span className="text-[10px] font-medium text-slate-400 mt-1">JPG, PNG up to 10MB</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'photos')} />
                                </label>
                                
                                {sitePhotos.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto mt-3 pb-2 pt-2">
                                        {sitePhotos.map((file, i) => (
                                            <div key={i} className="relative w-16 h-16 shrink-0 group">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm" />
                                                <button type="button" onClick={() => removeFile(i, 'photos')} className="absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-red-500 rounded-full p-0.5 hover:bg-red-50 shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100">
                                                    <X size={12}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Documents</label>
                                <label className="flex flex-col items-center justify-center w-full py-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <FileText className="text-brand-500 mb-1.5" size={20} />
                                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">Click to upload</span>
                                    <span className="text-[10px] font-medium text-slate-400 mt-1">PDF, DOC up to 10MB</span>
                                    <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'documents')} />
                                </label>
                                
                                {documents.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto mt-3 pb-2 pt-2">
                                        {documents.map((file, i) => (
                                            <div key={i} className="relative w-16 h-16 shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center group shadow-sm">
                                                <FileText className="text-blue-500 mb-1" size={16} />
                                                <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 truncate w-full px-1 text-center">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(i, 'documents')} className="absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-red-500 rounded-full p-0.5 hover:bg-red-50 shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100">
                                                    <X size={12}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Next Day Planning</label>
                            {nextDayTasks.map((task, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select value={task} onChange={(e) => updateList(setNextDayTasks, index, e.target.value)} 
                                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                        <option value="">Select task</option>
                                        {dropdownData.tasks.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.taskName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setNextDayTasks, index)} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setNextDayTasks)} className="w-full py-2.5 border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-bold text-[11px] uppercase tracking-wide rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all flex justify-center items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5"/> Add Task
                            </button>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Notes</label>
                            <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add any notes..." 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"></textarea>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button form="dpr-form" type="submit" disabled={isSubmitting || isFetchingData} className="w-full py-3 bg-brand-600 text-white font-bold text-[13px] rounded-xl hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting && <Loader2 className="animate-spin" size={16} />} Create DPR
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateDPRModal;
