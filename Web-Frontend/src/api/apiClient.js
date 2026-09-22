// src/api/apiClient.js

// ── Debug: Print any 401 error saved from last session ──────────────────────
const _lastErr = localStorage.getItem('__apiClient_lastError');
if (_lastErr) {
  try {
    const e = JSON.parse(_lastErr);
    console.error('🔴🔴 [apiClient] PREVIOUS SESSION 401 ERROR:', e);
    console.error('   URL:', e.url);
    console.error('   Message:', e.message);
    console.error('   Had accessToken:', e.hadAccessToken);
    console.error('   Had refreshToken:', e.hadRefreshToken);
    console.error('   Redirect reason:', e.reason);
  } catch(_){}
  localStorage.removeItem('__apiClient_lastError');
}

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../modules/admin/services/authStorage";

// Base API URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

// Create Axios Instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR → Attach Access Token
// ─────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR → Handle 401 + Refresh Token
// ─────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor for auth endpoints — let 401 errors (e.g. wrong password)
    // bubble up naturally so the UI can display the error message to the user.
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error('🔴 [apiClient] 401 on URL:', originalRequest?.url);
      console.error('🔴 [apiClient] Response message:', error.response?.data?.message);
      console.error('🔴 [apiClient] accessToken in storage:', getAccessToken());
      console.error('🔴 [apiClient] refreshToken in storage:', getRefreshToken());

      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      // If no refresh token → logout
      if (!refreshToken) {
        console.error('🔴 [apiClient] No refresh token found → redirecting to /login');
        localStorage.setItem('__apiClient_lastError', JSON.stringify({
          url: originalRequest?.url,
          message: error.response?.data?.message,
          hadAccessToken: !!getAccessToken(),
          hadRefreshToken: false,
          reason: 'No refresh token in storage',
        }));
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // If already refreshing → queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;
      console.warn('🟡 [apiClient] Attempting token refresh...');

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        console.log('✅ [apiClient] Token refreshed successfully');

        // Save new tokens
        setTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        // Update header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return apiClient(originalRequest);
      } catch (err) {
        console.error('🔴 [apiClient] Token refresh failed:', err.response?.data || err.message);
        console.error('🔴 [apiClient] Redirecting to /login via window.location');
        localStorage.setItem('__apiClient_lastError', JSON.stringify({
          url: originalRequest?.url,
          message: err.response?.data?.message || err.message,
          hadAccessToken: !!getAccessToken(),
          hadRefreshToken: true,
          reason: 'Token refresh call failed',
          refreshError: err.response?.data || err.message,
        }));
        processQueue(err, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;