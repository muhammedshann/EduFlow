import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { AdminLogin } from "../../Redux/AdminRedux/AdminSlice";

function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setUser } = useUser();

    const [alert, setAlert] = useState({
        message: "",
        type: "",
        show: false
    });

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await dispatch(AdminLogin(formData)).unwrap();

            if (!result.user?.is_superuser) {
                throw "You are not authorized as an admin.";
            }
            console.log(result);
            
            setUser(result.user);
            navigate("/admin/dashboard/");
        } catch (err) {
            setAlert({
                message: typeof err === "string" ? err : "Invalid admin credentials",
                type: "error",
                show: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">

            <div className="w-full max-w-md">

                {/* Alert */}
                {alert.show && (
                    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm">{alert.message}</p>
                            <button
                                onClick={() => setAlert({ ...alert, show: false })}
                                className="ml-3 text-white hover:text-red-200"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-white font-bold text-2xl">AD</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
                        Admin Portal
                    </h1>

                    <p className="text-gray-600 dark:text-slate-400 text-sm flex justify-center gap-1 transition-colors">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Secure Dashboard Access
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden transition-colors duration-300">

                    {/* FORM */}
                    <div className="p-6 space-y-4">

                        {/* USERNAME */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 transition-colors">Username</label>
                            <div className={`relative transition-transform duration-200 ${focusedField === "username" ? "scale-[1.02]" : ""}`}>
                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                    focusedField === "username" ? "text-purple-500" : "text-gray-400 dark:text-slate-500"
                                }`} />
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    placeholder="admin username"
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField("username")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-600"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 transition-colors">Password</label>

                            <div className={`relative transition-transform duration-200 ${focusedField === "password" ? "scale-[1.02]" : ""}`}>
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                    focusedField === "password" ? "text-purple-500" : "text-gray-400 dark:text-slate-500"
                                }`} />

                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-600"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminLoginPage;