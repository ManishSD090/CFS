/**
 * Verification Screen — /verification
 *
 * Mirrors Flutter verification_screen.dart exactly:
 *
 *   Main screen state (from authStatusProvider + authControllerProvider):
 *     authStatus.emailVerified   — bool
 *     authStatus.phoneVerified   — bool
 *     authStatus.needsPassword   — bool (for Continue button routing)
 *     user.email                 — displayed in card
 *     user.phone                 — displayed in card
 *     isFullyVerified = emailVerified && phoneVerified
 *     canContinue     = emailVerified || phoneVerified
 *
 *   OTP Bottom Sheet (OtpVerificationModal) state:
 *     otpSent    — bool: OTP has been sent (auto-sent on open)
 *     isLoading  — bool: covers both send and verify
 *     otpCode    — string
 *
 *   API calls:
 *     POST /verification/request-otp  { identifier }              (verification.routes.js:14)
 *         → identifier = user.email (method='email') or user.phone (method='phone')
 *     POST /verification/verify-otp   { identifier, otp, type }   (verification.routes.js:15)
 *         → type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION'     (auth_controller.dart:216)
 *     GET  /auth/profile              (after successful verify, to refresh user)
 *     POST /auth/check-status         (to update authStatus)
 *
 *   Behavioural notes from Flutter source:
 *     - OTP is auto-sent when the bottom sheet opens (_sendOtp in initState)
 *     - Bottom sheet closes on success (Navigator.pop)
 *     - Success SnackBar: "{METHOD} verified successfully!"
 *     - Failure: SnackBar "Invalid OTP"
 *     - Continue button: green if fully verified, blue if partial
 *     - On Continue: if needsPassword → navigate to /setup-account, else go back to /admin/dashboard
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { requestVerificationOtpAPI, verifyCodeAPI } from "../services/auth.service";

// ─── Verification Item Card ───────────────────────────────────────────────────
// Mirrors Flutter _buildVerificationItem widget
function VerificationCard({ title, value, isVerified, icon, onVerifyTap }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${isVerified ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
      {/* Icon circle */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? "bg-green-100" : "bg-blue-100"}`}>
        {isVerified ? (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-blue-600">{icon}</span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-[15px] font-semibold text-gray-800 truncate">{value}</p>
      </div>

      {/* Action */}
      {isVerified ? (
        <span className="text-xs font-bold text-green-600 flex-shrink-0">Verified</span>
      ) : (
        <button
          type="button"
          onClick={onVerifyTap}
          className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
        >
          VERIFY
        </button>
      )}
    </div>
  );
}

// ─── OTP Verification Modal (Bottom Sheet) ────────────────────────────────────
// Mirrors Flutter OtpVerificationSheet widget
function OtpVerificationModal({ method, user, onClose, onSuccess }) {
  const { fetchAuthStatus, refreshProfile } = useAuth();

  // identifier is email for 'email', phone for 'phone' (mirrors auth_controller.dart:189)
  const identifier = method === "email" ? user?.email : user?.phone;
  const methodLabel = method === "email" ? "Email" : "Phone";

  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error"); // "error" | "success"

  const showToast = (msg, type = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Auto-send OTP on mount (mirrors Flutter's initState → _sendOtp())
  // Backend: POST /verification/request-otp  { identifier }  (verification.routes.js:14)
  const sendOtp = async () => {
    if (!identifier) {
      showToast(`No ${method} found for this user.`);
      onClose();
      return;
    }
    setIsLoading(true);
    try {
      await requestVerificationOtpAPI(identifier);
      setOtpSent(true);
    } catch (e) {
      showToast(`Failed to send OTP: ${e.message}`);
      setTimeout(onClose, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Run once on mount
  useState(() => { sendOtp(); }, []);

  // Verify OTP
  // Backend: POST /verification/verify-otp  { identifier, otp, type }  (verification.routes.js:15)
  // type = 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION'  (auth_controller.dart:216)
  const verifyOtp = async () => {
    if (otpCode.trim().length < 4) return;
    setIsLoading(true);
    try {
      const verificationType = method === "email" ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";
      await verifyCodeAPI(identifier, otpCode.trim(), verificationType);

      // Refresh profile + status (mirrors auth_controller.dart:225-226)
      await refreshProfile();
      await fetchAuthStatus(identifier);

      showToast(`${methodLabel} verified successfully!`, "success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch {
      setIsLoading(false);
      showToast("Invalid OTP");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet — slides up from bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl px-6 pb-8 pt-6 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Verify {methodLabel}
        </h3>

        {/* Toast */}
        {toastMsg && (
          <div className={`text-sm font-semibold rounded-lg px-4 py-2 mb-3 ${toastType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {toastMsg}
          </div>
        )}

        {/* Loading spinner when sending OTP initially */}
        {!otpSent && isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-5">
              Enter the OTP sent to your {method}.
            </p>

            <input
              type="number"
              id={`otp-verify-${method}`}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && verifyOtp()}
              placeholder="Enter OTP"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-[#8AB4F8] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all placeholder:text-[#C4D7F5] mb-5"
            />

            {isLoading ? (
              <div className="flex justify-center">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : (
              <button
                type="button"
                id={`confirm-otp-${method}`}
                onClick={verifyOtp}
                className="w-full py-3.5 bg-[#0066CC] hover:bg-[#0052a3] text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Confirm
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Main Verification Screen ─────────────────────────────────────────────────
export default function VerificationPage() {
  const navigate = useNavigate();
  const { user, authStatus } = useAuth();

  const [activeModal, setActiveModal] = useState(null); // 'email' | 'phone' | null

  if (!authStatus) {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  // Mirrors Flutter:
  //   final isFullyVerified = authStatus.emailVerified && authStatus.phoneVerified
  //   final canContinue = authStatus.emailVerified || authStatus.phoneVerified
  const isFullyVerified = authStatus.emailVerified && authStatus.phoneVerified;
  const canContinue = authStatus.emailVerified || authStatus.phoneVerified;

  // Mirrors Flutter Continue button: needsPassword → setPassword, else pop
  const handleContinue = () => {
    if (authStatus.needsPassword) {
      navigate("/setup-account");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">Verification</h1>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-6 py-6 max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your details</h2>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
          Please verify your contact information to secure your account and access all features.
        </p>

        {/* Email verification item */}
        <VerificationCard
          title="Email Address"
          value={user?.email || "No Email"}
          isVerified={authStatus.emailVerified}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          onVerifyTap={() => setActiveModal("email")}
        />

        <div className="h-5" />

        {/* Phone verification item */}
        <VerificationCard
          title="Phone Number"
          value={user?.phone || "No Phone"}
          isVerified={authStatus.phoneVerified}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          onVerifyTap={() => setActiveModal("phone")}
        />

        {/* Spacer pushes Continue button to bottom */}
        <div className="flex-1" />

        {/* Continue button — only shown if canContinue (mirrors Flutter) */}
        {canContinue && (
          <button
            id="verification-continue-btn"
            type="button"
            onClick={handleContinue}
            className={`w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md
              ${isFullyVerified ? "bg-green-500 hover:bg-green-600" : "bg-[#0066CC] hover:bg-[#0052a3]"}`}
          >
            {isFullyVerified && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isFullyVerified ? "Everything Verified! Continue" : "Continue"}
          </button>
        )}
      </div>

      {/* OTP Bottom Sheet Modal */}
      {activeModal && (
        <OtpVerificationModal
          method={activeModal}
          user={user}
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
