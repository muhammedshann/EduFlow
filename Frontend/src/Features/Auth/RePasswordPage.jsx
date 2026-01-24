import React, { useState } from "react";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
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

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
            // Unwrap allows us to move to .then() on success or catch() on error
            await dispatch(ResetPassword({
                'password': formData.newPassword,
                'email': email,
                'otp': otp
            })).unwrap();

            // Success notification is likely already handled inside the Thunk, 
            // but we can add an extra one here if needed.
            navigate('/auth/');

        } catch (err) {
            // The Thunk already dispatches an error notification, 
            // but catching it here prevents the app from crashing.
            console.error("Reset failed:", err);
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
                        Create New Password
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden transition-all duration-500">
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-800">Security Check</h2>
                            <p className="text-gray-500 text-sm">Pick a strong password to secure your account.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    name="newPassword"
                                    type="password"
                                    placeholder="New Password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Update Password</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-gray-400 text-xs tracking-widest uppercase">
                    Secured by EduFlow Auth
                </p>
            </div>
        </div>
    );
}

export default ResetPasswordPage;