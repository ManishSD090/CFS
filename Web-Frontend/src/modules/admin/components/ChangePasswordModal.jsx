import { useEffect, useRef, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  currentPassword: "",
  newPassword: "",
};

const INITIAL_UI = { loading: false, success: null, error: null };

// ─── PasswordInput ────────────────────────────────────────────────────────────
function PasswordInput({ label, id, placeholder, value, onChange, show, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── FeedbackMessage ──────────────────────────────────────────────────────────
function FeedbackMessage({ success, error }) {
  if (!success && !error) return null;
  return (
    <div
      className={`text-sm font-medium px-3 py-2 rounded-lg ${
        success
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {success || error}
    </div>
  );
}

// ─── ChangePasswordModal ──────────────────────────────────────────────────────
export default function ChangePasswordModal({ open, onClose, onChangePassword }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [ui, setUi] = useState(INITIAL_UI);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const backdropRef = useRef(null);

  // ESC closes modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Reset on close
  const handleClose = () => {
    setForm(INITIAL_FORM);
    setUi(INITIAL_UI);
    setShowCurrent(false);
    setShowNew(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) handleClose();
  };

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // API integration (simplified)
  const handleSubmit = async () => {
    setUi(INITIAL_UI);

    if (!form.currentPassword || !form.newPassword) {
      setUi({ loading: false, success: null, error: "All fields are required." });
      return;
    }

    if (form.newPassword.length < 8) {
      setUi({
        loading: false,
        success: null,
        error: "Password must be at least 8 characters.",
      });
      return;
    }

    try {
      setUi({ loading: true, success: null, error: null });

      await onChangePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setUi({
        loading: false,
        success: "Password updated successfully.",
        error: null,
      });

      setForm(INITIAL_FORM);
    } catch (err) {
      setUi({
        loading: false,
        success: null,
        error: err.message || "Failed to update password",
      });
    }
  };

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-modal-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            id="change-password-title"
            className="text-lg font-semibold text-gray-900"
          >
            Change Password
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <PasswordInput
            label="Current Password"
            id="current-password"
            placeholder="Current password"
            value={form.currentPassword}
            onChange={handleChange("currentPassword")}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
          />

          <PasswordInput
            label="New Password"
            id="new-password"
            placeholder="New password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />

          <FeedbackMessage success={ui.success} error={ui.error} />
        </div>

        {/* Action */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={ui.loading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {ui.loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Updating…
              </span>
            ) : (
              "Update password"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        .animate-modal-in {
          animation: modal-in 0.18s ease-out both;
        }
        .z-60 { z-index: 60; }
      `}</style>
    </div>
  );
}