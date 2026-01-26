import React, { useState } from "react";
import { Mail, Sparkles, Send, Loader2, ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { generateOtp } from "../../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../Redux/NotificationSlice";

function EmailPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!email || !email.includes('@')) {
            dispatch(showNotification({ 
                message: "Please enter a valid email address", 
                type: "error" 
            }));
            return;
        }

        setIsLoading(true);
        try {
            const result = await dispatch(generateOtp(email)).unwrap();
            const createdTime = result.created_at;

            const params = new URLSearchParams({
                type: 'reset',
                email: email,
                created: createdTime
            }).toString();

            navigate(`/otp/?${params}`);
        } catch (err) {
            console.error("OTP Request failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        /* Viewport locked: h-screen and overflow-hidden ensures it fits the frame */
        <div className="h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

                {/* Header Section: Compact for screen fit */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                            <span className="text-white font-black text-2xl tracking-tighter">EF</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                        EduFlow
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Account Recovery
                    </p>
                </div>

                {/* Main Card: Glassmorphism adapted for Dark Mode */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-indigo-500/10 border border-white dark:border-slate-800 overflow-hidden transition-all duration-500">
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Identify your account</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Enter your email and we'll send an OTP to reset your password.
                            </p>
                        </div>

                        {/* Input Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-all duration-300 text-slate-700 dark:text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Send OTP Code</span>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button 
                            onClick={() => navigate('/auth')}
                            className="w-full py-2 text-slate-400 dark:text-slate-500 text-xs font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 uppercase tracking-tighter"
                        >
                            <ChevronLeft size={14} />
                            Back to login
                        </button>
                    </div>
                </div>

                {/* Footer Brand */}
                <p className="text-center mt-6 text-slate-400 dark:text-slate-600 text-[10px] tracking-[0.2em] uppercase font-bold">
                    Secured by EduFlow Auth
                </p>
            </div>
        </div>
    );
}

export default EmailPage;