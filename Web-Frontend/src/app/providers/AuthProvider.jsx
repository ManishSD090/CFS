import { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, verifyOtpAPI } from '../../modules/auth/services/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    // Helper function to save the exact format your backend returns
    const handleLoginSuccess = (backendData) => {
        const { user, tokens } = backendData; // Extracted from backend response
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', tokens.accessToken);
        if (tokens.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        return { success: true };
    };

    // Password Login Action
    const login = async (identifier, password) => {
        try {
            const response = await loginAPI(identifier, password);
            if (response.success) {
                return handleLoginSuccess(response.data);
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // OTP Login Action
    const loginWithOTP = async (identifier, otp) => {
         try {
            const response = await verifyOtpAPI(identifier, otp);
            if (response.success) {
                return handleLoginSuccess(response.data);
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    if (isLoading) return null;

    return (
        <AuthContext.Provider value={{ user, login, loginWithOTP, logout }}>
            {children}
        </AuthContext.Provider>
    );
};