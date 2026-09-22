import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createRoleAPI } from '../../services/roleService';

const MODULES = ['Projects', 'Tasks', 'Attendance', 'Timeline', 'Materials', 'Expenses', 'Documents', 'Sub-contractor', 'Report'];

export default function CreateRoleModal({ isOpen, onClose, projects = [], onSuccess }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProjects, setSelectedProjects] = useState(['']); // Start with one empty dropdown
    const [permissions, setPermissions] = useState(
        MODULES.reduce((acc, mod) => ({ ...acc, [mod]: { view: false, create: false } }), {})
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const togglePermission = (mod, type) => {
        setPermissions(prev => ({
            ...prev,
            [mod]: { ...prev[mod], [type]: !prev[mod][type] }
        }));
    };

    const handleProjectChange = (index, value) => {
        const newProjects = [...selectedProjects];
        newProjects[index] = value;
        setSelectedProjects(newProjects);
    };

    const addProjectDropdown = () => {
        setSelectedProjects([...selectedProjects, '']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Transform permissions for backend payload expectations
        let formattedPermissions = [];
        Object.keys(permissions).forEach(mod => {
            const codeBase = mod.toUpperCase().replace('-', '_');
            if (permissions[mod].view) formattedPermissions.push(`${codeBase}_VIEW`);
            if (permissions[mod].create) formattedPermissions.push(`${codeBase}_EDIT`);
        });

        const pIds = selectedProjects.filter(id => id !== '');

        if (!name.trim()) {
            setError("Role Name is required");
            return;
        }

        setLoading(true);
        try {
            await createRoleAPI({
                name,
                description,
                permissions: formattedPermissions,
                projectIds: pIds.length > 0 ? pIds : undefined
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to create role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10">
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Create Role</h3>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {error && <div className="p-3 bg-red-50 text-red-500 text-xs font-semibold rounded-xl">{error}</div>}

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Role Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter the role name"
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-brand-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 focus:outline-none"/>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Role Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter the role description"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm placeholder-slate-300 focus:outline-none focus:border-brand-400"/>
                    </div>

                    {/* Projects Add */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Projects</label>
                        <div className="space-y-2">
                            {selectedProjects.map((pVal, idx) => (
                                <select key={idx} value={pVal} onChange={e => handleProjectChange(idx, e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-400">
                                    <option value="">Select project name...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            ))}
                        </div>
                        <button type="button" onClick={addProjectDropdown} className="flex items-center justify-center gap-1.5 w-full border border-dashed border-brand-300 dark:border-brand-700 rounded-xl py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                            + Add Project
                        </button>
                    </div>

                    {/* Matrix */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Permissions</label>
                        <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                            <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Module</span>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center">View</span>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center">Create/Edit</span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {MODULES.map(mod => (
                                    <div key={mod} className="grid grid-cols-3 px-4 py-2.5 items-center">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{mod}</span>
                                        <div className="flex justify-center">
                                            <input type="checkbox" checked={permissions[mod].view} onChange={() => togglePermission(mod, 'view')} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"/>
                                        </div>
                                        <div className="flex justify-center">
                                            <input type="checkbox" checked={permissions[mod].create} onChange={() => togglePermission(mod, 'create')} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="px-5 pb-5">
                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13px] font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Role'}
                    </button>
                </div>
            </div>
        </div>
    );
}
