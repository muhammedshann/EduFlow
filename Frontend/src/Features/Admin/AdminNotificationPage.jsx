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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            <p className="text-gray-400 text-xs mt-1">{subtext}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBg}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
    </div>
);

const NotificationItem = ({ type, title, message, recipients, date, status }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4 gap-4">
            {/* Left Section: Icon and Text */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className={`shrink-0 mt-1 p-2 rounded-full ${type === 'system' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {type === 'system' ? <AlertCircle size={20} /> : <Info size={20} />}
                </div>
                
                {/* min-w-0 is critical here to allow the title to truncate */}
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 truncate" title={title}>
                        {title}
                    </h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed break-words line-clamp-2">
                        {message}
                    </p>
                </div>
            </div>

            {/* Right Section: Badges (Fixed size so they don't squash) */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-end sm:items-start">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase italic whitespace-nowrap">
                    {status || 'sent'}
                </span>
                <span className={`px-3 py-1 text-white text-[10px] font-black rounded-full uppercase whitespace-nowrap ${recipients > 1 ? 'bg-purple-900' : 'bg-blue-600'}`}>
                    {recipients > 1 ? 'Broadcast' : 'Personal'}
                </span>
            </div>
        </div>

        {/* Footer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center mt-6 pt-4 border-t border-gray-50">
            <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Recipients</p>
                <p className="text-gray-900 font-bold truncate">
                    {recipients} {recipients === 1 ? 'user' : 'users'}
                </p>
                <p className="text-gray-400 text-[10px]">all users</p>
            </div>
            <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Sent Date</p>
                <p className="text-gray-900 font-bold text-sm whitespace-nowrap">{date}</p>
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
            // await api.post('/admin/notifications/', { ...formData, target_type: targetType });
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
        <div className="min-h-screen bg-[#F8F9FB] p-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification Management</h1>
                    <p className="text-gray-500 font-medium">Create and manage notifications sent to users.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard title="Total Sent" value={stats.totalSent} subtext="Notifications" icon={Send} colorClass="text-blue-500" iconBg="bg-blue-50" />
                    {/* <StatCard title="Drafts" value="0" subtext="Saved" icon={Bell} colorClass="text-yellow-500" iconBg="bg-yellow-50" /> */}
                    {/* <StatCard title="Total Reads" value={stats.totalReads} subtext="All-time" icon={CheckCircle} colorClass="text-blue-500" iconBg="bg-blue-50" /> */}
                    {/* <StatCard title="Read Rate" value={`${stats.readRate}%`} subtext="Average" icon={Users} colorClass="text-purple-500" iconBg="bg-purple-50" /> */}
                </div>

                {/* Create Form Section */}
                <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm mb-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Create New Notification</h2>
                            <p className="text-gray-400 text-sm">Send a notification to your users</p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setTargetType('all')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${targetType === 'all' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}
                            >
                                <Users size={16} /> All Users
                            </button>
                            <button
                                onClick={() => setTargetType('personal')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${targetType === 'personal' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}
                            >
                                <User size={16} /> Personal
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Notification title"
                                className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                {targetType === 'all' ? 'Type' : 'Recipient Username'}
                            </label>
                            {targetType === 'all' ? (
                                <div className="relative">
                                    <select
                                        value={formData.notification_type}
                                        onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-gray-50 border-none appearance-none focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 font-medium"
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
                                    className="w-full p-4 rounded-xl bg-gray-50 border-2 border-purple-100 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-800"
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                        <textarea
                            rows="4"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Notification message"
                            className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 outline-none resize-none font-medium text-gray-800"
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="flex items-center gap-3 bg-purple-700 hover:bg-purple-800 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg shadow-purple-200 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Send Now
                        </button>
                        <button className="px-8 py-4 text-gray-400 font-bold hover:text-gray-600 transition">
                            Cancel
                        </button>
                    </div>
                </div>

                {/* History List Section */}
                <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">All Notifications</h2>
                            <p className="text-gray-400 text-sm">Manage sent and draft notifications</p>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    {fetching ? (
                        <div className="flex flex-col items-center py-20 text-gray-400">
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
                        <p className="text-center py-20 text-gray-400 italic">No notifications found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}