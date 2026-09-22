/**
 * Create Company Screen — /superadmin/companies/create
 *
 * Mirrors Flutter create_company.dart exactly:
 *
 *   State variables:
 *     companyName, address, regNo, gst, email, website, phone
 *     adminName, adminEmail, adminPhone
 *     giveAllPermissions (checkbox for admin permissions)
 *     isSubmitting (loading state)
 *
 *   Validation:
 *     Required fields: Company Name, Address, Reg No, GST, Email (valid format), Phone,
 *                      Admin Name, Admin Email (valid format), Admin Phone
 *
 *   API Call:
 *     POST /companies/create
 *     Payload matches superAdminControllerProvider.createCompany
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCompany } from "../services/adminServices";

export default function CreateCompanyPage() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    regNo: "",
    gst: "",
    email: "",
    website: "",
    phone: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });
  const [giveAllPermissions, setGiveAllPermissions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3500);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Submit Handler ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        registrationNumber: formData.regNo.trim(),
        gstNumber: formData.gst.trim(),
        officeAddress: formData.address.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        phone: formData.phone.trim(),
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPhone: formData.adminPhone.trim(),
        permissions: giveAllPermissions ? ["FULL_COMPANY_ACCESS"] : [],
      };

      await createCompany(payload);
      showToast("Company created successfully!");
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      showToast(error.message || "Error creating company", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-[60] px-5 py-3 rounded-lg text-white font-bold shadow-lg transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.message}
        </div>
      )}

      {/* App Bar */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-center px-4 py-4 relative">
        <button onClick={() => navigate(-1)} className="absolute left-4 text-gray-800 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-black text-[18px] font-bold">Create Company</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="px-5 py-5 pb-24 max-w-3xl mx-auto space-y-4">
          
          <Field label="Company name*" name="companyName" value={formData.companyName} onChange={handleChange} hint="ABC Constructions Pvt Ltd" required />
          <Field label="Address*" name="address" value={formData.address} onChange={handleChange} hint="Site no. 24, Andheri East, Mumbai" required />
          
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Registration number*" name="regNo" value={formData.regNo} onChange={handleChange} hint="Reg No" required />
            </div>
            <div className="flex-1">
              <Field label="GST number*" name="gst" value={formData.gst} onChange={handleChange} hint="GSTIN" required />
            </div>
          </div>
          
          <Field label="Email*" name="email" type="email" value={formData.email} onChange={handleChange} hint="admin@company.com" required />
          <Field label="Website" name="website" value={formData.website} onChange={handleChange} hint="www.company.com" />
          <Field label="Phone*" name="phone" type="tel" value={formData.phone} onChange={handleChange} hint="+91 98765 43210" required />

          <div className="pt-4 pb-2 border-b border-gray-200">
            <h3 className="text-[16px] font-black text-gray-900">Admin details</h3>
          </div>

          <Field label="Admin Name*" name="adminName" value={formData.adminName} onChange={handleChange} hint="Rahul Sharma" required />
          <Field label="Email*" name="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} hint="rahul@company.com" required />
          <Field label="Phone*" name="adminPhone" type="tel" value={formData.adminPhone} onChange={handleChange} hint="+91" required />

          <label className="flex items-center gap-3 cursor-pointer mt-2">
            <input type="checkbox" checked={giveAllPermissions} onChange={(e) => setGiveAllPermissions(e.target.checked)} className="w-5 h-5 rounded border-gray-300 accent-[#0066CC]" />
            <span className="text-[14px] text-gray-800">Give all permissions to admin</span>
          </label>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-full font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Processing...
                </span>
              ) : "Create company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shared Field Component ───────────────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, hint, required }) {
  return (
    <div className="flex flex-col">
      <label className="text-[13px] text-gray-800 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={hint}
        required={required}
        className="w-full px-3.5 py-3.5 border border-[#0A6ED1] focus:border-[#0066CC] rounded-xl text-[14px] outline-none transition-colors focus:ring-1 focus:ring-[#0066CC]"
      />
    </div>
  );
}
