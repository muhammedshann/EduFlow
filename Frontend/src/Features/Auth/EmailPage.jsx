import React, { useState } from "react";
import { Mail, ArrowRight, Sparkles, Send } from "lucide-react";
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
        e.preventDefault();
        
        // Basic frontend validation
        if (!email || !email.includes('@')) {
            dispatch(showNotification({ 
                message: "Please enter a valid email address", 
                type: "error" 
            }));
            return;
        }

        setIsLoading(true);
        try {
            // Using .unwrap() to catch potential thunk errors
            const result = await dispatch(generateOtp(email)).unwrap();
            const createdTime = result.created_at;

            const params = new URLSearchParams({
                type: 'reset',
                email: email,
                created: createdTime
            }).toString();

            navigate(`/otp/?${params}`);

        } catch (err) {
            // Thunk logic likely handles the error notification already,
            // but we catch it here to stop the loading state.
            console.error("OTP Request failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                            <span className="text-white font-black text-3xl">EF</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
                        EduFlow
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Forgot Your Password?
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden hover:shadow-purple-100/50 transition-all duration-500">
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">Identify your account</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Enter the email associated with your account and we'll send you an OTP to reset your password.
                            </p>
                        </div>

                        {/* Input Field */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="group w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-400/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Send OTP Code</span>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button 
                            onClick={() => navigate('/auth')}
                            className="w-full py-2 text-gray-400 text-sm font-medium hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Back to login
                        </button>
                    </div>
                </div>

                {/* Footer Brand */}
                <p className="text-center mt-8 text-gray-400 text-xs tracking-widest uppercase">
                    Secured by EduFlow Auth
                </p>
            </div>
        </div>
    );
}

export default EmailPage;