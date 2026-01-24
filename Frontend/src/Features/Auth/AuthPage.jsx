import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { Login, SignUp } from "../../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { GoogleLogin } from '@react-oauth/google';
import api from "../../api/axios";
import { showNotification } from "../../Redux/NotificationSlice";


function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useUser();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [alert, setAlert] = useState({
        message: '',
        type: '',
        show: false,
        autoHide: true,
        progress: 100
    });
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        register: true
    });


    // ✅ CORRECTED: Google Login Handler
    const handleGoogleLogin = async (credentialResponse) => {
        console.log('Google credential response:', credentialResponse);
        setIsLoading(true);

        try {
            const response = await api.post('accounts/auth/social/google/', {
                access_token: credentialResponse.credential,
            });

            console.log('Backend response:', response.data);

            if (response.status === 200) {
                console.log('Logged in user:', response.data);
                setUser(response.data.user);
                
                // Show success alert
                setAlert({
                    message: 'Google login successful!',
                    type: 'success',
                    show: true,
                    autoHide: true,
                    progress: 100
                });

                // Redirect after a brief delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.non_field_errors?.[0] ||
                'Google login failed. Please try again.';

            setAlert({
                message: errorMessage,
                type: 'error',
                show: true,
                autoHide: true,
                progress: 100
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ CORRECTED: Google Login Error Handler
    const handleGoogleError = () => {
        console.error('Google Sign-In failed');
        setAlert({
            message: 'Google Sign-In failed. Please try again.',
            type: 'error',
            show: true,
            autoHide: true,
            progress: 100
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            localStorage.clear();
            if (isLogin) {
                const loginData = {
                    username: formData.username,
                    password: formData.password,
                };

                const result = await dispatch(Login(loginData)).unwrap();
                setUser(result.user);
                navigate('/dashboard/');
                return;
            }

            // =====================================================
            // 🚀 SIGNUP VALIDATION STARTS HERE (LOGIN SKIPPED)
            // =====================================================

            const firstname = formData.first_name || "";
            const lastname = formData.last_name || "";
            const username = formData.username || "";
            const email = formData.email || "";
            const password = formData.password || "";

            // FIRSTNAME & LASTNAME VALIDATION
            const cleanNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

            // Firstname: No start/end space
            if (firstname.trim() !== firstname) {
                dispatch(showNotification({
                    message: "Firstname cannot start or end with spaces.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            // Firstname: Only alphabets
            if (!cleanNameRegex.test(firstname)) {
                dispatch(showNotification({
                    message: "Firstname can only contain alphabets. No numbers, symbols, or extra spaces.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            // Lastname: No start/end space
            if (lastname.trim() !== lastname) {
                dispatch(showNotification({
                    message: "Lastname cannot start or end with spaces.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            // Lastname: Only alphabets
            if (!cleanNameRegex.test(lastname)) {
                dispatch(showNotification({
                    message: "Lastname can only contain alphabets. No numbers, symbols, or extra spaces.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            // USERNAME VALIDATION
            const allowedUsername = /^[a-zA-Z0-9._-]+$/;

            if (username.includes(" ")) {
                dispatch(showNotification({
                    message: "Username cannot contain spaces.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            if (username.includes("*")) {
                dispatch(showNotification({
                    message: "Username cannot contain '*' symbol.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            if (!allowedUsername.test(username)) {
                dispatch(showNotification({
                    message: "Username can only contain letters, numbers, '.', '_' and '-'.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            // EMAIL VALIDATION
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                dispatch(showNotification({
                    message: "Invalid email format.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            // PASSWORD VALIDATION
            if (password.includes(" ")) {
                dispatch(showNotification({
                    message: "Password cannot contain spaces.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            if (password.includes("*")) {
                dispatch(showNotification({
                    message: "Password cannot contain '*' symbol.",
                    type: "error"
                }));
                setIsLoading(false);
                return;
            }

            const result = await dispatch(SignUp(formData)).unwrap();
            navigate(`/otp/?type=register&email=${formData.email}&created=${result.created_time}`);

        } catch (err) {
            console.log("Auth error:", err);

            setAlert({
                message: JSON.stringify(err),
                type: 'error',
                show: true,
                autoHide: true,
                progress: 100
            });

        } finally {
            setIsLoading(false);
        }
    };


    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 overflow-auto">
            <div className="w-full max-w-md">
                {/* Enhanced Alert Bar */}
                {alert.show && (
                    <div
                        className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
                            alert.type === "success"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                        } opacity-100 translate-y-0`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {alert.type === "success" ? (
                                    <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium">
                                        {alert.type === "success" ? "Success" : "Error"}
                                    </p>
                                    <p className="text-sm opacity-90">{alert.message}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAlert({ ...alert, show: false })}
                                className="flex-shrink-0 w-5 h-5 text-white/70 hover:text-white transition-colors duration-150 ml-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                            <span className="text-white font-bold text-2xl">EF</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent mb-1">
                        EduFlow
                    </h1>
                    <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        AI-Powered Productivity Suite
                    </p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-500">
                    {/* Tab Toggle */}
                    <div className="p-1.5 bg-gradient-to-r from-purple-100 to-blue-100">
                        <div className="relative flex bg-white/50 backdrop-blur-sm rounded-xl p-1">
                            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg transition-all duration-300 ease-out ${
                                isLogin ? 'left-1' : 'left-[calc(50%+2px)]'
                            }`} />
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                    isLogin ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                    !isLogin ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Name Fields */}
                            {!isLogin && (
                                <>
                                    <div className="grid grid-cols-2 gap-3 animate-[slideDown_0.3s_ease-out]">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">First Name</label>
                                            <div className={`relative transition-transform duration-300 ${
                                                focusedField === 'first_name' ? 'scale-105' : ''
                                            }`}>
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    name="first_name"
                                                    placeholder="John"
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('first_name')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-gray-700">Last Name</label>
                                            <div className={`relative transition-transform duration-300 ${
                                                focusedField === 'last_name' ? 'scale-105' : ''
                                            }`}>
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    name="last_name"
                                                    placeholder="Doe"
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('last_name')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Email Address</label>
                                        <div className={`relative transition-transform duration-300 ${
                                            focusedField === 'email' ? 'scale-105' : ''
                                        }`}>
                                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                                focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'
                                            }`} />
                                            <input
                                                name="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* username */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Username</label>
                                <div className={`relative transition-transform duration-300 ${
                                    focusedField === 'username' ? 'scale-105' : ''
                                }`}>
                                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                        focusedField === 'username' ? 'text-purple-500' : 'text-gray-400'
                                    }`} />
                                    <input
                                        name="username"
                                        type="text"
                                        placeholder="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Password</label>
                                <div className={`relative transition-transform duration-300 ${
                                    focusedField === 'password' ? 'scale-105' : ''
                                }`}>
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                        focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'
                                    }`} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {isLogin && (
                                    <div className="text-right">
                                        <button 
                                            className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors" 
                                            onClick={() => navigate("/enter-email/")}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="group w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 text-xs text-gray-500 bg-white">OR CONTINUE WITH</span>
                            </div>
                        </div>

                        {/* ✅ CORRECTED: Google Login Button */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="continue_with"
                                width="384"
                            />
                        </div>

                        {/* Footer Toggle */}
                        <div className="mt-5 text-center">
                            <p className="text-sm text-gray-600">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                                >
                                    {isLogin ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-6 text-center space-y-3">
                    <p className="text-xs text-gray-600 font-medium">
                        Join 10,000+ users improving their productivity
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;