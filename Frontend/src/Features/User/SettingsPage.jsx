import {
    User,
    Bell,
    Shield,
    CreditCard,
    Moon,
    Globe,
    Download,
    Trash2,
    Crown,
    Eye,
    EyeOff
} from "lucide-react";
import { useUser } from "../../Context/UserContext";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../../Components/SideBar";
import { useDispatch } from "react-redux";
import { updateProfile, updateProfileImage, updatePassword } from "../../Redux/UserSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../Redux/NotificationSlice";
import api from "../../api/axios";

export default function Settings() {
    const [showPassword, setShowPassword] = useState(false);
    const ProfileInputRef = useRef(null);
    const [settings, setSettings] = useState({
        email_notification: false,
        pomodoro_alert: false,
        habit_reminder: false,
        group_messages: false,
        dark_mode: false
    });
    const { user, setUser } = useUser();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: user.firstname,
        last_name: user.lastname,
        username: user.username,
        email: user.email
    });
    const [PasswordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/accounts/settings/');
                console.log(response.data);

                setSettings(response.data);  // VERY IMPORTANT
                console.log(settings);

            } catch (err) {
                console.log("Settings fetch error:", err);
            }
        };

        fetchSettings();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const firstname = formData.first_name || "";
            const lastname = formData.last_name || "";
            const username = formData.username || "";
            const email = formData.email || "";

            // FIRSTNAME & LASTNAME VALIDATION
            const cleanNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

            // Firstname: No start/end space
            if (firstname.trim() !== firstname) {
                dispatch(showNotification({
                    message: "Firstname cannot start or end with spaces.",
                    type: "error"
                }));
                return;
            }

            // Firstname: Only alphabets
            if (!cleanNameRegex.test(firstname)) {
                dispatch(showNotification({
                    message: "Firstname can only contain alphabets. No numbers, symbols, or extra spaces.",
                    type: "error"
                }));
                return;
            }

            // Lastname: No start/end space
            if (lastname.trim() !== lastname) {
                dispatch(showNotification({
                    message: "Lastname cannot start or end with spaces.",
                    type: "error"
                }));
                return;
            }

            // Lastname: Only alphabets
            if (!cleanNameRegex.test(lastname)) {
                dispatch(showNotification({
                    message: "Lastname can only contain alphabets. No numbers, symbols, or extra spaces.",
                    type: "error"
                }));
                return;
            }

            // USERNAME VALIDATION
            const allowedUsername = /^[a-zA-Z0-9._-]+$/;

            if (username.includes(" ")) {
                dispatch(showNotification({
                    message: "Username cannot contain spaces.",
                    type: "error"
                }));
                return;
            }

            if (username.includes("*")) {
                dispatch(showNotification({
                    message: "Username cannot contain '*' symbol.",
                    type: "error"
                }));
                return;
            }

            if (!allowedUsername.test(username)) {
                dispatch(showNotification({
                    message: "Username can only contain letters, numbers, '.', '_' and '-'.",
                    type: "error"
                }));
                return;
            }

            // EMAIL VALIDATION
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                dispatch(showNotification({
                    message: "Invalid email format.",
                    type: "error"
                }));
                return;
            }
            const result = await dispatch(updateProfile(formData))
        } catch (err) {
            console.log(err);
        }
    }
    const handlePasswordInput = (e) => {
        const { name, value } = e.target;

        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const HandlePassword = async (e) => {
        e.preventDefault();

        const { current_password, new_password, confirm_password } = PasswordData;

        // 1️⃣ Password match check
        if (new_password !== confirm_password) {
            dispatch(showNotification({
                message: "Passwords do not match",
                type: "error",
            }));
            return;
        }

        // 2️⃣ Space validation
        if (new_password.includes(" ")) {
            dispatch(showNotification({
                message: "Password cannot contain spaces.",
                type: "error",
            }));
            return;
        }

        // 3️⃣ Symbol validation
        if (new_password.includes("*")) {
            dispatch(showNotification({
                message: "Password cannot contain '*' symbol.",
                type: "error",
            }));
            return;
        }

        try {
            await dispatch(
                updatePassword({
                    old_password: current_password,
                    new_password: new_password,
                })
            ).unwrap();

            dispatch(showNotification({
                message: "Password updated successfully",
                type: "success",
            }));

            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

        } catch (err) {
            dispatch(showNotification({
                message: err?.message || "Failed to update password",
                type: "error",
            }));
        } 
    };

    const openFileExplorer = () => {
        ProfileInputRef.current.click();
    };

    const handleProfileImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        console.log(file);
        const formData = new FormData();
        formData.append('profile_pic', file)
        try {
            const result = await dispatch(updateProfileImage(formData));
            console.log(result);
            setUser(prev => ({
                ...prev,
                profilePic: result.payload.profilePic   // camelCase
            }));
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex justify-center py-12 px-4 relative ">
            {/* Top-left Arrow Button */}
            {/* <button
                className="absolute top-6 left-6 p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                onClick={() => window.history.back()}
                aria-label="Back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button> */}

            <div className="w-full max-w-4xl space-y-10">
                {/* Wallet Balance (Top-Right Corner) */}
                <div className="absolute top-8 right-8 bg-white shadow-md rounded-xl px-5 py-3 flex items-center gap-3 border border-gray-100 cursor-pointer" onClick={() => navigate('/wallet/')}>
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs text-gray-400 font-medium">Wallet Balance</span>
                        <span className="text-base font-semibold text-gray-800">
                            ${user.walletBalance || 0}
                        </span>
                    </div>
                </div>
                {/* Header */}
                <header className="text-center max-w-2xl mx-auto space-y-2">
                    <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">
                        Settings
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Manage your account preferences and application settings
                    </p>
                </header>

                {/* Profile Section */}
                <section className="bg-white rounded-2xl p-8 shadow-sm flex gap-8 items-start">
                    <div
                        className="w-16 h-16 rounded-full overflow-hidden cursor-pointer"
                    >
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt={`${user.firstname} ${user.lastname}`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold w-full h-full rounded-full">
                                {`${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                                <User className="text-indigo-500 w-5 h-5" /> Profile Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">First Name</label>
                                    <input
                                        name='first_name'
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-200 p-3 focus:outline-indigo-400 focus:ring focus:ring-indigo-200"
                                        defaultValue={formData.first_name}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Last Name</label>
                                    <input
                                        name='last_name'
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-200 p-3 focus:outline-indigo-400 focus:ring focus:ring-indigo-200"
                                        defaultValue={formData.last_name}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm text-gray-500 mb-1 block">Username</label>
                                    <input
                                        name='username'
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-200 p-3 focus:outline-indigo-400 focus:ring focus:ring-indigo-200"
                                        defaultValue={formData.username}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm text-gray-500 mb-1 block">Email Address</label>
                                    <input
                                        name='email'
                                        onChange={handleInputChange}
                                        type="email"
                                        className="w-full rounded-lg border border-gray-200 p-3 focus:outline-indigo-400 focus:ring focus:ring-indigo-200"
                                        defaultValue={formData.email}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-base font-semibold hover:bg-indigo-700 transition">
                                Save Changes
                            </button>
                            <button
                                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-base font-semibold hover:bg-gray-100 transition"
                                onClick={openFileExplorer}
                            >
                                Change Avatar
                            </button>

                            <input
                                type="file"
                                accept="image/*"
                                ref={ProfileInputRef}
                                onChange={handleProfileImage}
                                className="hidden"
                            />

                        </div>
                    </div>
                </section>

                {/* Subscription */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            Subscription
                        </h2>
                        <span className="inline-block bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full font-bold text-sm">
                            Pro Plan
                        </span>
                    </div>
                    <div className="grid grid-cols-3 text-center gap-6 mb-8">
                        <div>
                            <p className="text-xs text-gray-400">Credits Used</p>
                            <p className="mt-1 font-bold text-lg text-gray-700">63</p>
                            <p className="text-sm text-gray-400 mt-1">$24.99/one-time</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Credits Remaining</p>
                            <p className="mt-1 font-bold text-3xl text-indigo-600">247</p>
                            {/* <p className="text-xs text-gray-400 mt-1">Resets in 12 days</p> */}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Purchased Date</p>
                            <p className="mt-1 font-bold text-lg text-gray-700">Dec 15</p>
                            <p className="text-xs text-gray-400 mt-1">2024</p>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-center sm:justify-start">
                        <button className="border border-red-500 text-red-500 rounded-lg px-6 py-2 ml-8 hover:bg-red-50 transition">
                            Add Credits
                        </button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        Notifications
                    </h2>
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
                            <input
                                type="checkbox"
                                checked={!!settings[key]}
                                className="accent-indigo-500 w-5 h-5 rounded cursor-pointer"
                            />
                        </div>
                    ))}
                </section>

                {/* Preferences */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        Preferences
                    </h2>
                    {[
                        { name: "Dark Mode", desc: "Use dark theme across the application", key: 'dark_mode' },
                        // { name: "Sound Effects", desc: "Play sounds for interactions and alerts", checked: true }
                    ].map(({ name, desc, key }, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-gray-100 last:border-b-0 py-3">
                            <div>
                                <p className="font-semibold text-gray-600">{name}</p>
                                <p className="text-xs text-gray-400">{desc}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings[key]}
                                className="accent-indigo-500 w-5 h-5 rounded cursor-pointer"
                            />
                        </div>
                    ))}

                    {/* <hr className="my-6 border-gray-200" /> */}

                    <div className="mt-8 flex items-center gap-2 text-gray-600 font-semibold">
                        <Globe className="w-4 h-4" />
                        <span>English (US)</span>
                    </div>
                </section>

                {/* Security */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Security
                    </h2>

                    <div className="space-y-5 max-w-3xl relative">

                        {/* SINGLE SHOW/HIDE BUTTON FOR ALL */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 text-gray-500 hover:text-purple-600 transition"
                        >
                            {showPassword ? (
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <EyeOff className="h-4 w-4" /> Hide
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <Eye className="h-4 w-4" /> Show
                                </div>
                            )}
                        </button>

                        {/* CURRENT PASSWORD */}
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Current Password
                            </label>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={PasswordData.current_password}
                                name="current_password"
                                onChange={handlePasswordInput}
                                placeholder="Enter current password"
                                className="w-full rounded-lg border border-gray-200 p-3 
                focus:outline-indigo-400 focus:ring-indigo-200"
                            />
                        </div>

                        {/* NEW PASSWORD */}
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                New Password
                            </label>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={PasswordData.new_password}
                                name="new_password"
                                onChange={handlePasswordInput}
                                placeholder="Enter new password"
                                className="w-full rounded-lg border border-gray-200 p-3 
                focus:outline-indigo-400 focus:ring-indigo-200"
                            />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">
                                Confirm Password
                            </label>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={PasswordData.confirm_password}
                                name="confirm_password"
                                onChange={handlePasswordInput}
                                placeholder="Confirm new password"
                                className="w-full rounded-lg border border-gray-200 p-3 
                focus:outline-indigo-400 focus:ring-indigo-200"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 max-w-3xl">
                        <button
                            onClick={HandlePassword}
                            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                            Update Password
                        </button>
                    </div>
                </section>


                {/* Data Management */}
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6">
                        <Download className="w-5 h-5 text-indigo-500" />
                        Data Management
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2 text-base">
                                    Export Data
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Download all your transcripts, habits, and settings
                                </p>
                            </div>
                            <button className="w-full mt-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold">
                                <Download className="inline-block w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-red-600 mb-2 text-base">
                                    Delete Account
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <button className="w-full mt-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-100 transition font-semibold">
                                <Trash2 className="inline-block w-4 h-4 mr-2" />
                                Delete Account
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
