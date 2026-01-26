import React, { useState, useEffect } from 'react';
import {
    Send, Users, CheckCircle, Bell, Search,
    ChevronDown, Edit3, AlertCircle, Info, User, Loader2
} from 'lucide-react';
import axios from 'axios';
import api from '../../api/axios';
import { SentNotification } from '../../Redux/AdminRedux/AdminNotificationSlice';
import { useDispatch } from 'react-redux';

// --- Sub-Components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, iconBg }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-300">
        <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{subtext}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBg} dark:bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
    </div>
);

const NotificationItem = ({ type, title, message, recipients, date, status }) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mb-4 hover:shadow-md dark:hover:shadow-slate-700/30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            {/* Left Section: Icon and Text */}
            <div className="flex items-start gap-4 min-w-0 flex-1 w-full">
                <div className={`shrink-0 mt-1 p-2 rounded-full 
                    ${type === 'system' 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' 
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'}`}>
                    {type === 'system' ? <AlertCircle size={20} /> : <Info size={20} />}
                </div>
                
                {/* min-w-0 is critical here to allow the title to truncate */}
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-base" title={title}>
                        {title}
                    </h4>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 leading-relaxed break-words line-clamp-2">
                        {message}
                    </p>
                </div>
            </div>

            {/* Right Section: Badges */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0 items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-black rounded-full uppercase italic whitespace-nowrap">
                    {status || 'sent'}
                </span>
                <span className={`px-3 py-1 text-white text-[10px] font-black rounded-full uppercase whitespace-nowrap ${recipients > 1 ? 'bg-purple-900 dark:bg-purple-700' : 'bg-blue-600 dark:bg-blue-500'}`}>
                    {recipients > 1 ? 'Broadcast' : 'Personal'}
                </span>
            </div>
        </div>

        {/* Footer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center mt-6 pt-4 border-t border-gray-50 dark:border-slate-700">
            <div className="min-w-0">
                <p className="text-gray-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest">Recipients</p>
                <p className="text-gray-900 dark:text-white font-bold truncate">
                    {recipients} {recipients === 1 ? 'user' : 'users'}
                </p>
                <p className="text-gray-400 dark:text-slate-600 text-[10px]">all users</p>
            </div>
            <div>
                <p className="text-gray-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest">Sent Date</p>
                <p className="text-gray-900 dark:text-white font-bold text-sm whitespace-nowrap">{date}</p>
            </div>
        </div>
    </div>
);

// --- Main Page ---

export default function NotificationManagement() {
    const dispatch = useDispatch();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        totalSent: 0,
        totalUsers: 0
    });
    const [targetType, setTargetType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        title: '',
        notification_type: 'system',
        message: '',
        username: ''
    });

    const fetchData = async () => {
        try {
            // Adjust URL to your local setup
            const response = await api.get('/admin/notifications/');
            if (response.data) {
                setHistory(response.data.history || []);
                setStats(response.data.stats || { totalSent: 0, totalReads: 0, readRate: 0, totalUsers: 0 });
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSend = async () => {
        if (!formData.title || !formData.message) return alert("Fill in title and message");
        if (targetType === 'personal' && !formData.username) return alert("Username is required");

        setLoading(true);
        try {
            const payload = {
                data: formData, 
                target_type: targetType // 'all' or 'personal'
            };
            await dispatch(SentNotification(payload));
            setFormData({ title: '', notification_type: 'system', message: '', username: '' });
            fetchData();
            alert("Sent successfully!");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to send notification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-900 p-4 sm:p-8 font-sans transition-colors duration-300">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Notification Management</h1>
                    <p className="text-gray-500 dark:text-slate-400 font-medium text-sm sm:text-base">Create and manage notifications sent to users.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
                    <StatCard 
                        title="Total Sent" 
                        value={stats.totalSent} 
                        subtext="Notifications" 
                        icon={Send} 
                        colorClass="text-blue-500 dark:text-blue-400" 
                        iconBg="bg-blue-50 dark:bg-blue-900" 
                    />
                </div>

                {/* Create Form Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-slate-700 shadow-sm mb-10 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Notification</h2>
                            <p className="text-gray-400 dark:text-slate-500 text-sm">Send a notification to your users</p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setTargetType('all')}
                                className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    targetType === 'all' 
                                    ? 'bg-white dark:bg-slate-600 text-purple-700 dark:text-purple-300 shadow-sm' 
                                    : 'text-gray-500 dark:text-slate-400'
                                }`}
                            >
                                <Users size={16} /> All Users
                            </button>
                            <button
                                onClick={() => setTargetType('personal')}
                                className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    targetType === 'personal' 
                                    ? 'bg-white dark:bg-slate-600 text-purple-700 dark:text-purple-300 shadow-sm' 
                                    : 'text-gray-500 dark:text-slate-400'
                                }`}
                            >
                                <User size={16} /> Personal
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Notification title"
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800 dark:text-white transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                {targetType === 'all' ? 'Type' : 'Recipient Username'}
                            </label>
                            {targetType === 'all' ? (
                                <div className="relative">
                                    <select
                                        value={formData.notification_type}
                                        onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-none appearance-none focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 dark:text-slate-300 font-medium transition-colors"
                                    >
                                        <option value="system">System Update</option>
                                        <option value="feature">New Feature</option>
                                        <option value="alert">Account Alert</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            ) : (
                                <input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="e.g. muhammed_01"
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-2 border-purple-100 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800 dark:text-white transition-colors"
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Message</label>
                        <textarea
                            rows="4"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Notification message"
                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-purple-500 outline-none resize-none font-medium text-gray-800 dark:text-white transition-colors"
                        ></textarea>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-purple-700 hover:bg-purple-800 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg shadow-purple-200 dark:shadow-none disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Send Now
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 text-gray-400 dark:text-slate-500 font-bold hover:text-gray-600 dark:hover:text-slate-300 transition">
                            Cancel
                        </button>
                    </div>
                </div>

                {/* History List Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Notifications</h2>
                            <p className="text-gray-400 dark:text-slate-500 text-sm">Manage sent and draft notifications</p>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                            <input
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors"
                            />
                        </div>
                    </div>

                    {fetching ? (
                        <div className="flex flex-col items-center py-20 text-gray-400 dark:text-slate-500">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Fetching records...</p>
                        </div>
                    ) : history.length > 0 ? (
                        history
                            .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item, index) => (
                                <NotificationItem
                                    key={index}
                                    type={item.notification_type}
                                    title={item.title}
                                    message={item.message}
                                    recipients={item.recipient_count}
                                    date={new Date(item.created_at).toLocaleString()}
                                    readCount={item.read_count}
                                    readRate={`${((item.read_count / item.recipient_count) * 100).toFixed(1)}%`}
                                    status="sent"
                                />
                            ))
                    ) : (
                        <p className="text-center py-20 text-gray-400 dark:text-slate-500 italic">No notifications found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}