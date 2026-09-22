/**
 * Company Details Page — /superadmin/companies/:id
 *
 * Mirrors Flutter company_details.dart:
 *
 *   State variables:
 *     company         — current company data object
 *     isProcessing    — loading state for admin actions and status toggles
 *     isLoadingFresh  — loading state for initial fetch
 *     activeAdmin     — tracks which admin is being edited in the bottom sheet
 *     adminForm       — holds name, email, phone for adding/editing admins
 *     showAdminModal  — visibility toggle for admin sheet
 *     showStatusModal — visibility toggle for suspend/activate sheet
 *     statusChecked   — confirmation checkbox for status toggle
 *
 *   Sub-sections:
 *     - Header: Company Name, Edit Button, ID, Created Date, Status Tag
 *     - Stats Row: Clients, Projects, Users
 *     - Company Details: Reg No, GST No, Email, Phone, Address
 *     - Admin Details: List of admins (Name, Edit Icon, Email, Phone) + "Add Admin" button
 *     - Admin Permissions Modal (UI placeholder mirrored from Flutter)
 *     - Suspend/Activate Action Button at bottom
 *
 *   API Calls:
 *     GET   /companies/:companyId
 *     POST  /companies/:companyId/admins
 *     PUT   /companies/:companyId/admins/:adminId
 *     PATCH /companies/:companyId/status
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCompanyDetails,
  addCompanyAdmin,
  updateCompanyAdmin,
  updateCompanyStatus,
} from "../services/adminServices";

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────
  const [company, setCompany] = useState(null);
  const [isLoadingFresh, setIsLoadingFresh] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Admin Form Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeAdmin, setActiveAdmin] = useState(null); // null = Create, object = Edit
  const [adminForm, setAdminForm] = useState({ name: "", email: "", phone: "" });

  // Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3500);
  };

  // ── Data Fetching ──────────────────────────────────────────────────────
  const fetchFreshDetails = async () => {
    try {
      const res = await fetchCompanyDetails(id);
      if (res.success) {
        setCompany(res.data);
      }
    } catch (e) {
      showToast(e.message || "Failed to load company details", "error");
    } finally {
      setIsLoadingFresh(false);
    }
  };

  useEffect(() => {
    fetchFreshDetails();
    // eslint-disable-next-line
  }, [id]);

  // ── Admin Handlers ─────────────────────────────────────────────────────
  const handleOpenAdminModal = (admin = null) => {
    setActiveAdmin(admin);
    if (admin) {
      setAdminForm({ name: admin.name, email: admin.email || "", phone: admin.phone || "" });
    } else {
      setAdminForm({ name: "", email: "", phone: "" });
    }
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email) {
      showToast("Name and Email are required", "error");
      return;
    }
    setIsProcessing(true);
    try {
      if (activeAdmin) {
        // Update Admin
        await updateCompanyAdmin(company.id, activeAdmin.id, adminForm);
        showToast("Admin updated successfully");
      } else {
        // Create Admin (auto sets FULL_COMPANY_ACCESS per Flutter spec)
        await addCompanyAdmin(company.id, {
          ...adminForm,
          userType: "COMPANY_ADMIN",
          permissions: ["FULL_COMPANY_ACCESS"],
        });
        showToast("Admin added successfully");
      }
      setShowAdminModal(false);
      fetchFreshDetails();
    } catch (error) {
      showToast(error.message || "Failed to save admin", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Status Toggle Handlers ─────────────────────────────────────────────
  const performStatusChange = async (newStatus) => {
    setIsProcessing(true);
    try {
      await updateCompanyStatus(company.id, newStatus);
      showToast(newStatus ? "Company Activated!" : "Company Suspended!");
      setShowStatusModal(false);
      fetchFreshDetails();
    } catch (error) {
      showToast(error.message || "Failed to change status", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── UI Helpers ─────────────────────────────────────────────────────────
  const getMonthName = (monthIndex) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[monthIndex];
  };

  if (isLoadingFresh && !company) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!company) return <div className="p-6 text-center text-red-500">Company not found</div>;

  const admins = company.admins || [];
  const isActive = company.isActive ?? true;
  const projectCount = company.counts?.projects || 0;
  const userCount = company.counts?.users || 0;
  const clientCount = company.counts?.clients || 0;

  const createdDate = new Date(company.createdAt || Date.now());
  const formattedDate = `${createdDate.getDate()} ${getMonthName(createdDate.getMonth())} ${createdDate.getFullYear()}`;

  const statusColor = isActive ? "bg-[#28A745]" : "bg-[#DC3545]"; // AppColors.tagGreen / tagRed

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-lg text-white font-bold shadow-lg transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.message}
        </div>
      )}

      {/* App Bar */}
      <div className="bg-[#0066CC] flex items-center px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-white mr-3 hover:bg-white/10 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-white text-[18px] font-bold flex-1">Company details</h1>
        {isLoadingFresh && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 pb-24 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h2 className="text-[22px] font-bold leading-snug text-gray-900">{company.name || "N/A"}</h2>
            <button
              onClick={() => navigate(`/superadmin/companies/edit/${company.id}`, { state: { company } })}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors ml-2"
            >
              <svg className="w-5 h-5 text-[#0066CC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
          </div>

          <p className="text-[13px] text-gray-500 mt-1">ID - {company.id?.substring(0, 8) || "..."}</p>

          <div className="flex justify-between items-center mt-4">
            <p className="text-[13px] text-gray-500">Created on: {formattedDate}</p>
            <div className={`px-4 py-1.5 rounded text-[13px] font-bold text-white ${statusColor}`}>
              {isActive ? "Active" : "Suspended"}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-6">
            {[
              { label: "Total clients", val: clientCount },
              { label: "Total Projects", val: projectCount },
              { label: "Total Users", val: userCount },
            ].map((stat, i) => (
              <div key={i} className="flex-1 border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-[18px] font-bold text-gray-900">{stat.val}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Company Details */}
          <h3 className="text-[16px] font-bold text-gray-900 mt-8 mb-4">Company details</h3>
          <div className="space-y-4">
            <DetailRow label="Registration Number" value={company.registrationNumber || "N/A"} />
            <DetailRow label="GST Number" value={company.gstNumber || "N/A"} />
            <DetailRow label="Email" value={company.email || "N/A"} isLink />
            <DetailRow label="Phone" value={company.phone || "N/A"} />
            <DetailRow label="Address" value={company.officeAddress || "N/A"} />
          </div>

          {/* Admin Details */}
          <div className="flex justify-between items-center mt-8 mb-2">
            <h3 className="text-[16px] font-bold text-gray-900">Admin details</h3>
            <button onClick={() => handleOpenAdminModal()} className="flex items-center gap-1 text-[#0066CC] text-[13px] font-semibold hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Add Admin
            </button>
          </div>
          <hr className="mb-4" />

          {admins.length > 0 ? (
            admins.map((admin) => (
              <div key={admin.id || admin._id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[15px] font-bold text-gray-900">{admin.name}</h4>
                  <button onClick={() => handleOpenAdminModal(admin)} className="p-1 text-[#0066CC] hover:bg-blue-50 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                </div>
                <div className="space-y-2">
                  <DetailRow label="Email" value={admin.email} isCompact />
                  <DetailRow label="Phone" value={admin.phone} isCompact />
                </div>
              </div>
            ))
          ) : (
            <div className="py-5 text-center">
              <span className="text-[#DC3545] font-medium text-[14px]">No Admin Assigned</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
        <button
          onClick={() => { setStatusChecked(false); setShowStatusModal(true); }}
          className={`w-full py-4 rounded-full font-bold text-white text-[15px] transition-all active:scale-95 ${isActive ? "bg-[#DC3545] hover:bg-red-700" : "bg-[#28A745] hover:bg-green-700"}`}
        >
          {isActive ? "Suspend company" : "Activate company"}
        </button>
      </div>

      {/* Admin Bottom Sheet Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end animate-in fade-in" onClick={() => setShowAdminModal(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pt-8 shadow-2xl animate-in slide-in-from-bottom-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-[20px] font-bold text-gray-900 mb-5">
              {activeAdmin ? "Update Admin Details" : "Add Company Admin"}
            </h3>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Full Name</label>
                <input required type="text" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] focus:border-[#0066CC] outline-none" placeholder="Enter admin name" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Email Address</label>
                <input required type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] focus:border-[#0066CC] outline-none" placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-1">Phone Number</label>
                <input type="tel" value={adminForm.phone} onChange={e => setAdminForm({...adminForm, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[14px] focus:border-[#0066CC] outline-none" placeholder="Enter phone" />
              </div>
              <button disabled={isProcessing} type="submit" className="w-full py-4 mt-4 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-full font-bold transition-colors disabled:bg-blue-300">
                {isProcessing ? "Processing..." : (activeAdmin ? "Save Changes" : "Create Admin")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Status Confirmation Bottom Sheet */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end animate-in fade-in" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 pt-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-8" onClick={e => e.stopPropagation()}>
            <h3 className={`text-[20px] font-bold mb-4 ${isActive ? "text-[#DC3545]" : "text-[#28A745]"}`}>
              {isActive ? "Suspend Company? ⚠️" : "Activate Company? ✅"}
            </h3>
            <p className="text-[15px] text-gray-800 leading-relaxed mb-6">
              Are you sure you want to proceed for <span className="font-bold">{company.name}</span>?
            </p>
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={statusChecked} onChange={e => setStatusChecked(e.target.checked)} className={`w-6 h-6 rounded border-gray-300 accent-${isActive ? 'red' : 'green'}-600`} />
              <span className="text-[13px] text-gray-700">I confirm this action</span>
            </label>
            <button
              disabled={!statusChecked || isProcessing}
              onClick={() => performStatusChange(!isActive)}
              className={`w-full py-4 rounded-full font-bold text-white transition-colors disabled:opacity-50 ${isActive ? "bg-[#DC3545]" : "bg-[#28A745]"}`}
            >
              {isProcessing ? "Processing..." : (isActive ? "Suspend company" : "Activate company")}
            </button>
            <div className="text-center mt-4">
              <button onClick={() => setShowStatusModal(false)} className="text-[14px] font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Shared Subcomponents ──────────────────────────────────────────────────
function DetailRow({ label, value, isLink, isCompact }) {
  return (
    <div className={isCompact ? "mb-2" : "mb-4"}>
      <p className="text-[12px] text-gray-500 mb-0.5">{label}</p>
      <p className={`text-[14px] font-medium ${isLink ? "text-[#0066CC]" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}
