import React, { useState } from 'react';
import { X, ChevronLeft, UploadCloud, Loader2 } from 'lucide-react';
import { createUserAPI } from '../../services/userService';

// Tailwind animations are configured in tailwind config or global css (fadeUp)
export default function CreateUserModal({ isOpen, onClose, roles = [], projects = [], onSuccess }) {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', roleId: '', projectIds: [], aadhaarNo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Reformat payload for backend API
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password || "defaultPass123", // Basic mock if password is omitted in UI
                roleId: formData.roleId,
                aadhaarNo: formData.aadhaarNo,
                projectIds: formData.projectIds.length > 0 ? formData.projectIds : undefined,
                employeeId: "EMP-TEMP",
                designation: "N/A",
                department: "General"
            };
            await createUserAPI(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10">
                    <button onClick={onClose} className="text-slate-500 hover:text-brand-600 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 flex-1">Create User</h3>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-5 space-y-4">
                        {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-800/50">{error}</div>}
                        
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"/>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User Email</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone Number</label>
                                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"/>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Aadhaar Card Number</label>
                            <input type="text" maxLength="12" pattern="\d{12}" placeholder="12 digit Aadhaar" required value={formData.aadhaarNo} onChange={e => setFormData({...formData, aadhaarNo: e.target.value.replace(/\D/g, '')})}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all tracking-widest font-mono"/>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Project</label>
                                <select value={formData.projectIds[0] || ''} onChange={e => setFormData({...formData, projectIds: e.target.value ? [e.target.value] : []})}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                    <option value="">None</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Role Name</label>
                                <select required value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-500 transition-all">
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Aadhaar Document</label>
                            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                                <UploadCloud className="w-5 h-5 text-brand-500" />
                                <span className="text-sm text-brand-600 font-bold">Select file</span>
                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"/>
                            </label>
                            <p className="text-[10px] text-slate-400 font-medium">Upload a jpeg, jpg, png, pdf no larger than 10 MB</p>
                        </div>
                    </div>

                    <div className="px-5 pb-5">
                        <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13px] font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
