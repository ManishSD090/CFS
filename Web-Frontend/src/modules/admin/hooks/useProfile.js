import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile as updateProfileAPI,
  changePassword, // ✅ ADD THIS
} from "../services/profileService";

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Profile
  const updateProfile = async (payload) => {
    try {
      await updateProfileAPI(payload);
      await fetchProfile(); // 🔥 keeps UI in sync
    } catch (err) {
      throw err;
    }
  };

  // ✅ Change Password
  const changePasswordHandler = async (payload) => {
    try {
      const res = await changePassword(payload);
      return res;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile, 
    changePassword: changePasswordHandler, //  correct
  };
}