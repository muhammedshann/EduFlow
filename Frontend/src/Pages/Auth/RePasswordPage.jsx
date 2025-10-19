import React, { useState } from "react";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { ResetPassword } from "../../Redux/AuthSlice";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPasswordPage() {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "", show: false });

    // const showAlert = (message, type = "success") => {
    //     setAlert({ message, type, show: true });
    //     setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
    // };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            // showAlert("Passwords do not match", "error");
            return;
        }

        setIsLoading(true);
        try {
            console.log("Resetting password:", formData);
            const result = dispatch(ResetPassword({'password':formData.newPassword,'email':email}))
            // showAlert("Password reset successfully!", "success");
            navigate('/login/')
            // TODO: Add API call for resetting password here
        } catch (err) {
            // showAlert("Error resetting password", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 overflow-auto">
            <div className="w-full max-w-md">
                {/* Alert */}
                {alert.message && (
                    <div
                        className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            } ${alert.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <button onClick={() => setAlert({ ...alert, show: false })}>X</button>
                        </div>
                    </div>
                )}

                {/* Header */}
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
                        Reset Your Password
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-500">
                    <div className="p-6 space-y-4">
                        {/* New Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="newPassword"
                                type="password"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 text-sm"
                            />
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
                                    <ArrowRight className="w-4 h-4" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
