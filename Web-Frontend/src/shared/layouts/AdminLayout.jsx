/**
 * AdminLayout.jsx
 *
 * Mirrors Flutter main_layout.dart:
 *   - On mount: reads authStatus (needsVerification, needsPassword)
 *   - Shows a blocking overlay popup (DashboardPopupType):
 *       - DashboardPopupType.verification → "Verification Required" popup
 *       - DashboardPopupType.setPassword  → "Set Your Password" popup
 *       - DashboardPopupType.none         → no popup
 *
 *   Popup content (mirrors _buildDynamicPopupContent):
 *     Verification popup:
 *       - Title: "Verification Required"
 *       - Message: "Please verify your {method} to unlock full features."
 *       - Primary button: "VERIFY NOW" → navigate to /verification
 *       - Secondary button: "Continue" (shown if partially verified)
 *       - "Remind me later" closes popup
 *
 *     Set Password popup:
 *       - Title: "Set Your Password"
 *       - Message: "You are currently logged in via OTP. Set a password for easier access."
 *       - Primary button: "SET PASSWORD" → navigate to /setup-account
 *       - "Remind me later" closes popup
 *
 *   Backdrop tap closes popup (mirrors GestureDetector wrapping container).
 */

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import { useAuth } from "../../modules/auth/context/AuthContext";

// ── Popup type enum (mirrors Flutter DashboardPopupType) ─────────────────────
const POPUP = { NONE: "none", VERIFICATION: "verification", SET_PASSWORD: "setPassword" };

// ── Lock / Email icon ─────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg className="w-7 h-7 text-[#0D6EFD]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-7 h-7 text-[#0D6EFD]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// ── Post-login Popup (mirrors Flutter _buildDynamicPopupContent) ─────────────
function DashboardPopup({ type, authStatus, onClose }) {
  const navigate = useNavigate();

  // Mirrors Flutter: what "method" to show in verification message
  const verificationMethod =
    !authStatus?.emailVerified ? "email" :
    !authStatus?.phoneVerified ? "phone number" : "account";

  // Partially verified = at least one method is verified (shows secondary Continue btn)
  const isPartiallyVerified =
    authStatus?.emailVerified || authStatus?.phoneVerified;

  const config = type === POPUP.VERIFICATION
    ? {
        icon: <MailIcon />,
        title: "Verification Required",
        message: `Please verify your ${verificationMethod} to unlock full features.`,
        btnText: "VERIFY NOW",
        onAction: () => { onClose(); navigate("/verification"); },
        secondary: isPartiallyVerified
          ? {
              text: "Continue",
              onPress: () => {
                onClose();
                if (authStatus?.needsPassword) navigate("/setup-account");
              },
            }
          : null,
      }
    : {
        icon: <LockIcon />,
        title: "Set Your Password",
        message: "You are currently logged in via OTP. Set a password for easier access.",
        btnText: "SET PASSWORD",
        onAction: () => { onClose(); navigate("/setup-account"); },
        secondary: null,
      };

  return (
    <>
      {/* Backdrop — tap to close (mirrors Flutter GestureDetector) */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Popup card — positioned bottom-center (mirrors Flutter Positioned bottom:30) */}
      <div className="fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Icon circle */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              {config.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-[18px] font-bold text-gray-800 mb-2">
            {config.title}
          </h3>

          {/* Message */}
          <p className="text-center text-[14px] text-gray-500 leading-snug mb-5">
            {config.message}
          </p>

          {/* Primary action button */}
          <button
            id={`popup-${type}-primary`}
            type="button"
            onClick={config.onAction}
            className="w-full h-11 bg-[#0D6EFD] hover:bg-blue-700 text-white font-bold text-[14px] rounded-xl transition-all active:scale-95 mb-2"
          >
            {config.btnText}
          </button>

          {/* Secondary action button (only for partial verification) */}
          {config.secondary && (
            <button
              id={`popup-${type}-secondary`}
              type="button"
              onClick={config.secondary.onPress}
              className="w-full h-11 border border-[#0D6EFD] text-[#0D6EFD] font-bold text-[14px] rounded-xl transition-all hover:bg-blue-50 active:scale-95 mb-2"
            >
              {config.secondary.text}
            </button>
          )}

          {/* Remind me later */}
          <button
            id={`popup-${type}-dismiss`}
            type="button"
            onClick={onClose}
            className="w-full py-2 text-[13px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Remind me later
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authStatus } = useAuth();

  // Popup state — mirrors Flutter _currentPopup: DashboardPopupType
  const [currentPopup, setCurrentPopup] = useState(POPUP.NONE);

  // Mirrors Flutter _checkAuthStatus() in initState
  useEffect(() => {
    if (!authStatus) return;
    if (authStatus.needsVerification) {
      setCurrentPopup(POPUP.VERIFICATION);
    } else if (authStatus.needsPassword) {
      setCurrentPopup(POPUP.SET_PASSWORD);
    } else {
      setCurrentPopup(POPUP.NONE);
    }
  }, [authStatus]);

  const closePopup = () => setCurrentPopup(POPUP.NONE);

  return (
    <div className="font-sans bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <Header title="Admin Projects" onMenuClick={() => setSidebarOpen(true)} />
        <Outlet />
      </div>

      {/* Post-login overlay popup — mirrors Flutter's popup Stack layer */}
      {currentPopup !== POPUP.NONE && (
        <DashboardPopup
          type={currentPopup}
          authStatus={authStatus}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
