import React, { useState, useEffect } from 'react';
import { getSuperAdminProfile, updateSuperAdminProfile, changeAdminPassword } from '../services/adminServices';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);

  // Form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminProfile();
      if (res.success) {
        setProfileData(res.data);
      }
    } catch (err) {
      setError('Failed to load profile data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (profileData) {
      setEditFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || ''
      });
      setFormError(null);
      setShowEditProfile(true);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await updateSuperAdminProfile(editFormData);
      if (res.success) {
        setProfileData({ ...profileData, ...res.data });
        setShowEditProfile(false);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const openChangePassword = () => {
    setShowEditProfile(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setFormError(null);
    setShowChangePassword(true);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await changeAdminPassword({ password: passwordData.newPassword });
      if (res.success) {
        setShowChangePassword(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateStr));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-lexend">
        <div className="text-slate-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 font-lexend">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="font-lexend animate-fade-in w-full max-w-[960px]">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1.5">{profileData?.name}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-4 h-4">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
              </svg>
              {profileData?.designation || 'Super Admin'}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-4 h-4">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              User ID: {profileData?.employeeId || `SYS-ADM-${profileData?.id?.substring(0, 4).toUpperCase()}`}
            </div>
          </div>
          <button 
            onClick={handleOpenEdit}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white border-none rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="py-4.5 border-b border-slate-100 dark:border-slate-700 md:pr-10 md:border-r">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Name</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{profileData?.name}</div>
          </div>
          <div className="py-4.5 border-b border-slate-100 dark:border-slate-700 md:pl-10">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Password</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">*********</div>
          </div>
          <div className="py-4.5 border-b border-slate-100 dark:border-slate-700 md:pr-10 md:border-r">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Mobile Number</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{profileData?.phone || 'N/A'}</div>
          </div>
          <div className="py-4.5 border-b border-slate-100 dark:border-slate-700 md:pl-10">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Email Address</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{profileData?.email}</div>
          </div>
          <div className="py-4.5 md:border-b-0 border-slate-100 dark:border-slate-700 md:pr-10 md:border-r">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Account created</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{formatDate(profileData?.createdAt)}</div>
          </div>
          <div className="py-4.5 md:border-b-0 border-slate-100 dark:border-slate-700 md:pl-10">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Last updated</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{formatDate(profileData?.updatedAt)}</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50 p-4 animate-fade-in font-lexend pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 w-full max-w-[360px] relative shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 animate-zoom-in">
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">Edit Profile</div>
            <button 
              onClick={() => setShowEditProfile(false)}
              className="absolute top-[18px] right-[18px] w-7 h-7 bg-red-500 dark:bg-red-500/90 border-none rounded-lg flex items-center justify-center cursor-pointer text-white hover:bg-red-600 transition-colors"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {formError && (
              <div className="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</div>
              <input 
                type="text" 
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                placeholder="Person name" 
                className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none bg-white dark:bg-slate-700 focus:border-brand-600 dark:focus:border-brand-500 transition-colors" 
              />
            </div>
            <div className="mb-4">
              <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</div>
              <input 
                type="email" 
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                placeholder="email@xyz.com" 
                className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none bg-white dark:bg-slate-700 focus:border-brand-600 dark:focus:border-brand-500 transition-colors" 
              />
            </div>
            <div className="mb-4">
              <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</div>
              <input 
                type="tel" 
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                placeholder="+91 09876 34321" 
                className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none bg-white dark:bg-slate-700 focus:border-brand-600 dark:focus:border-brand-500 transition-colors" 
              />
            </div>

            <div className="flex items-center justify-between mt-5 gap-3">
              <button 
                onClick={openChangePassword}
                className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-none border-none cursor-pointer py-2.5 px-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Change Password
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={submitting}
                className="flex items-center justify-center gap-2 flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-[11px] px-5 text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (
                  <>
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-[15px] h-[15px]"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50 p-4 animate-fade-in font-lexend pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 w-full max-w-[360px] relative shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 animate-zoom-in">
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">Change Password</div>
            <button 
              onClick={() => setShowChangePassword(false)}
              className="absolute top-[18px] right-[18px] w-7 h-7 bg-red-500 dark:bg-red-500/90 border-none rounded-lg flex items-center justify-center cursor-pointer text-white hover:bg-red-600 transition-colors"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {formError && (
              <div className="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</div>
              <div className="relative flex items-center">
                <input 
                  type={showPassNew ? 'text' : 'password'} 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New password" 
                  className="w-full pl-3.5 pr-10 py-2.5 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none bg-white dark:bg-slate-700 focus:border-brand-600 dark:focus:border-brand-500 transition-colors" 
                />
                <button onClick={() => setShowPassNew(!showPassNew)} className="absolute right-3 bg-none border-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4.5 h-4.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</div>
              <div className="relative flex items-center">
                <input 
                  type={showPassConf ? 'text' : 'password'} 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm password" 
                  className="w-full pl-3.5 pr-10 py-2.5 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none bg-white dark:bg-slate-700 focus:border-brand-600 dark:focus:border-brand-500 transition-colors" 
                />
                <button onClick={() => setShowPassConf(!showPassConf)} className="absolute right-3 bg-none border-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4.5 h-4.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <button 
              onClick={submitPasswordChange}
              disabled={submitting}
              className="flex items-center justify-center w-full gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-[11px] text-sm font-semibold cursor-pointer transition-colors mt-5 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-[60] p-4 animate-fade-in font-lexend pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl py-8 px-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 animate-zoom-in">
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5">Password Updated Successfully</div>
            <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center mx-auto text-white shadow-md shadow-teal-600/30">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-7 h-7"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
