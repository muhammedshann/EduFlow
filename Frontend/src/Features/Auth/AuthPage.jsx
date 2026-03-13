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

    const [formData, setFormData] = useState({
        first_name: "", last_name: "", username: "", email: "", password: "", register: true
    });

    // --- NEW: Validation State ---
    const [errors, setErrors] = useState({});

    // --- NEW: Validation Logic ---
    const validateField = (name, value) => {
        let error = "";
        const trimmedValue = value?.trim() || "";

        switch (name) {
            case "first_name":
            case "last_name":
                if (!trimmedValue) {
                    error = "Field required";
                } else if (!/^[A-Za-z]+$/.test(trimmedValue)) {
                    error = "Only letters allowed";
                } else if (trimmedValue.length < 2) {
                    error = "Min 2 characters";
                }
                break;

            case "username":
                if (!trimmedValue) {
                    error = "Username required";
                } else if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(trimmedValue)) {
                    error = "3-20 chars, start with letter, no symbols except _";
                }
                break;

            case "email":
                if (!trimmedValue) {
                    error = "Email required";
                } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedValue)) {
                    error = "Invalid email address";
                }
                break;

            case "password":
                if (!trimmedValue) {
                    error = "Password required";
                } else if (trimmedValue.length < 8) {
                    error = "Minimum 8 characters";
                } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(trimmedValue)) {
                    error = "Must include both letters and numbers";
                }
                break;

            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const response = await api.post('accounts/auth/social/google/', {
                access_token: credentialResponse.credential,
            });
            if (response.status === 200) {
                setUser(response.data.user);
                setTimeout(() => navigate('/dashboard'), 1000);
            }
        } catch (error) {
            dispatch(showNotification({ message: "Google login failed", type: "error" }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine which fields to validate based on mode
        const fieldsToValidate = isLogin 
            ? ["username", "password"] 
            : ["first_name", "last_name", "email", "username", "password"];

        let hasError = false;
        fieldsToValidate.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) hasError = true;
        });

        if (hasError) {
            dispatch(showNotification({ message: "Please fix form errors", type: "error" }));
            return;
        }

        const { username, password } = formData;
        setIsLoading(true);

        try {
            if (isLogin) {
                const loginData = { username, password };
                const result = await dispatch(Login(loginData)).unwrap();
                dispatch(showNotification({ message: "Login successful", type: "success" }));
                setUser(result.user);
                navigate('/dashboard/');
                return;
            }

            const result = await dispatch(SignUp(formData)).unwrap();
            dispatch(showNotification({ message: "Account created! Verification required.", type: "success" }));
            navigate('/otp/', { 
                state: { 
                    email: formData.email, 
                    created: result.created_time, 
                    type: 'register' 
                } 
            });
        } catch (err) {
            dispatch(showNotification({ 
                message: err?.message || "An error occurred during authentication", 
                type: "error" 
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Real-time validation
        validateField(name, value);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 transition-colors duration-500 overflow-hidden">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                
                {/* Branding Section */}
                <div className="text-center mb-4 transition-colors duration-300">
                    <div className="relative inline-block mb-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-50"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-2xl">
                            <span className="text-white font-bold text-xl">EF</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent transition-colors duration-300">
                        EduFlow
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mt-1 flex items-center justify-center gap-1 uppercase tracking-tighter transition-colors duration-300">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        AI-Powered Productivity Suite
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl dark:shadow-indigo-500/10 border border-white dark:border-slate-800 overflow-hidden transition-all duration-500">
                    
                    {/* Tab Switcher */}
                    <div className="p-1.5 bg-slate-100/50 dark:bg-slate-800/50 m-3 rounded-xl transition-colors duration-300">
                        <div className="relative flex p-0.5">
                            <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-all duration-300 ease-out ${
                                isLogin ? 'left-0.5' : 'left-[calc(50%+1px)]'
                            }`} />
                            <button onClick={() => setIsLogin(true)} className={`relative flex-1 py-1.5 text-[16px] font-bold transition-all duration-300 ${isLogin ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Sign In</button>
                            <button onClick={() => setIsLogin(false)} className={`relative flex-1 py-1.5 text-[16px] font-bold transition-all duration-300 ${!isLogin ? 'text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Sign Up</button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-3 transition-colors duration-300">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-3 transition-colors duration-300">
                                <InputField label="First" name="first_name" icon={<User />} value={formData.first_name} onChange={handleInputChange} focused={focusedField} setFocused={setFocusedField} error={errors.first_name} />
                                <InputField label="Last" name="last_name" icon={<User />} value={formData.last_name} onChange={handleInputChange} focused={focusedField} setFocused={setFocusedField} error={errors.last_name} />
                            </div>
                        )}
                        
                        {!isLogin && (
                             <InputField label="Email" name="email" type="email" icon={<Mail />} value={formData.email} onChange={handleInputChange} focused={focusedField} setFocused={setFocusedField} error={errors.email} />
                        )}

                        <InputField label="Username" name="username" icon={<User />} value={formData.username} onChange={handleInputChange} focused={focusedField} setFocused={setFocusedField} error={errors.username} />

                        {/* Password Field with Error Rendering */}
                        <div className="space-y-1 transition-colors duration-300">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider transition-colors duration-300">Password</label>
                            <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl outline-none transition-all text-slate-800 dark:text-white text-[16px]"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-[9px] ml-1 mt-0.5">{errors.password}</p>}
                        </div>

                        {isLogin && (
                            <div className="flex justify-end !mt-1 transition-colors duration-300">
                                <button type="button" onClick={() => navigate("/enter-email/")} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300">Forgot password?</button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                                <>
                                    <span>{isLogin ? "Sign In" : "Start Journey"}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="relative py-1 transition-colors duration-300">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-tight"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 transition-colors duration-300">Or continue</span></div>
                        </div>

                        <div className="flex justify-center rounded-xl overflow-hidden transition-all scale-95">
                            <GoogleLogin onSuccess={handleGoogleLogin} theme={document.documentElement.classList.contains('dark') ? 'filled_blue' : 'outline'} width="380px" />
                        </div>
                    </form>
                </div>

                <p className="mt-4 text-center text-[16px] text-slate-500 dark:text-slate-400 transition-colors duration-300">
                    {isLogin ? "New here?" : "Already joined?"}{" "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-colors duration-300">{isLogin ? "Sign up" : "Sign in"}</button>
                </p>
            </div>
        </div>
    );
}

const InputField = ({ label, name, type = "text", icon, value, onChange, focused, setFocused, error }) => (
    <div className="space-y-1 flex-1 transition-colors duration-300">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider transition-colors duration-300">{label}</label>
        <div className={`relative transition-all duration-300 ${focused === name ? 'scale-[1.01]' : ''}`}>
            {React.cloneElement(icon, { className: `absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === name ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}` })}
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused(null)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl outline-none transition-all text-slate-800 dark:text-white text-[16px]"
                placeholder={label}
            />
        </div>
        {error && <p className="text-red-500 text-[9px] ml-1 mt-0.5">{error}</p>}
    </div>
);

const Loader2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default LoginPage;