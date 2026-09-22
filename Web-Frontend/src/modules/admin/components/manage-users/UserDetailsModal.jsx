import React, { useState } from 'react';
import { X, ChevronLeft, FileText, KeyRound, Loader2, UserCog } from 'lucide-react';
import { resetUserPasswordAPI, updateUserRoleAPI } from '../../services/userService';

export default function UserDetailsModal({ isOpen, onClose, user, roles = [], onSuccess }) {
    const [view, setView] = useState('details'); // 'details' | 'resetPassword' | 'changeRole'
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !user) return null;

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
        if (newPassword !== confirmPassword) { alert('Passwords do not match'); return; }
        setIsSubmitting(true);
        try {
            await resetUserPasswordAPI(user.id, newPassword);
            alert('Password reset successfully');
            setNewPassword('');
            setConfirmPassword('');
            setView('details');
        } catch (err) {
            alert(err.message || 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeRole = async (e) => {
        e.preventDefault();
        if (!selectedRoleId) { alert('Please select a role'); return; }
        setIsSubmitting(true);
        try {
            await updateUserRoleAPI(user.id, selectedRoleId);
            alert('Role updated successfully');
            setView('details');
            onSuccess?.();
        } catch (err) {
            alert(err.message || 'Failed to update role');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start gap-4 px-5 pt-5 pb-4">
                    <button
                        onClick={view === 'details' ? onClose : () => setView('details')}
                        className="mt-1 text-slate-400 hover:text-brand-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">
                            {view === 'details' ? user.name : view === 'resetPassword' ? 'Reset Password' : 'Change Role'}
                        </h3>
                        {view === 'details' && (
                            <>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {user.employeeId || user.id?.substring(0, 8)}</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 capitalize">{user.role?.name || 'Unassigned Role'}</p>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Body */}
                {view === 'details' && (
                    <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Name</p>
                                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{user.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Email Address</p>
                                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate" title={user.email}>{user.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Mobile Number</p>
                                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{user.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Project assigned</p>
                                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{user.projects?.length > 0 ? user.projects.map(p => p.name).join(', ') : 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Status</p>
                                <p className={`text-[12px] font-bold ${user.isActive ? 'text-green-500' : 'text-slate-500'}`}>{user.isActive ? 'Active User' : 'Inactive'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Role</p>
                                <p className="text-[13px] font-semibold text-brand-600 dark:text-brand-400">{user.role?.name || 'Unassigned'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Aadhaar Card</p>
                            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 w-fit">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                    {user.aadhaarNo ? `aadhaar_${user.aadhaarNo}.png` : 'No document uploaded'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => { setSelectedRoleId(user.role?.id || ''); setView('changeRole'); }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                            >
                                <UserCog className="w-3.5 h-3.5" /> Change Role
                            </button>
                            <button
                                onClick={() => setView('resetPassword')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            >
                                <KeyRound className="w-3.5 h-3.5" /> Reset Password
                            </button>
                        </div>
                    </div>
                )}

                {view === 'resetPassword' && (
                    <form onSubmit={handleResetPassword} className="border-t border-slate-100 dark:border-slate-700 px-5 py-5 space-y-4">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-400"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {view === 'changeRole' && (
                    <form onSubmit={handleChangeRole} className="border-t border-slate-100 dark:border-slate-700 px-5 py-5 space-y-4">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Select New Role</label>
                            <select
                                value={selectedRoleId}
                                onChange={e => setSelectedRoleId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-brand-400"
                            >
                                <option value="">Select a role...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedRoleId}
                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                            {isSubmitting ? 'Updating...' : 'Update Role'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
