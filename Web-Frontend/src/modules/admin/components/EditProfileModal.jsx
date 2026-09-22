import { useEffect, useRef, useState } from "react";
import { X, Pencil } from "lucide-react";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
};

function InputField({ label, id, type = "text", placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
  );
}

export default function EditProfileModal({
  open,
  onClose,
  onChangePasswordClick,
  profile,
  onSave,
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  // ✅ NEW
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const backdropRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prefill form
  useEffect(() => {
    if (open && profile) {
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });

      setError(""); // reset error

      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, profile]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ✅ UPDATED (real API flow)
  const handleEditProfile = async () => {
    try {
      setSaving(true);
      setError("");

      await onSave(form); // API call from parent

      onClose();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-modal-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-red-500 text-white rounded-lg"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <InputField
            label="Name"
            id="edit-name"
            value={form.name}
            onChange={handleChange("name")}
          />
          <InputField
            label="Email"
            id="edit-email"
            value={form.email}
            onChange={handleChange("email")}
          />
          <InputField
            label="Phone"
            id="edit-phone"
            value={form.phone}
            onChange={handleChange("phone")}
          />
        </div>

        {/* ✅ Error Message */}
        {error && (
          <div className="text-sm text-red-500 mt-3">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button onClick={onChangePasswordClick}>
            Change Password
          </button>

          <button
            onClick={handleEditProfile}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            <Pencil size={13} />
            {saving ? "Saving..." : "Edit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}