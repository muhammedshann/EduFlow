import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
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
            setAlert({ message: "Please fill in all fields", show: true });
            return;
        }

        setIsLoading(true);
        try {
            const result = await dispatch(AdminLogin(formData)).unwrap();
            if (!result.user?.is_superuser) {
                throw "Unauthorized: Admin access only.";
            }
            setUser(result.user);
            navigate("/admin/dashboard/");
        } catch (err) {
            setAlert({
                message: typeof err === "string" ? err : "Invalid admin credentials",
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
            
            {/* Background Glows for Depth */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-purple-300/20 dark:bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-blue-300/20 dark:bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Custom Alert Toast */}
                {alert.show && (
                    <div className="fixed top-6 right-6 bg-white dark:bg-slate-800 border-l-4 border-red-500 shadow-2xl p-4 rounded-xl animate-in slide-in-from-right-5 duration-300 flex items-center gap-3">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                            <Lock className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{alert.message}</p>
                        <button onClick={() => setAlert({ ...alert, show: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 ml-2">✕</button>
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                        <div className="relative w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-white dark:border-slate-800">
                            <ShieldCheck className="w-10 h-10 text-purple-600 dark:text-purple-500" />
                        </div>
                    </div>
                    <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-800 dark:text-white">
                        Admin<span className="text-purple-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Authorized Personnel Only
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/50 dark:border-slate-800 p-8 transition-all duration-300">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                            <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'scale-[1.02]' : ''}`}>
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'username' ? 'text-purple-600' : 'text-slate-400'}`} />
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Admin Username"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-purple-500 dark:focus:border-purple-400 rounded-2xl outline-none text-sm font-medium text-slate-700 dark:text-white transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                            <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-purple-600' : 'text-slate-400'}`} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-purple-500 dark:focus:border-purple-400 rounded-2xl outline-none text-sm font-medium text-slate-700 dark:text-white transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Establish Connection
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Meta */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                        IP Logged • AES-256 Encryption • Security v3.1
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;