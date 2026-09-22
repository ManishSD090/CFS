import apiClient from '../../../api/apiClient';

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/auth` : 'http://localhost:5001/api/v1/auth';
const VERIFICATION_API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/verification` : 'http://localhost:5001/api/v1/verification';
// 1. Standard Password Login
export const loginAPI = async (identifier, password) => {
    try {
        const response = await apiClient.post(`${API_URL}/login`, { 
            identifier, 
            password 
        });

          console.log("🔥 LOGIN RESPONSE:", response.data); 
        return response.data; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        throw new Error(errorMessage);
    }
};

// 2. Request OTP Code
export const sendOtpAPI = async (identifier) => {
    try {
        const response = await apiClient.post(`${API_URL}/login-with-otp`, { 
            identifier 
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to send OTP.";
        throw new Error(errorMessage);
    }
};

// 3. Verify OTP & Login
export const verifyOtpAPI = async (identifier, otp) => {
    try {
        const response = await apiClient.post(`${API_URL}/verify-otp-login`, { 
            identifier, 
            otp 
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
        throw new Error(errorMessage);
    }
};

// 4. Check Account Status
export const checkAccountStatusAPI = async (identifier) => {
    try {
        const response = await apiClient.post(`${API_URL}/check-status`, { identifier });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to check account status.";
        throw new Error(errorMessage);
    }
};

// 5. Request Verification OTP (for setup)
export const requestVerificationOtpAPI = async (identifier) => {
    try {
        const response = await apiClient.post(`${VERIFICATION_API_URL}/request-otp`, { identifier });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to request verification OTP.";
        throw new Error(errorMessage);
    }
};

// 6. Verify Code (for setup)
export const verifyCodeAPI = async (identifier, otp, type) => {
    try {
        const response = await apiClient.post(`${VERIFICATION_API_URL}/verify-otp`, { identifier, otp, type });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to verify code.";
        throw new Error(errorMessage);
    }
};

// 7. Complete Setup (set password)
export const completeSetupAPI = async (identifier, password) => {
    try {
        const response = await apiClient.post(`${VERIFICATION_API_URL}/complete-setup`, { identifier, password });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to complete account setup.";
        throw new Error(errorMessage);
    }
};

// 8. Change Password (authenticated users)
// Backend: POST /auth/change-password  (auth.routes.js:44, requires Bearer token)
export const changePasswordAPI = async (currentPassword, newPassword) => {
    try {
        const response = await apiClient.post(`${API_URL}/change-password`, {
            currentPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to change password.";
        throw new Error(errorMessage);
    }
};