import React, { useEffect, useRef, useState } from "react";
import {
    User, Bell, Shield, CreditCard, Moon, Globe, Download,
    Trash2, Crown, Eye, EyeOff, PlusCircle, ShieldCheck,
    Key, Timer, X, Edit3, Check, Calendar, AlertTriangle
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

// --- Custom Components styled with Tailwind ---
const Toggle = ({ on, onToggle }) => (
    <button
        onClick={onToggle}
        aria-label="toggle"
        className={`w-[46px] h-[26px] rounded-full relative flex-shrink-0 transition-colors duration-200 p-0 border cursor-pointer ${
            on 
                ? "bg-[#6C63FF] dark:bg-[#7C75FF] border-[#6C63FF] dark:border-[#7C75FF]" 
                : "bg-[#F0F1F7] dark:bg-[#1F2438] border-[#DDE0EA] dark:border-[#2E3450]"
        }`}
    >
        <span
            className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 ${
                on ? "left-[23px]" : "left-[3px]"
            }`}
        />
    </button>
);

const SectionHeader = ({ icon, title, sub, iconBgClass, iconColorClass }) => (
    <div className="flex items-center gap-3 mb-[22px]">
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconBgClass} ${iconColorClass}`}>
            {icon}
        </div>
        <div>
            <div className="text-[15px] font-semibold text-[#161B2E] dark:text-[#EEF0F8] leading-tight">{title}</div>
            <div className="text-[12px] text-[#A0A6BE] dark:text-[#4d5470] mt-[2px]">{sub}</div>
        </div>
    </div>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-[#1A1D27] border border-[#E8EAF0] dark:border-[#262B3A] rounded-2xl p-6 transition-colors duration-250 ${className}`}>
        {children}
    </div>
);

const Input = ({ label, type = "text", name, value, onChange, placeholder, valid }) => (
    <div className="flex flex-col gap-1.5 focus-within:z-10">
        {label && (
            <label className="text-[12px] font-semibold text-[#5A6080] dark:text-[#8891B0] tracking-[0.03em]">
                {label}
            </label>
        )}
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full py-[9px] pl-3 pr-[34px] rounded-lg bg-[#F3F4F8] dark:bg-[#22263A] text-[13px] text-[#161B2E] dark:text-[#EEF0F8] outline-none font-sans transition-colors duration-150 border box-border ${
                    valid === true 
                        ? "border-[#3B6D11]" 
                        : valid === false 
                            ? "border-[#E24B4A]" 
                            : "border-[#DDE0EA] dark:border-[#2E3450]"
                }`}
            />
            {valid === true && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3B6D11]">
                    <Check size={14} strokeWidth={2.5} />
                </span>
            )}
            {valid === false && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#E24B4A]">
                    <X size={14} strokeWidth={2.5} />
                </span>
            )}
        </div>
    </div>
);


// --- Verification Modal Component ---
const VerificationModal = ({ isOpen, onClose, email, otp, setOtp, timeLeft, formatTime, handleVerify, handleResend, isLoading, alert }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4 transform transition-all animate-in fade-in zoom-in duration-300">
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
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Verify your Email</h2>
                            <p className="text-gray-500 text-sm mt-1">Code sent to <span className="font-semibold text-purple-600 break-all">{email}</span></p>
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C63FF] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/10 outline-none transition-all duration-300 text-lg tracking-[0.5em] font-mono text-center"
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
                                className="group w-full bg-[#6C63FF] hover:bg-[#5b54e5] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

    const pwdStrength = () => {
        const pwd = PasswordData.new_password;
        if (!pwd) return null;
        let s = 0;
        if (pwd.length >= 8) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[0-9]/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        const labels = ["Weak", "Fair", "Good", "Strong"];
        const colors = ["bg-[#E24B4A]", "bg-[#BA7517]", "bg-[#639922]", "bg-[#1D9E75]"];
        const textColors = ["text-[#E24B4A]", "text-[#BA7517]", "text-[#639922]", "text-[#1D9E75]"];
        return { score: s, label: labels[s - 1] || "Weak", color: colors[s - 1] || colors[0], textColor: textColors[s - 1] || textColors[0] };
    };
    const strength = pwdStrength();

    const curValid = PasswordData.current_password.length >= 6 ? true : PasswordData.current_password ? false : undefined;
    const newValid = PasswordData.new_password.length >= 8 ? true : PasswordData.new_password ? false : undefined;
    const conValid = PasswordData.confirm_password ? PasswordData.confirm_password === PasswordData.new_password && PasswordData.new_password.length >= 8 : undefined;


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] dark:bg-[#0F1117] text-[#161B2E] dark:text-[#EEF0F8] transition-colors duration-250">
            <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const purchaseDate = plan?.last_purchase_date ? new Date(plan.last_purchase_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—";

    const creditsUsed = plan?.used_credits || 0;
    const creditsRemaining = plan?.remaining_credits || 0;
    const creditsTotal = creditsUsed + creditsRemaining;
    const pct = creditsTotal > 0 ? Math.round((creditsUsed / creditsTotal) * 100) : 0;

    const divider = <div className="h-[1px] bg-[#E8EAF0] dark:bg-[#262B3A] my-4" />;

    return (
        <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0F1117] font-sans transition-colors duration-250 pb-[60px]">
            {/* Top bar */}
            <div className="bg-white dark:bg-[#1A1D27] border-b border-[#E8EAF0] dark:border-[#262B3A] px-6 md:px-12 flex items-center justify-between h-[60px] sticky top-0 z-50 transition-colors duration-250">
                <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-lg bg-[#6C63FF] dark:bg-[#7C75FF] flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" fill="none" strokeWidth="2" />
                        </svg>
                    </div>
                    <span className="text-[15px] font-bold text-[#161B2E] dark:text-[#EEF0F8] tracking-[-0.01em]">
                        EduFlow
                    </span>
                </div>

                <div className="flex items-center gap-3.5">
                    <span className="hidden md:block text-[13px] text-[#A0A6BE] dark:text-[#4D5470] cursor-pointer hover:text-[#161B2E] dark:hover:text-[#EEF0F8]" onClick={() => navigate('/wallet/')}>
                        Wallet: ${balance || 0}
                    </span>
                    <div className="flex items-center gap-2 bg-[#F0F1F7] dark:bg-[#1F2438] rounded-full px-3 py-1.5 border border-[#E8EAF0] dark:border-[#262B3A]">
                        <Moon className="w-3.5 h-3.5 text-[#5A6080] dark:text-[#8891B0]" />
                        <Toggle on={isDarkMode} onToggle={toggleTheme} />
                    </div>
                    <div className="w-[34px] h-[34px] rounded-full bg-[#EEEDFE] dark:bg-[#1C1C3D] text-[#4B44CC] dark:text-[#A09AFF] flex items-center justify-center text-[13px] font-bold border-2 border-[#6C63FF] dark:border-[#7C75FF] cursor-pointer" onClick={() => ProfileInputRef.current?.click()}>
                         {user?.profilePic ? (
                             <img src={user.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                         ) : (
                             user?.firstname?.[0]?.toUpperCase() || "U"
                         )}
                    </div>
                </div>
            </div>

            {/* Page header */}
            <div className="max-w-[1060px] mx-auto px-4 md:px-8 pt-10">
                <div className="mb-8">
                    <h1 className="text-[26px] font-bold text-[#161B2E] dark:text-[#EEF0F8] m-0 tracking-[-0.02em]">
                        My Profile
                    </h1>
                    <p className="text-[14px] text-[#5A6080] dark:text-[#8891B0] mt-1">
                        Manage your account, subscription, and preferences
                    </p>
                </div>

                {/* Row 1: Profile + Subscription */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                    
                    {/* Profile Card */}
                    <Card>
                        <SectionHeader 
                            icon={<User size={16} strokeWidth={1.8} />} 
                            title="Profile" 
                            sub="Personal information" 
                            iconBgClass="bg-[#EEEDFE] dark:bg-[#1C1C3D]" 
                            iconColorClass="text-[#4B44CC] dark:text-[#A09AFF]" 
                        />

                        {/* Avatar Box */}
                        <div className="flex items-center gap-5 p-4 bg-[#F0F1F7] dark:bg-[#1F2438] border border-[#E8EAF0] dark:border-[#262B3A] rounded-[12px] mb-5">
                            <div className="relative cursor-pointer" onClick={() => ProfileInputRef.current.click()}>
                                <input type="file" accept="image/*" ref={ProfileInputRef} onChange={handleProfileImage} className="hidden" />
                                <div className="w-[70px] h-[70px] rounded-full bg-[#EEEDFE] dark:bg-[#1C1C3D] text-[#4B44CC] dark:text-[#A09AFF] flex items-center justify-center text-[22px] font-bold border-[3px] border-[#6C63FF] dark:border-[#7C75FF] shrink-0">
                                    {user?.profilePic ? (
                                         <img src={user.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user?.firstname?.[0]?.toUpperCase() || "U"
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-[#6C63FF] dark:bg-[#7C75FF] flex items-center justify-center border-2 border-white dark:border-[#1A1D27]">
                                    <Edit3 size={12} className="text-white" strokeWidth={2} />
                                </div>
                            </div>
                            <div>
                                <div className="text-[16px] font-bold text-[#161B2E] dark:text-[#EEF0F8]">{formData.first_name || "User"} {formData.last_name || ""}</div>
                                <div className="text-[12px] text-[#A0A6BE] dark:text-[#4d5470] mt-0.5">@{formData.username || "username"} · EduFlow Member</div>
                                <div className="inline-flex items-center gap-1 bg-[#EEEDFE] dark:bg-[#1C1C3D] text-[#4B44CC] dark:text-[#A09AFF] rounded-full px-2.5 py-[2px] text-[11px] font-semibold mt-1.5">
                                    <ShieldCheck size={12} strokeWidth={2.5} /> Verified
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input label="First name" name="first_name" value={formData.first_name} onChange={handleInputChange} />
                            <Input label="Last name" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <Input label="Username" name="username" value={formData.username} onChange={handleInputChange} />
                            <Input label="Email address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>

                        <div className="flex gap-2.5">
                            <button
                                onClick={handleSubmit}
                                className="px-5 py-[9px] rounded-lg bg-[#6C63FF] dark:bg-[#7C75FF] hover:bg-[#5b54e5] text-white font-semibold text-[13px] border-none transition-colors"
                            >
                                Save changes
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-5 py-[9px] rounded-lg bg-transparent text-[#5A6080] dark:text-[#8891B0] border border-[#DDE0EA] dark:border-[#2E3450] font-medium text-[13px] hover:bg-[#F3F4F8] dark:hover:bg-[#22263A] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </Card>

                    {/* Subscription Card */}
                    <Card>
                        <SectionHeader 
                            icon={<CreditCard size={16} strokeWidth={1.8} />} 
                            title="Subscription" 
                            sub="Credit usage & billing" 
                            iconBgClass="bg-[#F0FAF0] dark:bg-[#0E1F10]" 
                            iconColorClass="text-[#276630] dark:text-[#6EC97B]" 
                        />

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                           <div className="bg-[#F0F1F7] dark:bg-[#1F2438] rounded-xl p-[14px_16px] border border-[#E8EAF0] dark:border-[#262B3A]">
                                <div className="text-[11px] text-[#A0A6BE] dark:text-[#4D5470] mb-1.5 tracking-[0.04em] uppercase">Remaining</div>
                                <div className="text-[24px] font-bold text-[#6C63FF] dark:text-[#7C75FF]">{creditsRemaining}</div>
                           </div>
                           <div className="bg-[#F0F1F7] dark:bg-[#1F2438] rounded-xl p-[14px_16px] border border-[#E8EAF0] dark:border-[#262B3A]">
                                <div className="text-[11px] text-[#A0A6BE] dark:text-[#4D5470] mb-1.5 tracking-[0.04em] uppercase">Used</div>
                                <div className="text-[24px] font-bold text-[#5A6080] dark:text-[#8891B0]">{creditsUsed}</div>
                           </div>
                           <div className="bg-[#F0F1F7] dark:bg-[#1F2438] rounded-xl p-[14px_16px] border border-[#E8EAF0] dark:border-[#262B3A]">
                                <div className="text-[11px] text-[#A0A6BE] dark:text-[#4D5470] mb-1.5 tracking-[0.04em] uppercase">Total</div>
                                <div className="text-[24px] font-bold text-[#161B2E] dark:text-[#EEF0F8]">{creditsTotal}</div>
                           </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-[18px]">
                            <div className="flex justify-between text-[12px] text-[#5A6080] dark:text-[#8891B0] mb-2">
                                <span>Credits used</span>
                                <span className="font-semibold text-[#161B2E] dark:text-[#EEF0F8]">{pct}%</span>
                            </div>
                            <div className="h-2 bg-[#F0F1F7] dark:bg-[#1F2438] rounded-full overflow-hidden border border-[#E8EAF0] dark:border-[#262B3A]">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${pct}%`,
                                        background: pct > 80 ? "#E24B4A" : pct > 60 ? "#BA7517" : (isDarkMode ? "#7C75FF" : "#6C63FF")
                                    }}
                                />
                            </div>
                        </div>

                        {/* Renew badge */}
                        <div className="inline-flex items-center gap-1.5 bg-[#F0FAF0] dark:bg-[#0E1F10] text-[#276630] dark:text-[#6EC97B] rounded-lg px-3 py-1.5 text-[12px] font-medium mb-[18px] border border-[#CCEBD0] dark:border-[#1A3D1C]">
                            <Calendar size={13} strokeWidth={2} /> Last Top-up: {purchaseDate}
                        </div>

                        {divider}

                        <button
                            onClick={() => navigate('/subscription-plans/')}
                            className="w-full py-[11px] px-5 rounded-lg bg-[#6C63FF] dark:bg-[#7C75FF] hover:bg-[#5b54e5] text-white font-semibold text-[14px] flex items-center justify-center gap-[7px] transition-colors"
                        >
                            <PlusCircle size={16} strokeWidth={2.5} /> Add Credits
                        </button>
                    </Card>
                </div>

                {/* Row 2: Security + Preferences + Danger */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {/* Security Card */}
                    <Card>
                        <SectionHeader 
                            icon={<Shield size={16} strokeWidth={1.8} />} 
                            title="Security" 
                            sub="Change your password" 
                            iconBgClass="bg-[#FFFBF0] dark:bg-[#231A09]" 
                            iconColorClass="text-[#7A5A10] dark:text-[#D4A842]" 
                        />

                        <div className="flex flex-col gap-3">
                            <Input
                                label="Current password"
                                name="current_password"
                                type={showPassword ? "text" : "password"}
                                value={PasswordData.current_password}
                                onChange={handlePasswordInput}
                                placeholder="Enter current password"
                                valid={curValid}
                            />
                            <Input
                                label="New password"
                                name="new_password"
                                type={showPassword ? "text" : "password"}
                                value={PasswordData.new_password}
                                onChange={handlePasswordInput}
                                placeholder="Min 8 characters"
                                valid={newValid}
                            />
                            <Input
                                label="Confirm new password"
                                name="confirm_password"
                                type={showPassword ? "text" : "password"}
                                value={PasswordData.confirm_password}
                                onChange={handlePasswordInput}
                                placeholder="Repeat new password"
                                valid={PasswordData.confirm_password ? conValid : undefined}
                            />
                        </div>

                        {/* Password Toggle */}
                        <div className="mt-3 flex justify-end">
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center gap-1 text-[12px] font-semibold text-[#5A6080] dark:text-[#8891B0] hover:text-[#6C63FF] dark:hover:text-[#7C75FF] transition-colors">
                                {showPassword ? <><EyeOff size={14}/> Hide Password</> : <><Eye size={14}/> Show Password</>}
                            </button>
                        </div>

                        {/* Strength meter */}
                        <div className="mt-2">
                            <div className="h-[5px] bg-[#F0F1F7] dark:bg-[#1F2438] rounded-full overflow-hidden border border-[#E8EAF0] dark:border-[#262B3A]">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${strength?.color || "bg-[#A0A6BE]"}`}
                                    style={{ width: strength ? `${(strength.score / 4) * 100}%` : "0%" }}
                                />
                            </div>
                            {strength && (
                                <div className={`text-[12px] mt-[5px] font-medium ${strength.textColor}`}>
                                    Strength: {strength.label}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={HandlePassword}
                            className="w-full mt-4 py-2.5 rounded-[9px] bg-[#6C63FF] dark:bg-[#7C75FF] hover:bg-[#5b54e5] text-white font-semibold text-[13px] transition-colors"
                        >
                            Update password
                        </button>
                    </Card>

                    {/* Preferences Card */}
                    <Card>
                        <SectionHeader 
                            icon={<Bell size={16} strokeWidth={1.8} />} 
                            title="Preferences" 
                            sub="App & theme settings" 
                            iconBgClass="bg-[#EEEDFE] dark:bg-[#1C1C3D]" 
                            iconColorClass="text-[#4B44CC] dark:text-[#A09AFF]" 
                        />

                        {[
                            { label: "Dark mode", sub: "Switch interface theme", on: isDarkMode, toggle: toggleTheme },
                        ].map(({ label, sub, on, toggle }) => (
                            <div key={label} className="flex items-center justify-between py-3.5 border-b border-[#E8EAF0] dark:border-[#262B3A] last:border-0">
                                <div>
                                    <div className="text-[13px] font-semibold text-[#161B2E] dark:text-[#EEF0F8]">{label}</div>
                                    <div className="text-[12px] text-[#A0A6BE] dark:text-[#4D5470] mt-0.5">{sub}</div>
                                </div>
                                <Toggle on={on} onToggle={toggle} />
                            </div>
                        ))}

                        <div className="mt-5 bg-[#F0F1F7] dark:bg-[#1F2438] rounded-[10px] p-[12px_14px] border border-[#E8EAF0] dark:border-[#262B3A]">
                            <div className="text-[12px] text-[#A0A6BE] dark:text-[#4D5470] mb-1">Language</div>
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-[#4D5470] dark:text-[#A0A6BE]" />
                                <select className="w-full bg-transparent border-none text-[#161B2E] dark:text-[#EEF0F8] text-[13px] font-medium outline-none cursor-pointer">
                                    <option>English (US)</option>
                                    <option>Hindi</option>
                                    <option>Malayalam</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Danger Zone */}
                    <Card>
                        <SectionHeader 
                            icon={<AlertTriangle size={16} strokeWidth={1.8} />} 
                            title="Danger zone" 
                            sub="Irreversible actions" 
                            iconBgClass="bg-[#FFF0F0] dark:bg-[#2A1515]" 
                            iconColorClass="text-[#E24B4A]" 
                        />

                        <div className="flex flex-col gap-3.5">
                            <div className="rounded-[12px] border border-[#E8EAF0] dark:border-[#262B3A] bg-[#F0F1F7] dark:bg-[#1F2438] p-[14px_16px]">
                                <div className="text-[13px] font-semibold text-[#161B2E] dark:text-[#EEF0F8] mb-1">Export your data</div>
                                <div className="text-[12px] text-[#A0A6BE] dark:text-[#4D5470] mb-3">
                                    Download all learning history and progress.
                                </div>
                                <button
                                    onClick={() => dispatch(showNotification({ message: "Export request submitted", type: "success" }))}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-transparent border border-[#DDE0EA] dark:border-[#2E3450] text-[#161B2E] dark:text-[#EEF0F8] text-[13px] font-medium hover:bg-[#E8EAF0] dark:hover:bg-[#262B3A] transition-colors"
                                >
                                    <Download size={14} strokeWidth={2} /> Export data
                                </button>
                            </div>

                            <div className="rounded-[12px] border border-[#FACCCC] dark:border-[#4A1515] bg-[#FFF0F0] dark:bg-[#2A1515] p-[14px_16px]">
                                <div className="text-[13px] font-semibold text-[#E24B4A] mb-1">
                                    Delete account
                                </div>
                                <div className="text-[12px] text-[#A0A6BE] dark:text-[#4D5470] mb-3">
                                    Permanently removes your account immediately.
                                </div>
                                <button
                                    onClick={HandleDeleteOpen}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E24B4A] hover:bg-[#c94241] text-white font-semibold text-[13px] transition-colors"
                                >
                                    <Trash2 size={14} /> Delete account
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
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
                message="Are you sure you want to delete this Account? This is irreversible."
            />
        </div>
    );
}
