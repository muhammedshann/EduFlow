import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
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

    const [alert, setAlert] = useState({ message: "", show: false });
    const [formData, setFormData] = useState({ username: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setAlert({ message: "All fields are required.", show: true });
            return;
        }
        
        setIsLoading(true);
        setAlert({ ...alert, show: false });

        try {
            const result = await dispatch(AdminLogin(formData)).unwrap();

            if (!result.user?.is_superuser) {
                throw "Access Denied: Non-admin account.";
            }
            
            setUser(result.user);
            navigate("/admin/dashboard/");
        } catch (err) {
            setAlert({
                message: typeof err === "string" ? err : "Invalid credentials or server error.",
                show: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-purple-500/30">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10">
                {/* Error Alert */}
                {alert.show && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-semibold">{alert.message}</p>
                        <button onClick={() => setAlert({ ...alert, show: false })} className="ml-auto opacity-60 hover:opacity-100">✕</button>
                    </div>
                )}

                {/* Branding Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl">
                            <ShieldCheck className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    <h1 className="mt-4 text-2xl font-black text-white tracking-tight uppercase">
                        Admin <span className="text-purple-500">Console</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-[0.2em] flex justify-center items-center gap-2">
                        <span className="w-8 h-[1px] bg-slate-800"></span>
                        Authorization Required
                        <span className="w-8 h-[1px] bg-slate-800"></span>
                    </p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        
                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Operator ID</label>
                            <div className={`relative group transition-all duration-300 ${focusedField === "username" ? "translate-x-1" : ""}`}>
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "username" ? "text-purple-500" : "text-slate-600"}`} />
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    placeholder="Username"
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField("username")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-purple-500/50 rounded-xl outline-none text-white text-xs placeholder:text-slate-700 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Access Key</label>
                            <div className={`relative group transition-all duration-300 ${focusedField === "password" ? "translate-x-1" : ""}`}>
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "password" ? "text-purple-500" : "text-slate-600"}`} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    placeholder="••••••••"
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-11 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-purple-500/50 rounded-xl outline-none text-white text-xs placeholder:text-slate-700 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-purple-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full !mt-8 relative group"
                        >
                            <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Establish Connection
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>

                        <div className="text-center !mt-6">
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                                Authorized Personnel Only • IP Logged
                            </p>
                        </div>
                    </form>
                </div>
                
                {/* Footer Info */}
                <p className="mt-8 text-center text-[10px] text-slate-700 font-medium">
                    Protected by EduFlow Security Architecture v3.0
                </p>
            </div>
        </div>
    );
}

export default AdminLoginPage;