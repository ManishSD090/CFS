import React, { useState, useEffect } from 'react';
import { X, Edit, Save, XCircle, Loader2 } from 'lucide-react';
import { getRoleByIdAPI, updateRoleAPI, updateRolePermissionsAPI } from '../../services/roleService';

const MODULES = [
  { key: 'USER_MANAGEMENT',       label: 'User Management',       prefix: 'USER' },
  { key: 'PROJECT_MANAGEMENT',    label: 'Project Management',    prefix: 'PROJECT' },
  { key: 'TASK_MANAGEMENT',       label: 'Task Management',       prefix: 'TASK' },
  { key: 'ATTENDANCE_MANAGEMENT', label: 'Attendance Management', prefix: 'ATTENDANCE' },
  { key: 'DPR_MANAGEMENT',        label: 'DPR Management',        prefix: 'DPR' },
  { key: 'MATERIAL_MANAGEMENT',   label: 'Material Management',   prefix: 'MATERIAL' },
  { key: 'EQUIPMENT_MANAGEMENT',  label: 'Equipment Management',  prefix: 'EQUIPMENT' },
  { key: 'EXPENSE_MANAGEMENT',    label: 'Expense Management',    prefix: 'EXPENSE' },
  { key: 'CLIENT_MANAGEMENT',     label: 'Client Management',     prefix: 'CLIENT' },
  { key: 'CONTRACTOR_MANAGEMENT', label: 'Contractor Management', prefix: 'CONTRACTOR' },
  { key: 'PAYROLL_MANAGEMENT',    label: 'Payroll Management',    prefix: 'PAYROLL' },
  { key: 'REPORTS',               label: 'Reports',               prefix: 'REPORTS' },
  { key: 'SETTINGS_MANAGEMENT',   label: 'Settings Management',   prefix: 'SETTINGS' },
];

function getViewCodes(prefix) {
  return [`${prefix}_READ`, `VIEW_ALL_${prefix}`, `${prefix}_VIEW`, `VIEW_ALL_${prefix}S`];
}
function getEditCodes(prefix) {
  return [`${prefix}_CREATE`, `${prefix}_UPDATE`, `${prefix}_DELETE`, `${prefix}_APPROVE`, `${prefix}_MANAGE`];
}

export default function RoleDetailsModal({ isOpen, onClose, roleId, onSuccess }) {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState(new Set());

  useEffect(() => {
    if (isOpen && roleId) {
      setIsEditing(false);
      loadRole();
    }
  }, [isOpen, roleId]);

  const loadRole = async () => {
    setIsLoading(true);
    try {
      const res = await getRoleByIdAPI(roleId);
      const data = res?.data || res;
      setRole(data);
      setRoleName(data.name || '');
      setRoleDesc(data.description || '');
      const codes = new Set((data.permissions || []).map(p => p.code).filter(Boolean));
      setSelectedPerms(codes);
    } catch (e) {
      alert('Failed to load role: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isViewChecked = (prefix) => getViewCodes(prefix).some(c => selectedPerms.has(c));
  const isEditChecked = (prefix) => getEditCodes(prefix).some(c => selectedPerms.has(c));

  const toggleViewPerm = (prefix, checked) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (checked) getViewCodes(prefix).forEach(c => next.add(c));
      else getViewCodes(prefix).forEach(c => next.delete(c));
      return next;
    });
  };

  const toggleEditPerm = (prefix, checked) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (checked) getEditCodes(prefix).forEach(c => next.add(c));
      else getEditCodes(prefix).forEach(c => next.delete(c));
      return next;
    });
  };

  const handleSave = async () => {
    if (!roleName.trim()) { alert('Role name is required'); return; }
    setIsSaving(true);
    try {
      await updateRoleAPI(roleId, { name: roleName, description: roleDesc });
      await updateRolePermissionsAPI(roleId, [...selectedPerms]);
      setIsEditing(false);
      onSuccess?.();
      loadRole();
    } catch (e) {
      alert('Failed to save: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (role) {
      setRoleName(role.name || '');
      setRoleDesc(role.description || '');
      const codes = new Set((role.permissions || []).map(p => p.code).filter(Boolean));
      setSelectedPerms(codes);
    }
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ fontFamily: "'Lexend', sans-serif" }}
      className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {isEditing ? 'Edit Role' : 'Role Details'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {/* Role Info Card */}
              <div className="bg-brand-50/60 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">Role Details</p>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={roleName}
                      onChange={e => setRoleName(e.target.value)}
                      placeholder="Role Name"
                      className="w-full text-xl font-bold bg-transparent border-b-2 border-brand-400 outline-none text-slate-800 dark:text-white pb-1"
                    />
                    <input
                      type="text"
                      value={roleDesc}
                      onChange={e => setRoleDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full text-sm bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none text-slate-600 dark:text-slate-300 pb-1"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{roleName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{roleDesc || 'No description provided.'}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded font-bold">
                        {role?.stats?.users ?? 0} users assigned
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Permissions Matrix */}
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Permissions</p>
                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_80px_80px] bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Module</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center">View</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Edit</span>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {MODULES.map(mod => (
                      <div key={mod.key} className="grid grid-cols-[1fr_80px_80px] px-4 py-2.5 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{mod.label}</span>
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={isViewChecked(mod.prefix)}
                            disabled={!isEditing}
                            onChange={e => toggleViewPerm(mod.prefix, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-60 cursor-pointer disabled:cursor-default"
                          />
                        </div>
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={isEditChecked(mod.prefix)}
                            disabled={!isEditing}
                            onChange={e => toggleEditPerm(mod.prefix, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-60 cursor-pointer disabled:cursor-default"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer — only shown in edit mode */}
            {isEditing && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shrink-0 flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
