import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  MapPin,
  Building2,
  Users,
  Edit,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import ManageUsersRoles from "../components/ManageUsersRoles";
import useProfile from "../hooks/useProfile";
import apiClient from "../../../api/apiClient";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users"); // 'personal', 'company', 'users'

  // Fetch profile
  const { profile, loading, error, updateProfile, changePassword } = useProfile();

  // Company details
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Fetch company when tab opens and profile has companyId
  useEffect(() => {
    if (activeTab === 'company' && profile?.companyId && !company) {
      setCompanyLoading(true);
      apiClient.get(`/companies/${profile.companyId}`)
        .then(res => setCompany(res.data?.data || res.data))
        .catch(e => console.error('Company fetch failed', e))
        .finally(() => setCompanyLoading(false));
    }
  }, [activeTab, profile?.companyId]);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleChangePasswordClick = () => {
    setIsEditModalOpen(false);
    setIsPasswordModalOpen(true);
  };

  if (loading) return <div className="p-6 text-slate-500 dark:text-slate-400">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }} className="flex-1 p-4 md:p-6 space-y-5 animate-in fade-in duration-500 pb-20">
      
      {/* ── PROFILE CARD ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <img src={profile?.profilePicture || "https://i.pravatar.cc/80?img=47"} alt={profile?.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-600 flex-shrink-0"/>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile?.name || 'Loading...'}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {profile?.roleName || "Admin"}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  User ID: {profile?.id || 'SYS-ADM-001'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {profile?.companyName || "ABC Infrastructure Pvt Ltd"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm flex-shrink-0">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab('personal')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm transition-colors border-b-2 ${activeTab === 'personal' ? 'font-semibold border-brand-600 text-brand-600 dark:text-brand-400' : 'font-medium border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <User className="w-4 h-4" />
            Personal Information
          </button>
          <button onClick={() => setActiveTab('company')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm transition-colors border-b-2 ${activeTab === 'company' ? 'font-semibold border-brand-600 text-brand-600 dark:text-brand-400' : 'font-medium border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Building2 className="w-4 h-4" />
            Company Details
          </button>
          <button onClick={() => setActiveTab('users')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'font-semibold border-brand-600 text-brand-600 dark:text-brand-400' : 'font-medium border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Users className="w-4 h-4" />
            Manage Users & Roles
          </button>
        </div>

        {/* ─── TAB: PERSONAL INFORMATION ─── */}
        {activeTab === 'personal' && (
          <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</label>
                <input type="text" value={profile?.name || "Rahul Sharma"} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">User ID</label>
                <input type="text" value={profile?.id || "SYS-ADM-001"} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</label>
                <input type="email" value={profile?.email || "rakesh.sharma@abc.com"} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mobile Number</label>
                <input type="tel" value={profile?.phone || "+91 91234 56789"} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                <input type="password" value="password123" readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</label>
                <input type="text" value={profile?.roleName || "Admin"} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Aadhaar Card</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">aadhar.png</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: COMPANY DETAILS ─── */}
        {activeTab === 'company' && (
          <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-2 text-left">
            {companyLoading ? (
              <div className="py-8 flex justify-center"><svg className="animate-spin h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Company Name</label>
                  <input type="text" value={company?.name || profile?.companyName || 'N/A'} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Company ID</label>
                  <input type="text" value={company?.id?.substring(0,12) || 'N/A'} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">GST Number</label>
                  <input type="text" value={company?.gstNumber || 'N/A'} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact Email</label>
                  <input type="text" value={company?.email || 'N/A'} readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none"/>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Company Address</label>
                  <textarea rows="2" readOnly className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm resize-none focus:outline-none" value={company?.address || 'N/A'}></textarea>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: MANAGE USERS & ROLES ─── */}
        {activeTab === 'users' && (
          <div className="p-4 md:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 text-left">
            <ManageUsersRoles />
          </div>
        )}
      </div>

      {/* Modals */}
      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onChangePasswordClick={handleChangePasswordClick}
        profile={profile}
        onSave={updateProfile}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={changePassword}
      />
    </div>
  );
}