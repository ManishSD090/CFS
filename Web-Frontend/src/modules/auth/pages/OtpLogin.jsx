/**
 * OTP Login Screen  — /otp
 *
 * Mirrors Flutter otp_screen.dart exactly:
 *   State variables:
 *     identifier        — phone/email input value
 *     otpCode           — otp input value
 *     isIdentifierVisible — eye toggle on identifier field
 *     isOtpVisible      — eye toggle on otp field
 *     otpSent           — bool: OTP has been sent, show OTP field
 *     isSendingOtp      — local loading for the send-OTP call
 *     isVerifying       — loading for verify-OTP call
 *
 *   API calls:
 *     POST /auth/login-with-otp      { identifier }             (auth.routes.js:33)
 *     POST /auth/verify-otp-login    { identifier, otp }        (auth.routes.js:34)
 *     POST /auth/check-status        { identifier }  — via AuthContext after success
 *
 *   Post-login routing:
 *     superAdmin → /superadmin/dashboard
 *     else       → /admin/dashboard
 *
 *   Behavioural notes from Flutter source:
 *     - Identifier field is DISABLED after OTP is sent (enabled: !isLoading && !_otpSent)
 *     - Button text: "Send OTP" → "Continue" after otpSent
 *     - OTP field slides in only after otpSent === true
 *     - On OTP sent: animated "OTP Sent ✓" toast appears (slide from top, auto-dismiss 3s)
 *     - Loading state disables the back arrow button
 *     - Error shown via toast (SnackBar equivalent)
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendOtpAPI, verifyOtpAPI } from "../services/auth.service";
import { setTokens } from "../../admin/services/authStorage";
import { useAuth } from "../context/AuthContext";

// ─── Eye Icon SVG ─────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// ─── OTP Sent Toast ───────────────────────────────────────────────────────────
const OtpSentToast = ({ visible }) => (
  <div
    className={`fixed top-14 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${
      visible ? "opacity-100 -translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-8 pointer-events-none"
    }`}
  >
    <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 min-w-[220px]">
      <p className="text-base font-bold text-gray-900">OTP Sent</p>
      <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  </div>
);

// ─── Error Toast ──────────────────────────────────────────────────────────────
const ErrorToast = ({ message, onDismiss }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        message ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg max-w-xs text-center">
        {message}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function OtpLoginPage() {
  const navigate = useNavigate();
  const { fetchAuthStatus } = useAuth();

  // ── State (mirrors Flutter otp_screen.dart state variables) ──────────────
  const [identifier, setIdentifier]               = useState("");
  const [otpCode, setOtpCode]                     = useState("");
  const [isIdentifierVisible, setIdentifierVisible] = useState(true);
  const [isOtpVisible, setOtpVisible]             = useState(false);
  const [otpSent, setOtpSent]                     = useState(false);
  const [isSendingOtp, setIsSendingOtp]           = useState(false);
  const [isVerifying, setIsVerifying]             = useState(false);
  const [toastVisible, setToastVisible]           = useState(false);
  const [error, setError]                         = useState("");

  const toastTimer = useRef(null);
  const isLoading = isSendingOtp || isVerifying;

  // ── Show animated "OTP Sent" toast (mirrors Flutter's _showTopSuccess) ────
  const showOtpSentToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showError = (msg) => setError(msg);
  const clearError = () => setError("");

  // ── Send OTP  (mirrors _handleSendOtp) ───────────────────────────────────
  // Backend: POST /auth/login-with-otp  { identifier }  (auth.routes.js:33)
  const handleSendOtp = async () => {
    if (!identifier.trim()) { showError("Please enter a phone number or email"); return; }
    clearError();
    setIsSendingOtp(true);
    try {
      await sendOtpAPI(identifier.trim());
      setOtpSent(true);
      showOtpSentToast();
    } catch (e) {
      const msg = e.message || "Failed to send OTP.";
      // Flutter maps 404 → "Phone number not registered."
      showError(msg.includes("404") ? "Phone number not registered." : msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Verify OTP  (mirrors _handleVerifyOtp) ────────────────────────────────
  // Backend: POST /auth/verify-otp-login  { identifier, otp }  (auth.routes.js:34)
  // Then:    POST /auth/check-status      { identifier }        (auth.routes.js:32)
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) { showError("Please enter the OTP"); return; }
    clearError();
    setIsVerifying(true);
    try {
      const data = await verifyOtpAPI(identifier.trim(), otpCode.trim());
      const accessToken = data?.data?.tokens?.accessToken;
      const refreshToken = data?.data?.tokens?.refreshToken;
      if (!accessToken) throw new Error("No token received");

      setTokens({ accessToken, refreshToken });

      // Flutter always calls check-status after OTP login (auth_controller.dart:138)
      await fetchAuthStatus(identifier.trim());

      // Post-login routing: mirrors Flutter otp_screen.dart:235-240
      const userData = data?.data?.user ?? data?.user;
      const roleStr = JSON.stringify(userData?.role ?? userData?.userType ?? "").toUpperCase();
      if (roleStr.includes("SUPERADMIN") || roleStr.includes("SUPER")) {
        navigate("/superadmin/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (e) {
      showError(e.message?.includes("400") || e.message?.includes("401")
        ? "Invalid OTP. Please try again."
        : e.message || "OTP verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleButtonClick = () => {
    if (isLoading) return;
    if (!otpSent) handleSendOtp();
    else handleVerifyOtp();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) handleButtonClick();
  };

  return (
    <div className="relative flex w-full h-screen overflow-hidden bg-white md:bg-transparent select-none">
      {/* Animated OTP Sent Toast */}
      <OtpSentToast visible={toastVisible} />

      {/* Error Toast */}
      <ErrorToast message={error} onDismiss={clearError} />

      {/* Desktop Background */}
      <div
        className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg.jpg')", backgroundColor: "#0B192C" }}
      />
      <div className="absolute inset-0 hidden md:block bg-black/20" />

      <div className="relative z-10 flex w-full h-full">
        {/* Desktop left panel */}
        <div className="hidden md:flex flex-col justify-end flex-1 p-12 lg:p-20 pb-16 lg:pb-24">
          <h1 className="text-white text-[32px] lg:text-[40px] font-bold leading-[1.25] drop-shadow-md">
            Manage Sites. Track Progress.<br />Finish Strong.
          </h1>
        </div>

        {/* Card */}
        <div className="flex items-center justify-center w-full md:w-auto md:pr-12 lg:pr-20">
          <div className="flex flex-col w-full h-full md:h-auto md:w-[420px] lg:w-[460px] bg-white px-8 sm:px-12 py-10 md:py-12 md:rounded-[2rem] md:shadow-2xl overflow-y-auto">

            {/* Back button — disabled while loading (mirrors Flutter's disabled back during load) */}
            <div className="mb-6">
              <Link
                to="/login"
                onClick={(e) => isLoading && e.preventDefault()}
                className={`inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors ${isLoading ? "opacity-40 pointer-events-none" : ""}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src="/Logo ConstructionSite Management.svg" alt="Brand Logo" className="h-10 sm:h-11" />
              <span className="text-[26px] font-bold text-[#0066CC] tracking-tight">SampleWeb</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-center text-[24px] font-bold text-gray-900 tracking-tight">Sign In</h2>
              <p className="text-center text-[13px] font-medium text-gray-400 mt-1">Log in with OTP</p>
            </div>

            <div className="space-y-5">
              {/* ── Identifier field ── */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700">Phone Number / Email</label>
                <div className="relative flex items-center border rounded-2xl border-[#8AB4F8] focus-within:ring-1 focus-within:ring-[#8AB4F8] transition-all">
                  <input
                    type={isIdentifierVisible ? "text" : "password"}
                    id="otp-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={handleKeyDown}
                    // Mirrors Flutter: enabled: !isLoading && !_otpSent
                    disabled={isLoading || otpSent}
                    placeholder={otpSent ? "•••••  •••••" : "Enter phone number / Email"}
                    className={`w-full px-4 py-3 text-[14px] rounded-2xl focus:outline-none bg-transparent placeholder:text-[#C4D7F5] transition-colors ${
                      (isLoading || otpSent) ? "text-gray-400 cursor-not-allowed" : "cursor-text"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIdentifierVisible((v) => !v)}
                    className="absolute right-4 text-[#8AB4F8] hover:text-[#0066CC] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <EyeIcon open={isIdentifierVisible} />
                  </button>
                </div>
              </div>

              {/* ── OTP field — only appears after otpSent (mirrors Flutter conditional rendering) */}
              {otpSent && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[13px] font-bold text-gray-700">OTP</label>
                  <div className="relative flex items-center border rounded-2xl border-[#8AB4F8] focus-within:ring-1 focus-within:ring-[#8AB4F8] transition-all">
                    <input
                      type={isOtpVisible ? "text" : "password"}
                      id="otp-code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter OTP code"
                      autoFocus
                      className="w-full px-4 py-3 text-[14px] rounded-2xl focus:outline-none bg-transparent placeholder:text-[#C4D7F5] cursor-text"
                    />
                    <button
                      type="button"
                      onClick={() => setOtpVisible((v) => !v)}
                      className="absolute right-4 text-[#8AB4F8] hover:text-[#0066CC] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      <EyeIcon open={isOtpVisible} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Button — text mirrors Flutter's: "Send OTP" / "Continue" */}
              <div className="pt-1">
                <button
                  id="otp-submit-btn"
                  type="button"
                  onClick={handleButtonClick}
                  disabled={isLoading}
                  className={`w-full py-3.5 text-white text-[15px] font-bold rounded-xl transition-all shadow-md active:scale-95
                    ${isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-[#0066CC] hover:bg-[#0052a3] cursor-pointer hover:shadow-lg"
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {isSendingOtp ? "Sending..." : "Verifying..."}
                    </span>
                  ) : (
                    otpSent ? "Continue" : "Send OTP"
                  )}
                </button>
              </div>

              {/* Toggle to password login */}
              <div className="flex justify-center pt-1">
                <Link
                  to="/login"
                  className="text-[13px] font-bold text-[#0066CC] hover:underline hover:text-[#0052a3] transition-colors cursor-pointer"
                >
                  Log in with Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
