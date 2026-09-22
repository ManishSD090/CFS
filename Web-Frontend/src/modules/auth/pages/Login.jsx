import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtpAPI, checkAccountStatusAPI } from '../services/auth.service';

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithOTP } = useAuth();
  

    const [loginMethod, setLoginMethod] = useState('password'); 
    const [showPassword, setShowPassword] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [identifier, setIdentifier] = useState(''); 
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!identifier.trim()) {
            setError("Phone number or Email is required");
            return;
        }

        if (loginMethod === 'password') {
            if (!password) {
                setError("Password is required");
                return;
            }
            setIsSubmitting(true);
            try {
                // Check account status before attempting password login
                const statusResponse = await checkAccountStatusAPI(identifier);
                if (statusResponse.accountStatus === 'SETUP_REQUIRED') {
                    setError("First time login requires OTP verification. Switching to OTP...");
                    setTimeout(() => {
                        setLoginMethod('otp');
                        setIsSubmitting(false);
                    }, 1500);
                    return;
                }
            } catch (err) {
                setError(err.message || "Failed to verify account status.");
                setIsSubmitting(false);
                return;
            }

            console.log('🚀 [LOGIN] Step 1: Calling login API with identifier:', identifier);
            const result = await login(identifier, password);
            console.log('📦 [LOGIN] Step 2: Full result from login():', result);
            console.log('✅ [LOGIN] Step 3: result.success =', result.success);
            console.log('👤 [LOGIN] Step 4: result.user =', result.user);
            console.log('🗄️  [LOGIN] Step 5: localStorage accessToken =', localStorage.getItem('accessToken'));
            if (result.success) {
                const roleData = result.user?.role || result.user?.role_name || result.user?.type || result.user;
                const roleString = typeof roleData === 'object' ? JSON.stringify(roleData) : String(roleData || '');
                const role = roleString.toUpperCase().replace(/[\s_-]+/g, '');
                console.log('🎭 [LOGIN] Step 6: Detected role string =', role);
                if (role.includes('SUPERADMIN') || role.includes('SUPER')) {
                    console.log('➡️  [LOGIN] Step 7: Navigating to /superadmin/dashboard');
                    navigate('/superadmin/dashboard');
                } else {
                    console.log('➡️  [LOGIN] Step 7: Navigating to /admin/dashboard');
                    navigate('/admin/dashboard');
                }
            } else {
                console.error('❌ [LOGIN] Login failed:', result.message);
                setError(result.message || "Incorrect Password! Please try again.");
                setIsSubmitting(false);
            }
        } else {
            setIsSubmitting(true);
            if (!isOtpSent) {
                try {
                    const result = await sendOtpAPI(identifier);
                    setSuccessMessage(result.message || 'OTP sent successfully!');
                    setIsOtpSent(true);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsSubmitting(false);
                }
                return;
            }
            console.log('🚀 [LOGIN] Step 1: Calling verifyOtp API with identifier:', identifier, 'and otp:', otp);
            const result = await loginWithOTP(identifier, otp);
            console.log('📦 [LOGIN] Step 2: Full result from loginWithOTP():', result);
            console.log('✅ [LOGIN] Step 3: result.success =', result.success);
            console.log('👤 [LOGIN] Step 4: result.user =', result.user);
            console.log('🗄️  [LOGIN] Step 5: localStorage accessToken =', localStorage.getItem('accessToken'));
            if (result.success) {
                // Check account status again to see if they need to setup a password
                try {
                    const statusResponse = await checkAccountStatusAPI(identifier);
                    if (statusResponse.accountStatus === 'SETUP_REQUIRED') {
                        console.log('➡️  [LOGIN] Step 7: Account needs setup, navigating to /setup-account');
                        navigate('/setup-account', { state: { identifier, isEmail: identifier.includes('@') } });
                        return;
                    }
                } catch (err) {
                    console.error('Failed to check status after OTP login:', err);
                }

                const roleData = result.user?.role || result.user?.role_name || result.user?.type || result.user;
                const roleString = typeof roleData === 'object' ? JSON.stringify(roleData) : String(roleData || '');
                const role = roleString.toUpperCase().replace(/[\s_-]+/g, '');
                console.log('🎭 [LOGIN] Step 6: Detected role string =', role);
                if (role.includes('SUPERADMIN') || role.includes('SUPER')) {
                    console.log('➡️  [LOGIN] Step 7: Navigating to /superadmin/dashboard');
                    navigate('/superadmin/dashboard');
                } else {
                    console.log('➡️  [LOGIN] Step 7: Navigating to /admin/dashboard');
                    navigate('/admin/dashboard');
                }
            } else {
                setError(result.message || "Incorrect OTP! Please try again.");
                setIsSubmitting(false);
            }
        }
    };

    const toggleMethod = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setLoginMethod(prev => prev === 'password' ? 'otp' : 'password');
            setError('');
            setSuccessMessage('');
            setPassword('');
            setOtp('');
            setIsOtpSent(false);
            setShowPassword(false);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
    };

    return (
        <div className="relative flex w-full h-screen overflow-hidden bg-white md:bg-transparent select-none">
            {/* Desktop Background Layer */}
            <div 
                className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat transition-opacity duration-1000"
                style={{ backgroundImage: "url('/login-bg.jpg')", backgroundColor: '#0B192C' }}
            ></div>
            <div className="absolute inset-0 hidden md:block bg-black/20"></div>

            <div className="relative z-10 flex w-full h-full">
                {/* Desktop Typography */}
                <div className="hidden md:flex flex-col justify-end flex-1 p-12 lg:p-20 pb-16 lg:pb-24">
                    <h1 className="text-white text-[32px] lg:text-[40px] font-bold leading-[1.25] drop-shadow-md">
                        Manage Sites. Track Progress.<br />
                        Finish Strong.
                    </h1>
                </div>

                {/* Content Area */}
                <div className="flex items-center justify-center w-full md:w-auto md:pr-12 lg:pr-20">
                    <div className="flex flex-col w-full h-full md:h-auto md:w-[420px] lg:w-[460px] bg-white px-8 sm:px-12 py-10 md:py-12 md:rounded-[2rem] md:shadow-2xl overflow-y-auto">
                        
                        {/* Centered Logo */}
                        <div className="flex items-center justify-center gap-3 mb-10 transition-transform duration-300 hover:scale-105 cursor-default">
                            <img src="/Logo ConstructionSite Management.svg" alt="Brand Logo" className="h-10 sm:h-11" />
                            <span className="text-[26px] font-bold text-[#0066CC] tracking-tight">SampleWeb</span>
                        </div>

                        {/* Welcome Text */}
                        <div className="mb-8 cursor-default">
                            <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">Welcome back!</h2>
                            <p className="text-[13px] font-medium text-gray-400">Please sign in here</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Identifier Input */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-700 cursor-text">Phone Number/ Email</label>
                                <input 
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter phone number/Email"
                                    className={`w-full px-4 py-3 rounded-2xl border text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all placeholder:text-[#C4D7F5] cursor-text ${error && identifier === '' ? 'border-red-400' : 'border-[#8AB4F8]'}`}
                                />
                            </div>

                            {/* Password/OTP Container */}
                            <div className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                                {loginMethod === 'password' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-700 cursor-text">Password</label>
                                        <div className={`relative flex items-center border rounded-2xl focus-within:ring-1 focus-within:ring-[#8AB4F8] transition-all ${error && error.includes('Password') ? 'border-red-400' : 'border-[#8AB4F8]'}`}>
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                                className="w-full px-4 py-3 text-[14px] rounded-2xl focus:outline-none placeholder:text-[#C4D7F5] bg-transparent cursor-text"
                                            />
                                            {/* Pointer Cursor for the Eye Icon */}
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)} 
                                                className="absolute right-4 text-[#8AB4F8] hover:text-[#0066CC] transition-colors cursor-pointer"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 min-h-[70px] transition-all">
                                        {isOtpSent ? (
                                            <>
                                                <label className="text-[13px] font-bold text-gray-700 cursor-text">Enter OTP</label>
                                                <input 
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="Enter 6-digit OTP"
                                                    maxLength={6}
                                                    className="w-full px-4 py-3 rounded-2xl border border-[#8AB4F8] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all placeholder:text-[#C4D7F5] cursor-text bg-white"
                                                    autoFocus
                                                />
                                            </>
                                        ) : (
                                            <p className="text-[13.5px] font-medium text-gray-500 pt-2 px-1 text-center">
                                                An OTP will be sent to your phone or email.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button with Pointer/Not-Allowed Cursors */}
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 text-white text-[15px] font-bold rounded-xl transition-all shadow-md active:scale-95 
                                        ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0066CC] hover:bg-[#0052a3] cursor-pointer hover:shadow-lg'}`}
                                >
                                    {isSubmitting ? 
                                        (loginMethod === 'otp' && isOtpSent ? 'Verifying...' : 'Processing...') : 
                                        (loginMethod === 'password' ? 'Login' : (isOtpSent ? 'Verify & Login' : 'Send OTP'))}
                                </button>
                            </div>

                            {/* Error/Success Area */}
                            <div className="flex flex-col items-center gap-4 pt-2">
                                <div className="h-5">
                                    {error && <p className="text-[12px] font-bold text-center text-red-600 animate-fade-in">{error}</p>}
                                    {successMessage && <p className="text-[12px] font-bold text-center text-[#00A884] animate-fade-in">{successMessage}</p>}
                                </div>
                                
                                {/* Link Toggles with Pointer Cursor */}
                                <button 
                                    type="button" 
                                    onClick={toggleMethod}
                                    className="text-[13px] font-bold text-[#0066CC] hover:underline hover:text-[#0052a3] transition-colors cursor-pointer"
                                >
                                    {loginMethod === 'password' ? 'Log in with OTP' : 'Log in with password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;