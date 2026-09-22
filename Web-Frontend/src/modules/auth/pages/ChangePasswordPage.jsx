/**
 * Change Password Page — /change-password
 *
 * Mirrors Flutter change_pass_screen.dart exactly:
 *
 *   State variables:
 *     currentStep    — 0 = enter old password, 1 = enter new + confirm
 *     isLoading      — bool: covers the API call
 *     obscureOld     — visibility toggle for current password field
 *     obscureNew     — visibility toggle for new password field
 *     obscureConfirm — visibility toggle for confirm password field
 *
 *   Two-step form with AnimatedSwitcher (slide-from-right + fade):
 *     Step 0: "Enter your old Password" field
 *     Step 1: "New Password" + "Confirm Password" fields
 *
 *   Back button behaviour:
 *     Step 1 → goes back to Step 0  (not navigate(-1))
 *     Step 0 → navigate(-1)          (closes screen)
 *   This mirrors Flutter's PopScope canPop: _currentStep == 0
 *
 *   Validation:
 *     Step 0: currentPassword required
 *     Step 1: newPassword min 6 chars; confirmPassword must match newPassword
 *
 *   API call:
 *     POST /auth/change-password  { currentPassword, newPassword }   (auth.routes.js:44)
 *     Requires Bearer token — sent automatically by apiClient interceptor
 *
 *   Post-success:
 *     Toast "Password changed successfully" (green)
 *     navigate(-1)  or  navigate(onSuccessRoute) if provided via location.state
 *
 *   Error:
 *     Toast with backend error message (mirrors Flutter: replaceAll("Exception:", "").trim())
 */

import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { changePasswordAPI } from "../services/auth.service";

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// ─── Password Field ───────────────────────────────────────────────────────────
function PasswordField({ id, value, onChange, obscure, onToggle, placeholder, error, onKeyDown }) {
  return (
    <div>
      <div className={`relative flex items-center border rounded-xl transition-all focus-within:ring-1 ${error ? "border-red-400 focus-within:ring-red-300" : "border-[#0066CC] focus-within:ring-[#8AB4F8]"}`}>
        <input
          id={id}
          type={obscure ? "password" : "text"}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 text-[14px] rounded-xl focus:outline-none bg-transparent placeholder:text-[#C4D7F5] cursor-text"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 text-[#8AB4F8] hover:text-[#0066CC] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          <EyeIcon open={!obscure} />
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        message ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className={`text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg max-w-xs text-center ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
        {message}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Optional success route passed as location.state (mirrors Flutter onSuccessRoute)
  const onSuccessRoute = location.state?.onSuccessRoute ?? null;

  // ── State (mirrors Flutter _ChangePasswordScreenState) ────────────────────
  const [currentStep, setCurrentStep]   = useState(0);   // 0=old pass, 1=new+confirm
  const [isLoading, setIsLoading]       = useState(false);
  const [obscureOld, setObscureOld]     = useState(true);
  const [obscureNew, setObscureNew]     = useState(true);
  const [obscureConfirm, setObscureConfirm] = useState(true);

  const [oldPassword, setOldPassword]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Per-step validation errors
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState({ message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type }), 4000);
  };

  // ── Back logic (mirrors Flutter _handleBack + PopScope) ───────────────────
  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0); // Go back to step 1 without leaving
      setErrors({});
    } else {
      navigate(-1);
    }
  };

  // ── Step validation ────────────────────────────────────────────────────────
  const validateStep0 = () => {
    if (!oldPassword.trim()) {
      setErrors({ old: "Enter current password" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep1 = () => {
    const errs = {};
    if (!newPassword || newPassword.length < 6) errs.new = "Password must be at least 6 characters";
    if (confirmPassword !== newPassword) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Continue / Submit ──────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (currentStep === 0) {
      if (validateStep0()) setCurrentStep(1);
    } else {
      if (validateStep1()) await submitChangePassword();
    }
  };

  // Backend: POST /auth/change-password  { currentPassword, newPassword }  (auth.routes.js:44)
  const submitChangePassword = async () => {
    setIsLoading(true);
    try {
      await changePasswordAPI(oldPassword.trim(), newPassword.trim());
      showToast("Password changed successfully", "success");
      setTimeout(() => {
        if (onSuccessRoute) navigate(onSuccessRoute);
        else navigate(-1);
      }, 1200);
    } catch (e) {
      // Mirrors Flutter: e.toString().replaceAll("Exception:", "").trim()
      const msg = (e.message ?? "Failed to change password.")
        .replace(/^Error:\s*/i, "")
        .trim();
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) handleContinue();
  };

  // ── Slide direction — step 1 slides in from right, mirroring AnimatedSwitcher
  const slideClass = currentStep === 1
    ? "animate-in slide-in-from-right-4 fade-in duration-300"
    : "animate-in slide-in-from-left-4 fade-in duration-300";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toast message={toast.message} type={toast.type} />

      {/* App Bar — blue background mirrors Flutter AppColors.primaryBlue */}
      <div className="flex items-center gap-3 px-4 py-4 bg-[#0066CC]">
        <button
          type="button"
          onClick={handleBack}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-semibold text-[16px]">Edit Profile</h1>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-5 pt-10 pb-6 max-w-lg mx-auto w-full">
        <h2 className="text-center text-[22px] font-semibold text-gray-800 mb-10">
          Change Password
        </h2>

        {/* Animated form area — mirrors Flutter AnimatedSwitcher */}
        <div className={`flex-1 ${slideClass}`} key={currentStep}>
          {currentStep === 0 ? (
            /* Step 0: Old Password */
            <div>
              <label className="text-[14px] font-medium text-gray-700 mb-2 block">
                Enter your old Password
              </label>
              <PasswordField
                id="old-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                obscure={obscureOld}
                onToggle={() => setObscureOld((v) => !v)}
                placeholder="Enter password"
                error={errors.old}
                onKeyDown={handleKeyDown}
              />
            </div>
          ) : (
            /* Step 1: New + Confirm Password */
            <div className="space-y-5">
              <div>
                <label className="text-[14px] font-medium text-gray-700 mb-2 block">
                  New Password
                </label>
                <PasswordField
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  obscure={obscureNew}
                  onToggle={() => setObscureNew((v) => !v)}
                  placeholder="New password"
                  error={errors.new}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <label className="text-[14px] font-medium text-gray-700 mb-2 block">
                  Confirm Password
                </label>
                <PasswordField
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  obscure={obscureConfirm}
                  onToggle={() => setObscureConfirm((v) => !v)}
                  placeholder="Confirm password"
                  error={errors.confirm}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}
        </div>

        {/* Continue button — shared position (mirrors Flutter's bottom button) */}
        <button
          id="change-password-continue-btn"
          type="button"
          onClick={handleContinue}
          disabled={isLoading}
          className={`w-full h-12 rounded-full font-bold text-[16px] text-white transition-all mt-6
            ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-[#0066CC] hover:bg-[#0052a3] cursor-pointer active:scale-95"}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Updating...
            </span>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}
