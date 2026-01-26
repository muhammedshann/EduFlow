import React, { useState, useRef } from "react";
import { Lock, ArrowRight, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { ResetPassword } from "../../Redux/AuthSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { showNotification } from "../../Redux/NotificationSlice";

function ResetPasswordPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email;
    const otp = location.state?.otp;

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Refs for keyboard navigation
    const confirmRef = useRef(null);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleKeyDown = (e, nextRef) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            } else {
                handleSubmit(e);
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.newPassword || !formData.confirmPassword) {
            dispatch(showNotification({ message: "Please fill in all fields", type: "error" }));
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            dispatch(showNotification({ message: "Passwords do not match", type: "error" }));
            return;
        }

        setIsLoading(true);
        try {
            await dispatch(ResetPassword({
                'password': formData.newPassword,
                'email': email,
                'otp': otp
            })).unwrap();
            
            navigate('/auth/');
        } catch (err) {
            console.error("Reset failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* Viewport locked: h-screen ensures no scroll on desktop */
        <div className="h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                
                {/* Header Section: Compacted */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="text-white font-black text-2xl tracking-tighter">EF</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                        EduFlow
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Reset Password
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-indigo-500/10 border border-white dark:border-slate-800 overflow-hidden transition-all duration-500">
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Security Check</h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Choose a strong password to protect your account.</p>
                        </div>

                        <div className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'new' ? 'scale-[1.01]' : ''}`}>
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${focusedField === 'new' ? 'text-indigo-500' : 'text-slate-400'}`} />
                                    <input
                                        name="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('new')}
                                        onBlur={() => setFocusedField(null)}
                                        onKeyDown={(e) => handleKeyDown(e, confirmRef)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-all text-slate-800 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'confirm' ? 'scale-[1.01]' : ''}`}>
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${focusedField === 'confirm' ? 'text-indigo-500' : 'text-slate-400'}`} />
                                    <input
                                        ref={confirmRef}
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('confirm')}
                                        onBlur={() => setFocusedField(null)}
                                        onKeyDown={(e) => handleKeyDown(e, null)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-all text-slate-800 dark:text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Update Password</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-6 text-slate-400 dark:text-slate-600 text-[10px] tracking-[0.2em] uppercase font-bold">
                    Secured by EduFlow Auth
                </p>
            </div>
        </div>
    );
}

export default ResetPasswordPage;