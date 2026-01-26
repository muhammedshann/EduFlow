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
import { fetchWallet } from "../../Redux/WalletSlice"; // Kept import if needed, though unused in render
import { deleteUserAccount, generateOtpEmail, verifyOtpEmail } from "../../Redux/AuthSlice";
import { DeleteConfirmModal } from "../../Components/ConfirmDelete";
import { useTheme } from "../../Context/ThemeContext";

// --- Verification Modal Component ---
const VerificationModal = ({ isOpen, onClose, email, otp, setOtp, timeLeft, formatTime, handleVerify, handleResend, isLoading, alert }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-300">
                {alert.show && (
                    <div className={`absolute -top-16 left-0 right-0 p-4 rounded-xl shadow-2xl z-50 transition-all ${alert.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5" />
                            <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                    </div>
                )}
                <button onClick={onClose} className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg text-gray-400 hover:text-red-500 transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>
                <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800">Verify your Email</h2>
                            <p className="text-gray-500 text-sm mt-1">Code sent to <span className="font-semibold text-purple-600">{email}</span></p>
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 text-lg tracking-[0.5em] font-mono text-center"
                                />
                            </div>
                            <div className="flex items-center justify-center gap-2 py-1">
                                <Timer className={`w-4 h-4 ${timeLeft > 0 ? "text-blue-500 animate-pulse" : "text-red-500"}`} />
                                <span className={`text-sm font-bold ${timeLeft > 0 ? "text-blue-600" : "text-red-600"}`}>
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
                                className="group w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-black dark:bg-[#0F172A] dark:text-white transition-colors duration-300">
            Loading...
        </div>
    );

    const purchaseDate = plan?.last_purchase_date ? new Date(plan.last_purchase_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—";

    return (
        <div className="min-h-screen flex justify-center py-12 px-4 relative transition-colors duration-300 bg-[#FAFAFA] dark:bg-[#0F172A]">
            <div className="w-full max-w-4xl space-y-10">
                {/* Wallet Balance */}
                <div 
                    className="absolute top-8 right-8 shadow-md rounded-xl px-5 py-3 flex items-center gap-3 border cursor-pointer transition-colors duration-300 bg-white border-gray-100 dark:bg-[#1E293B] dark:border-slate-700" 
                    onClick={() => navigate('/wallet/')}
                >
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs font-medium text-gray-400 dark:text-slate-400">Wallet Balance</span>
                        <span className="text-base font-semibold text-gray-800 dark:text-slate-100">${balance || 0}</span>
                    </div>
                </div>

                <header className="text-center max-w-2xl mx-auto space-y-2">
                    <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Settings</h1>
                    <p className="font-medium text-gray-500 dark:text-slate-400">Manage your account preferences</p>
                </header>

                {/* Profile Section */}
                <section className="rounded-2xl p-8 shadow-sm flex gap-8 items-start transition-colors duration-300 bg-white dark:bg-[#1E293B]">
                    <div className="w-16 h-16 rounded-full overflow-hidden cursor-pointer" onClick={() => ProfileInputRef.current.click()}>
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold w-full h-full">
                                {user?.firstname?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-700 dark:text-slate-100">
                            <User className="text-indigo-500 w-5 h-5" /> Profile Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm mb-1 block text-gray-500 dark:text-slate-400">First Name</label>
                                <input 
                                    name='first_name' 
                                    value={formData.first_name} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                                />
                            </div>
                            <div>
                                <label className="text-sm mb-1 block text-gray-500 dark:text-slate-400">Last Name</label>
                                <input 
                                    name='last_name' 
                                    value={formData.last_name} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-sm mb-1 block text-gray-500 dark:text-slate-400">Username</label>
                                <input 
                                    name='username' 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-sm mb-1 block text-gray-500 dark:text-slate-400">Email Address</label>
                                <input 
                                    name='email' 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    type="email" 
                                    className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-base font-semibold hover:bg-indigo-700 transition">Save Changes</button>
                            <button 
                                onClick={() => ProfileInputRef.current.click()} 
                                className="flex-1 border py-2.5 rounded-lg text-base font-semibold transition border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                Change Avatar
                            </button>
                            <input type="file" accept="image/*" ref={ProfileInputRef} onChange={handleProfileImage} className="hidden" />
                        </div>
                    </div>
                </section>

                {/* Subscription Section */}
                <section className="rounded-2xl p-8 shadow-sm transition-colors duration-300 bg-white dark:bg-[#1E293B]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-slate-100">
                            <Crown className="w-5 h-5 text-yellow-400" /> Subscription Balance
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-6 mb-8">
                        <div>
                            <p className="text-xs uppercase font-semibold text-gray-400 dark:text-slate-400">Remaining</p>
                            <p className="mt-1 font-extrabold text-4xl text-indigo-600">{plan?.remaining_credits || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-semibold text-gray-400 dark:text-slate-400">Used</p>
                            <p className="mt-1 font-bold text-2xl text-gray-800 dark:text-slate-200">{plan?.used_credits || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-semibold text-gray-400 dark:text-slate-400">Last Top-up</p>
                            <p className="mt-1 font-bold text-2xl text-gray-800 dark:text-slate-200">{purchaseDate}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/subscription-plans/')} className="w-full sm:w-auto bg-indigo-600 text-white rounded-xl px-10 py-3 font-bold flex items-center justify-center gap-2">
                        <PlusCircle className="w-5 h-5" /> Add Credits
                    </button>
                </section>

                {/* Preferences Section */}
                <section className="rounded-2xl p-8 shadow-sm transition-colors duration-300 bg-white dark:bg-[#1E293B]">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-6 text-gray-700 dark:text-slate-100">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        Preferences
                    </h2>
                    {[
                        { name: "Dark Mode", desc: "Use dark theme across the application", key: 'dark_mode' },
                    ].map(({ name, desc, key }, i) => (
                        <div key={i} className="flex justify-between items-center border-b last:border-b-0 py-3 border-gray-100 dark:border-slate-700">
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-slate-200">{name}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-400">{desc}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={isDarkMode}
                                onChange={toggleTheme}
                                className="accent-indigo-500 w-5 h-5 rounded cursor-pointer"
                            />
                        </div>
                    ))}
                    <div className="mt-8 flex items-center gap-2 font-semibold text-gray-600 dark:text-slate-400">
                        <Globe className="w-4 h-4" />
                        <span>English (US)</span>
                    </div>
                </section>

                {/* Security Section */}
                <section className="rounded-2xl p-8 shadow-sm transition-colors duration-300 bg-white dark:bg-[#1E293B]">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-6 text-gray-700 dark:text-slate-100">
                        <Shield className="w-5 h-5 text-indigo-500" /> Security
                    </h2>
                    <div className="space-y-5 relative">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 transition text-gray-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
                            {showPassword ? <div className="flex items-center gap-1 text-sm font-medium"><EyeOff className="h-4 w-4" /> Hide</div> : <div className="flex items-center gap-1 text-sm font-medium"><Eye className="h-4 w-4" /> Show</div>}
                        </button>
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-slate-300">Current Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={PasswordData.current_password} 
                                name="current_password" 
                                onChange={handlePasswordInput} 
                                className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-slate-300">New Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={PasswordData.new_password} 
                                name="new_password" 
                                onChange={handlePasswordInput} 
                                className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-slate-300">Confirm Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={PasswordData.confirm_password} 
                                name="confirm_password" 
                                onChange={handlePasswordInput} 
                                className="w-full rounded-lg border p-3 transition-colors duration-300 border-gray-200 bg-white dark:bg-[#0F172A] dark:border-slate-700 dark:text-white focus:border-indigo-500" 
                            />
                        </div>
                    </div>
                    <button onClick={HandlePassword} className="mt-8 w-full rounded-lg bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-700 transition">Update Password</button>
                </section>

                {/* Data Management Section */}
                <section className="rounded-2xl p-8 shadow-sm transition-colors duration-300 bg-white dark:bg-[#1E293B]">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-6 text-gray-700 dark:text-slate-100">
                        <Download className="w-5 h-5 text-indigo-500" /> Data Management
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="rounded-lg p-6 flex flex-col justify-between transition-colors duration-300 bg-gray-50 dark:bg-[#0F172A]">
                            <h3 className="font-semibold mb-2 text-gray-700 dark:text-slate-200">Export Data</h3>
                            <button className="w-full mt-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"><Download className="inline-block w-4 h-4 mr-2" /> Export</button>
                        </div>
                        <div className="rounded-lg p-6 flex flex-col justify-between transition-colors duration-300 bg-red-50 dark:bg-red-900/10">
                            <h3 className="font-semibold text-red-600 mb-2">Delete Account</h3>
                            <button 
                                onClick={HandleDeleteOpen} 
                                className="w-full mt-4 py-2 rounded-lg border font-semibold transition border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="inline-block w-4 h-4 mr-2" /> Delete Account
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