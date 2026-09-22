import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestVerificationOtpAPI, verifyCodeAPI, completeSetupAPI } from '../services/auth.service';

const SetupAccount = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // We expect the identifier to be passed via routing state
    const identifier = location.state?.identifier || '';
    const isEmail = location.state?.isEmail || false;

    const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Enter OTP, 3 = Set Password
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // If no identifier is found in state, this page was accessed directly, redirect to login
    if (!identifier) {
        return <Navigate to="/login" replace />;
    }

    const handleRequestOTP = async () => {
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');
        try {
            await requestVerificationOtpAPI(identifier);
            setSuccessMessage(`OTP sent to your ${isEmail ? 'email' : 'phone'}!`);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const type = isEmail ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';
            const result = await verifyCodeAPI(identifier, otp, type);
            if (result.success) {
                setSuccessMessage(`${isEmail ? 'Email' : 'Phone'} verified successfully!`);
                setStep(3);
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteSetup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        try {
            const result = await completeSetupAPI(identifier, password);
            if (result.success) {
                // Navigate to dashboard based on role
                const roleData = user?.role || user?.role_name || user?.type || user;
                const roleString = typeof roleData === 'object' ? JSON.stringify(roleData) : String(roleData || '');
                const role = roleString.toUpperCase().replace(/[\s_-]+/g, '');
                
                if (role.includes('SUPERADMIN') || role.includes('SUPER')) {
                    navigate('/superadmin/dashboard', { replace: true });
                } else {
                    navigate('/admin/dashboard', { replace: true });
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to complete setup.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex w-full h-screen overflow-hidden bg-white md:bg-transparent select-none">
            {/* Desktop Background Layer */}
            <div 
                className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('/login-bg.jpg')", backgroundColor: '#0B192C' }}
            ></div>
            <div className="absolute inset-0 hidden md:block bg-black/20"></div>

            <div className="relative z-10 flex w-full h-full">
                {/* Content Area */}
                <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col w-full max-w-[460px] bg-white px-8 sm:px-12 py-10 md:py-12 md:rounded-[2rem] md:shadow-2xl">
                        
                        <div className="flex items-center justify-center gap-3 mb-8 cursor-default">
                            <span className="text-[26px] font-bold text-[#0066CC] tracking-tight">Account Setup</span>
                        </div>

                        <div className="mb-6 cursor-default text-center">
                            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Welcome!</h2>
                            <p className="text-[14px] font-medium text-gray-500 mt-2">
                                For security, please verify your {isEmail ? 'email' : 'phone number'} and set a secure password.
                            </p>
                        </div>

                        {step === 1 && (
                            <div className="space-y-6">
                                <p className="text-center text-[15px] font-semibold text-gray-700">
                                    {identifier}
                                </p>
                                <button 
                                    onClick={handleRequestOTP}
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 text-white text-[15px] font-bold rounded-xl transition-all shadow-md active:scale-95 
                                        ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0066CC] hover:bg-[#0052a3] cursor-pointer hover:shadow-lg'}`}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-700 cursor-text">Verification Code</label>
                                    <input 
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        className="w-full px-4 py-3 rounded-2xl border border-[#8AB4F8] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all"
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !otp}
                                    className={`w-full py-3.5 text-white text-[15px] font-bold rounded-xl transition-all shadow-md
                                        ${(isSubmitting || !otp) ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0066CC] hover:bg-[#0052a3]'}`}
                                >
                                    {isSubmitting ? 'Verifying...' : 'Verify'}
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleCompleteSetup} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-700 cursor-text">New Password</label>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter secure password"
                                        className="w-full px-4 py-3 rounded-2xl border border-[#8AB4F8] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-700 cursor-text">Confirm Password</label>
                                    <input 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-3 rounded-2xl border border-[#8AB4F8] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !password || !confirmPassword}
                                    className={`w-full py-3.5 mt-2 text-white text-[15px] font-bold rounded-xl transition-all shadow-md
                                        ${(isSubmitting || !password || !confirmPassword) ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0066CC] hover:bg-[#0052a3]'}`}
                                >
                                    {isSubmitting ? 'Saving...' : 'Set Password & Continue'}
                                </button>
                            </form>
                        )}

                        <div className="h-5 mt-4">
                            {error && <p className="text-[12px] font-bold text-center text-red-600 animate-fade-in">{error}</p>}
                            {successMessage && <p className="text-[12px] font-bold text-center text-[#00A884] animate-fade-in">{successMessage}</p>}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupAccount;
