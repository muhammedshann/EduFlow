import {
    User, Bell, Shield, CreditCard, Moon, Globe, Download,
    Trash2, Crown, Eye, EyeOff, PlusCircle
} from "lucide-react";
import { useUser } from "../../Context/UserContext";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../../Components/SideBar";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, updateProfileImage, updatePassword, FetchUserSubscription } from "../../Redux/UserSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../Redux/NotificationSlice";
import api from "../../api/axios";
import { fetchWallet } from "../../Redux/WalletSlice";

export default function Settings() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const ProfileInputRef = useRef(null);

    // -- States --
    const [showPassword, setShowPassword] = useState(false);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true); // Added loading state
    const { balance } = useSelector(state => state.wallet);
    const [settings, setSettings] = useState({
        email_notification: false,
        pomodoro_alert: false,
        habit_reminder: false,
        group_messages: false,
        dark_mode: false
    });

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

    // useEffect(() => {
    //     dispatch(fetchWallet());
    // }, [dispatch]);

    // -- Handlers --
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInput = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        // Logic to sync with backend could go here: api.patch('/accounts/settings/', { [key]: !settings[key] })
    };

    // -- Fetch Data --
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/accounts/settings/');
                const PlanResponse = await dispatch(FetchUserSubscription());
                
                setSettings(response.data);
                setPlan(PlanResponse.payload);
            } catch (err) {
                console.error("Settings fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch]);

    const formatPurchaseDate = (dateString) => {
        if (!dateString) return { day: "No Data", year: "—" };
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            year: date.getFullYear()
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ... (Your validation logic remains the same)
            const cleanNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
            if (!cleanNameRegex.test(formData.first_name) || !cleanNameRegex.test(formData.last_name)) {
                dispatch(showNotification({ message: "Invalid name format", type: "error" }));
                return;
            }

            await dispatch(updateProfile(formData)).unwrap();
            dispatch(showNotification({ message: "Profile updated successfully", type: "success" }));
        } catch (err) {
            console.error(err);
        }
    };

    const HandlePassword = async (e) => {
        e.preventDefault();
        if (PasswordData.new_password !== PasswordData.confirm_password) {
            dispatch(showNotification({ message: "Passwords do not match", type: "error" }));
            return;
        }

        try {
            await dispatch(updatePassword({
                old_password: PasswordData.current_password,
                new_password: PasswordData.new_password,
            })).unwrap();

            dispatch(showNotification({ message: "Password updated successfully", type: "success" }));
            setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            dispatch(showNotification({ message: err?.message || "Failed to update password", type: "error" }));
        }
    };

    const handleProfileImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const imgFormData = new FormData();
        imgFormData.append('profile_pic', file);
        try {
            const result = await dispatch(updateProfileImage(imgFormData)).unwrap();
            setUser(prev => ({ ...prev, profilePic: result.profilePic }));
        } catch (err) {
            console.error(err);
        }
    };

    // -- Guard Clause --
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">Loading...</div>;
    }

    const purchaseDate = formatPurchaseDate(plan?.last_purchase_date);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex justify-center py-12 px-4 relative ">
            <div className="w-full max-w-4xl space-y-10">
                {/* Wallet Balance */}
                <div className="absolute top-8 right-8 bg-white shadow-md rounded-xl px-5 py-3 flex items-center gap-3 border border-gray-100 cursor-pointer" onClick={() => navigate('/wallet/')}>
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs text-gray-400 font-medium">Wallet Balance</span>
                        <span className="text-base font-semibold text-gray-800">
                            ${balance || 0}
                        </span>
                    </div>
                </div>

                <header className="text-center max-w-2xl mx-auto space-y-2">
                    <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Settings</h1>
                    <p className="text-gray-500 font-medium">Manage your account preferences and application settings</p>
                </header>

                {/* Profile Section */}
                <section className="bg-white rounded-2xl p-8 shadow-sm flex gap-8 items-start">
                    <div className="w-16 h-16 rounded-full overflow-hidden cursor-pointer" onClick={() => ProfileInputRef.current.click()}>
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold w-full h-full rounded-full">
                                {`${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                            <User className="text-indigo-500 w-5 h-5" /> Profile Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">First Name</label>
                                <input name='first_name' value={formData.first_name} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 p-3" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">Last Name</label>
                                <input name='last_name' value={formData.last_name} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 p-3" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-sm text-gray-500 mb-1 block">Username</label>
                                <input name='username' value={formData.username} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 p-3" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-sm text-gray-500 mb-1 block">Email Address</label>
                                <input name='email' value={formData.email} onChange={handleInputChange} type="email" className="w-full rounded-lg border border-gray-200 p-3" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-base font-semibold hover:bg-indigo-700 transition">Save Changes</button>
                            <button className="flex-1 border border-gray-300 py-2.5 rounded-lg text-base font-semibold hover:bg-gray-100 transition" onClick={() => ProfileInputRef.current.click()}>Change Avatar</button>
                            <input type="file" accept="image/*" ref={ProfileInputRef} onChange={handleProfileImage} className="hidden" />
                        </div>
                    </div>
                </section>

                {/* Subscription Section */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700"><Crown className="w-5 h-5 text-yellow-400" /> Subscription Balance</h2>
                        <span className={`inline-block px-4 py-1.5 rounded-full font-bold text-sm ${plan?.remaining_credits > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {plan?.remaining_credits > 0 ? 'Active Account' : 'Out of Credits'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-6 mb-8">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Used</p>
                            <p className="mt-1 font-bold text-2xl text-gray-800">{plan?.used_credits || 0}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Out of {plan?.total_credits || 0} Total</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Remaining</p>
                            <p className="mt-1 font-extrabold text-4xl text-indigo-600">{plan?.remaining_credits || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Last Top-up</p>
                            <p className="mt-1 font-bold text-2xl text-gray-800">{purchaseDate.day}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{purchaseDate.year}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/subscription-plans/')} className="w-full sm:w-auto bg-indigo-600 text-white rounded-xl px-10 py-3 font-bold flex items-center justify-center gap-2"><PlusCircle className="w-5 h-5" /> Add Credits</button>
                </section>

                {/* Notifications */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6"><Bell className="w-5 h-5 text-indigo-500" /> Notifications</h2>
                    {[
                        { name: "Email Notifications", description: "Receive updates via email", key: 'email_notification' },
                        { name: "Pomodoro Alerts", description: "Sound alerts for timer completion", key: 'pomodoro_alert' },
                        { name: "Habit Reminders", description: "Daily reminders for uncompleted habits", key: 'habit_reminder' },
                        { name: "Group Messages", description: "Notifications for group chat messages", key: 'group_messages' }
                    ].map(({ name, description, key }, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-gray-100 last:border-b-0 py-3">
                            <div>
                                <p className="font-semibold text-gray-600">{name}</p>
                                <p className="text-xs text-gray-400">{description}</p>
                            </div>
                            <input type="checkbox" checked={!!settings[key]} onChange={() => handleToggle(key)} className="accent-indigo-500 w-5 h-5 cursor-pointer" />
                        </div>
                    ))}
                </section>

                {/* Preferences */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6"><Moon className="w-5 h-5 text-indigo-500" /> Preferences</h2>
                    <div className="flex justify-between items-center py-3">
                        <div>
                            <p className="font-semibold text-gray-600">Dark Mode</p>
                            <p className="text-xs text-gray-400">Use dark theme across the application</p>
                        </div>
                        <input type="checkbox" checked={!!settings.dark_mode} onChange={() => handleToggle('dark_mode')} className="accent-indigo-500 w-5 h-5 cursor-pointer" />
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-gray-600 font-semibold"><Globe className="w-4 h-4" /><span>English (US)</span></div>
                </section>

                {/* Security */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6"><Shield className="w-5 h-5 text-indigo-500" /> Security</h2>
                    <div className="space-y-5 max-w-3xl relative">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 text-gray-500 hover:text-purple-600 transition">
                            {showPassword ? <div className="flex items-center gap-1 text-sm font-medium"><EyeOff className="h-4 w-4" /> Hide</div> : <div className="flex items-center gap-1 text-sm font-medium"><Eye className="h-4 w-4" /> Show</div>}
                        </button>
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Current Password</label>
                            <input type={showPassword ? "text" : "password"} value={PasswordData.current_password} name="current_password" onChange={handlePasswordInput} placeholder="Enter current password" className="w-full rounded-lg border border-gray-200 p-3" />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">New Password</label>
                            <input type={showPassword ? "text" : "password"} value={PasswordData.new_password} name="new_password" onChange={handlePasswordInput} placeholder="Enter new password" className="w-full rounded-lg border border-gray-200 p-3" />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Confirm Password</label>
                            <input type={showPassword ? "text" : "password"} value={PasswordData.confirm_password} name="confirm_password" onChange={handlePasswordInput} placeholder="Confirm new password" className="w-full rounded-lg border border-gray-200 p-3" />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-4 max-w-3xl">
                        <button onClick={HandlePassword} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-700 transition">Update Password</button>
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6"><Download className="w-5 h-5 text-indigo-500" /> Data Management</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-between">
                            <div><h3 className="font-semibold text-gray-700 mb-2">Export Data</h3><p className="text-xs text-gray-400">Download all your transcripts, habits, and settings</p></div>
                            <button className="w-full mt-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"><Download className="inline-block w-4 h-4 mr-2" /> Export</button>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6 flex flex-col justify-between">
                            <div><h3 className="font-semibold text-red-600 mb-2">Delete Account</h3><p className="text-xs text-gray-400">Permanently delete your account and all data</p></div>
                            <button className="w-full mt-4 py-2 rounded-lg border border-red-500 text-red-600 font-semibold"><Trash2 className="inline-block w-4 h-4 mr-2" /> Delete Account</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}