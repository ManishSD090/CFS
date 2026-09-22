import { createContext, useContext, useState, useCallback } from "react";
import { loginAPI, verifyOtpAPI, checkAccountStatusAPI } from "../services/auth.service";
import { setTokens, clearTokens, getAccessToken } from "../../admin/services/authStorage";
import apiClient from "../../../api/apiClient";

const AuthContext = createContext();

// Default auth status — mirrors Flutter's AuthActionStatus model
const DEFAULT_STATUS = {
  needsPassword: false,
  needsVerification: false,
  emailVerified: true,
  phoneVerified: true,
  accountStatus: "ACTIVE",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // authStatus mirrors Flutter's authStatusProvider — drives post-login popups
  const [authStatus, setAuthStatus] = useState(DEFAULT_STATUS);

  // ─── Helper: fetch & store auth status ───────────────────────────────────
  // Backend: POST /auth/check-status  { identifier }  (auth.routes.js:32)
  const fetchAuthStatus = useCallback(async (identifier) => {
    try {
      const response = await checkAccountStatusAPI(identifier);
      // Response shape from backend: { needsPassword, needsVerification, emailVerified, phoneVerified, accountStatus, ... }
      const status = response?.data ?? response;
      setAuthStatus({
        needsPassword: status?.needsPassword ?? false,
        needsVerification: status?.needsVerification ?? false,
        emailVerified: status?.emailVerified ?? true,
        phoneVerified: status?.phoneVerified ?? true,
        accountStatus: status?.accountStatus ?? "ACTIVE",
      });
      return status;
    } catch {
      // If check fails, assume no blocks (mirrors Flutter auth_controller.dart:365-371)
      setAuthStatus(DEFAULT_STATUS);
      return DEFAULT_STATUS;
    }
  }, []);

  // ─── Helper: refresh user profile ─────────────────────────────────────────
  // Backend: GET /auth/profile  (auth.routes.js:43)
  const refreshProfile = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      const data = response.data?.data;
      const userData = data?.user ?? data;
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, []);

  // ─── Password Login ────────────────────────────────────────────────────────
  // Backend: POST /auth/login  { identifier, password }  (auth.routes.js:31)
  const login = async (identifier, password) => {
    try {
      const data = await loginAPI(identifier, password);
      const accessToken = data?.data?.tokens?.accessToken;
      const refreshToken = data?.data?.tokens?.refreshToken;

      if (!accessToken) throw new Error("Token not received from backend");

      setTokens({ accessToken, refreshToken });

      const userData = data?.data?.user ?? data?.user ?? null;
      setUser(userData);

      // Flutter always calls check-status immediately after login
      await fetchAuthStatus(identifier);

      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ─── OTP Verify + Login ────────────────────────────────────────────────────
  // Backend: POST /auth/verify-otp-login  { identifier, otp }  (auth.routes.js:34)
  const loginWithOTP = async (identifier, otp) => {
    try {
      const data = await verifyOtpAPI(identifier, otp);
      const accessToken = data?.data?.tokens?.accessToken;
      const refreshToken = data?.data?.tokens?.refreshToken;

      if (!accessToken) throw new Error("Token not received from backend");

      setTokens({ accessToken, refreshToken });

      const userData = data?.data?.user ?? data?.user ?? null;
      setUser(userData);

      // Flutter calls check-status after OTP login too (auth_controller.dart:138)
      await fetchAuthStatus(identifier);

      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setAuthStatus(DEFAULT_STATUS);
  }, []);

  // ─── Update local user (called after profile edits, verification, etc.) ───
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        login,
        loginWithOTP,
        logout,
        fetchAuthStatus,
        refreshProfile,
        updateUser,
        setAuthStatus,
        isAuthenticated: !!getAccessToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);