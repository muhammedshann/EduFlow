import React, { useEffect, useRef, useState } from "react";
import {
    User, Bell, Shield, CreditCard, Moon, Globe, Download,
    Trash2, Crown, Eye, EyeOff, PlusCircle, ShieldCheck,
    Key, Timer, X
} from "lucide-react";
import { useUser } from "../../Context/UserContext";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, updateProfileImage, updatePassword, FetchUserSubscription } from "../../Redux/UserSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../Redux/NotificationSlice";
import { fetchWallet } from "../../Redux/WalletSlice";
import { deleteUserAccount, generateOtpEmail, verifyOtpEmail } from "../../Redux/AuthSlice";
import { DeleteConfirmModal } from "../../Components/ConfirmDelete";
import { useTheme } from "../../Context/ThemeContext";

// Cinematic Theme Constants
const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl";
const INPUT_BG = "bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700";

// --- Verification Modal Component ---
const VerificationModal = ({ isOpen, onClose, email, otp, setOtp, timeLeft, formatTime, handleVerify, handleResend, isLoading, alert }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4 transform transition-all animate-in fade-in zoom-in duration-300">
                {alert.show && (
                    <div className={`absolute -top-16 left-0 right-0 p-4 rounded-xl shadow-2xl z-50 transition-all ${alert.type === "success" ? "bg-emerald-500" : "bg-rose-500"} text-white`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5" />
                            <p className="text-sm font-bold">{alert.message}</p>
                        </div>
                    </div>
                )}
                <button onClick={onClose} className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg text-slate-400 hover:text-rose-500 transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>
                <div className={`${GLASS_CARD} rounded-[2.5rem] overflow-hidden`}>
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Verify your Email</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Code sent to <span className="text-indigo-600 dark:text-indigo-400 font-bold break-all">{email}</span></p>
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 text-lg tracking-[0.5em] font-mono text-center font-bold ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500`}
                                />
                            </div>
                            <div className="flex items-center justify-center gap-2 py-1">
                                <Timer className={`w-4 h-4 ${timeLeft > 0 ? "text-indigo-500 animate-pulse" : "text-rose-500"}`} />
                                <span className={`text-sm font-bold ${timeLeft > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"}`}>
                                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code Expired"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleVerify();
                                }}
                                disabled={isLoading || timeLeft === 0 || otp.length !== 6}
                                className="group w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Verify and Update</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Settings Component ---
export default function Settings() {
    const { isDarkMode, toggleTheme } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const ProfileInputRef = useRef(null);
    
    // -- App States --
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const { balance } = useSelector(state => state.wallet);
    const [showPassword, setShowPassword] = useState(false);

    // -- Form States --
    const [formData, setFormData] = useState({
        first_name: user?.firstname || "",
        last_name: user?.lastname || "",
        username: user?.username || "",
        email: user?.email || ""
    });
    const [PasswordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    // -- OTP / Verification States --
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfimrModalOpen, setConfimrModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationAlert, setVerificationAlert] = useState({ show: false, message: "", type: "" });

    // -- Effects --
    useEffect(() => {
        const fetchData = async () => {
            try {
                const PlanResponse = await dispatch(FetchUserSubscription());
                setPlan(PlanResponse.payload);
            } catch (err) {
                console.error("Settings fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // -- Handlers --
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInput = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // -- Finalize Update Logic --
    const finalizeUpdate = async () => {
        try {
            await dispatch(updateProfile(formData)).unwrap();
            setUser(prev => ({ ...prev, ...formData }));
            dispatch(showNotification({ message: "Profile updated successfully", type: "success" }));
            return true;
        } catch (err) {
            dispatch(showNotification({ message: "Update failed", type: "error" }));
            return false;
        }
    };

    // -- Submit Profile --
    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        if (!cleanNameRegex.test(formData.first_name) || !cleanNameRegex.test(formData.last_name)) {
            dispatch(showNotification({ message: "Invalid name format", type: "error" }));
            return;
        }

        if (formData.email !== user.email) {
            handleSendOTP();
        } else {
            finalizeUpdate();
        }
    };

    const handleSendOTP = async () => {
        setIsVerifying(true);
        try {
            await dispatch(generateOtpEmail(formData.email)).unwrap()
            setTimeLeft(300); // 5 mins
            setIsModalOpen(true);
            dispatch(showNotification({ message: "Verification code sent", type: "success" }));
        } catch (err) {
            dispatch(showNotification({ message: err, type: "error" }));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyAndSave = async () => {
        setIsVerifying(true);
        try {
            await dispatch(verifyOtpEmail({ email: formData.email, otp: otp }))
            const success = await finalizeUpdate();
            if (success) {
                setIsModalOpen(false);
                setOtp("");
            }
        } catch (err) {
            setVerificationAlert({ show: true, message: "Invalid or Expired OTP", type: "error" });
        } finally {
            setIsVerifying(false);
        }
    };
    

    const HandlePassword = async (e) => {
        e.preventDefault();
        if (PasswordData.new_password !== PasswordData.confirm_password) {
            dispatch(showNotification({ message: "Passwords do not match", type: "error" }));
            return;
        }
        try {
            await dispatch(updatePassword({ old_password: PasswordData.current_password, new_password: PasswordData.new_password })).unwrap();
            dispatch(showNotification({ message: "Password updated successfully", type: "success" }));
            setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            dispatch(showNotification({ message: err?.message || "Failed to update password", type: "error" }));
        }
    };

    const handleProfileImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        setUser({ profilePic: localPreview });

        const imgFormData = new FormData();
        imgFormData.append('profile_pic', file);
        try {
            const result = await dispatch(updateProfileImage(imgFormData)).unwrap();
            const serverUrl = result.profilePic || result.profile_pic;
        
            setUser({ profilePic: serverUrl });
            dispatch(showNotification({ message: "Avatar updated!", type: "success" }));
        } catch (err) { console.error(err); }
    };

    const HandleDeleteOpen = () => {
        setConfimrModalOpen(true)
    }

    const handleDeleteUser = async () => {
        await dispatch(deleteUserAccount());
        setUser(null);
        navigate('/auth/');
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${GRADIENT_BG} text-slate-500 dark:text-slate-400 font-bold transition-colors duration-300`}>
            Loading...
        </div>
    );

    const purchaseDate = plan?.last_purchase_date ? new Date(plan.last_purchase_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—";

    return (
        // FIXED: Applied Cinematic Gradient
        <div className={`min-h-screen flex justify-center py-6 px-4 md:py-12 relative transition-colors duration-300 ${GRADIENT_BG}`}>
            <div className="w-full max-w-4xl space-y-6 md:space-y-10 relative">
                
                {/* Header & Wallet Wrapper */}
                <div className="flex flex-col-reverse lg:block relative">
                    
                    <header className="text-center max-w-2xl mx-auto space-y-2 mt-4 lg:mt-0">
                        <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Settings</h1>
                        <p className="font-medium text-sm md:text-base text-slate-500 dark:text-slate-400">Manage your account preferences</p>
                    </header>

                    {/* Wallet Balance - Glassmorphism Applied */}
                    <div 
                        className={`w-full lg:w-auto lg:absolute lg:top-0 lg:right-0 shadow-lg rounded-2xl px-5 py-3 flex items-center justify-between lg:justify-start gap-3 border cursor-pointer transition-all duration-300 ${GLASS_CARD} hover:shadow-2xl hover:scale-[1.02]`} 
                        onClick={() => navigate('/wallet/')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <CreditCard size={20} />
                            </div>
                            <div className="flex flex-col leading-tight text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Balance</span>
                                <span className="text-lg font-black text-slate-800 dark:text-white">${balance || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Section - Glassmorphism Applied */}
                <section className={`${GLASS_CARD} rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center md:items-start`}>
                    <div className="w-24 h-24 md:w-20 md:h-20 rounded-3xl overflow-hidden cursor-pointer flex-shrink-0 shadow-2xl border-4 border-white/50 dark:border-slate-800" onClick={() => ProfileInputRef.current.click()}>
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black w-full h-full">
                                {user?.firstname?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                        <h2 className="flex items-center justify-center md:justify-start gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <User className="text-indigo-500 w-5 h-5" /> Profile Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">First Name</label>
                                <input 
                                    name='first_name' 
                                    value={formData.first_name} 
                                    onChange={handleInputChange} 
                                    className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">Last Name</label>
                                <input 
                                    name='last_name' 
                                    value={formData.last_name} 
                                    onChange={handleInputChange} 
                                    className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">Username</label>
                                <input 
                                    name='username' 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">Email Address</label>
                                <input 
                                    name='email' 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    type="email" 
                                    className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95">Save Changes</button>
                            <button 
                                onClick={() => ProfileInputRef.current.click()} 
                                className="flex-1 border py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Change Avatar
                            </button>
                            <input type="file" accept="image/*" ref={ProfileInputRef} onChange={handleProfileImage} className="hidden" />
                        </div>
                    </div>
                </section>

                {/* Subscription Section - Glassmorphism Applied */}
                <section className={`${GLASS_CARD} rounded-[2.5rem] p-8`}>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <Crown className="w-5 h-5 text-amber-400 fill-amber-400" /> Subscription Balance
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-6 mb-8">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:bg-transparent sm:dark:bg-transparent sm:p-0">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Remaining</p>
                            <p className="mt-1 font-black text-4xl text-indigo-600 dark:text-indigo-400">{plan?.remaining_credits || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:bg-transparent sm:dark:bg-transparent sm:p-0">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Used</p>
                            <p className="mt-1 font-black text-2xl text-slate-700 dark:text-slate-300">{plan?.used_credits || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:bg-transparent sm:dark:bg-transparent sm:p-0">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Last Top-up</p>
                            <p className="mt-1 font-black text-2xl text-slate-700 dark:text-slate-300">{purchaseDate}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/subscription-plans/')} className="w-full sm:w-auto bg-indigo-600 text-white rounded-xl px-10 py-3.5 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all hover:bg-indigo-700">
                        <PlusCircle className="w-4 h-4" /> Add Credits
                    </button>
                </section>

                {/* Preferences Section - Glassmorphism Applied */}
                <section className={`${GLASS_CARD} rounded-[2.5rem] p-8`}>
                    <h2 className="flex items-center gap-2 text-lg font-bold mb-6 text-slate-800 dark:text-white">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        Preferences
                    </h2>
                    {[
                        { name: "Dark Mode", desc: "Use dark theme across the application", key: 'dark_mode' },
                    ].map(({ name, desc, key }, i) => (
                        <div key={i} className="flex justify-between items-center border-b last:border-b-0 py-4 border-slate-100 dark:border-slate-800">
                            <div className="pr-4">
                                <p className="font-bold text-slate-700 dark:text-slate-200">{name}</p>
                                <p className="text-xs font-medium text-slate-400">{desc}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={isDarkMode}
                                onChange={toggleTheme}
                                className="accent-indigo-600 w-5 h-5 rounded cursor-pointer flex-shrink-0"
                            />
                        </div>
                    ))}
                    <div className="mt-6 flex items-center gap-2 font-bold text-slate-500 dark:text-slate-400 text-sm">
                        <Globe className="w-4 h-4" />
                        <span>English (US)</span>
                    </div>
                </section>

                {/* Security Section - Glassmorphism Applied */}
                <section className={`${GLASS_CARD} rounded-[2.5rem] p-8`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
                            <Shield className="w-5 h-5 text-indigo-500" /> Security
                        </h2>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="transition text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider">
                            {showPassword ? <div className="flex items-center gap-1"><EyeOff className="h-4 w-4" /> Hide</div> : <div className="flex items-center gap-1"><Eye className="h-4 w-4" /> Show</div>}
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">Current Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={PasswordData.current_password} 
                                name="current_password" 
                                onChange={handlePasswordInput} 
                                className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">New Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={PasswordData.new_password} 
                                name="new_password" 
                                onChange={handlePasswordInput} 
                                className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-slate-400">Confirm Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={PasswordData.confirm_password} 
                                name="confirm_password" 
                                onChange={handlePasswordInput} 
                                className={`w-full rounded-xl p-3.5 transition-all ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium`} 
                            />
                        </div>
                    </div>
                    <button onClick={HandlePassword} className="mt-8 w-full rounded-xl bg-indigo-600 py-3.5 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95">Update Password</button>
                </section>

                {/* Data Management Section - Glassmorphism Applied */}
                <section className={`${GLASS_CARD} rounded-[2.5rem] p-8`}>
                    <h2 className="flex items-center gap-2 text-lg font-bold mb-6 text-slate-800 dark:text-white">
                        <Download className="w-5 h-5 text-indigo-500" /> Data Management
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className={`rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800`}>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Export Data</h3>
                            <button className="w-full mt-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"><Download className="inline-block w-4 h-4 mr-2" /> Export</button>
                        </div>
                        <div className={`rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20`}>
                            <h3 className="font-bold text-rose-600 mb-2">Delete Account</h3>
                            <button 
                                onClick={HandleDeleteOpen} 
                                className="w-full mt-4 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-wider transition border-rose-200 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20 active:scale-95"
                            >
                                <Trash2 className="inline-block w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Verification Modal for Email Change */}
            <VerificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                email={formData.email}
                otp={otp}
                setOtp={setOtp}
                timeLeft={timeLeft}
                formatTime={formatTime}
                handleVerify={handleVerifyAndSave}
                handleResend={handleSendOTP}
                isLoading={isVerifying}
                alert={verificationAlert}
            />

            <DeleteConfirmModal
                isOpen={isConfimrModalOpen}
                onClose={() => setConfimrModalOpen(false)}
                onConfirm={handleDeleteUser}
                title="Delete this Account?"
                message={`Are you sure you want to delete this Account?.`}
            />
        </div>
    );
}