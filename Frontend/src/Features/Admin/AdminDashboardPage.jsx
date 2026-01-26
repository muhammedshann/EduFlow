import React, { useState, useEffect } from 'react';
import {
    Users, Wallet, CreditCard, Activity,
    Mic, Bell, Search, Download, TrendingUp,
    Clock, AlertCircle, CheckCircle2, ShoppingBag, BarChart3, FileCheck
} from 'lucide-react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get('admin/dashboard-stats/');
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.detail || err.message || "Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-red-100 dark:border-red-900/30 text-center">
                    <AlertCircle className="text-red-500 dark:text-red-400 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Connection Error</h2>
                    <p className="text-gray-600 dark:text-slate-300 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Retry</button>
                </div>
            </div>
        );
    }

    // UPDATED STATS GRID WITH DARK MODE CLASSES
    const stats = [
        { 
            name: 'Total Users', 
            value: data?.stats?.total_users?.toLocaleString() || '0', 
            icon: Users, 
            color: 'text-blue-600 dark:text-blue-400', 
            bg: 'bg-blue-100 dark:bg-blue-900/20' 
        },
        { 
            name: 'Total Revenue', 
            value: `₹${parseFloat(data?.stats?.total_revenue || 0).toLocaleString()}`, 
            icon: Wallet, 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-100 dark:bg-green-900/20' 
        },
        { 
            name: 'Total Credits Bought', 
            value: data?.stats?.credits_bought?.toLocaleString() || '0', 
            icon: ShoppingBag, 
            color: 'text-purple-600 dark:text-purple-400', 
            bg: 'bg-purple-100 dark:bg-purple-900/20' 
        },
        { 
            name: 'Credits Used', 
            value: data?.stats?.credits_used?.toLocaleString() || '0', 
            icon: CreditCard, 
            color: 'text-orange-600 dark:text-orange-400', 
            bg: 'bg-orange-100 dark:bg-orange-900/20' 
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Overview</h2>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">Platform health and credit economy.</p>
                    </div>
                </header>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md dark:hover:shadow-slate-700/30 transition-all">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mb-1">{stat.name}</p>
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg transition-colors`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* --- RECENT TRANSACTIONS --- */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                            <button onClick={() => navigate('/admin/subscriptions')} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Bundle</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                                    {data?.recent_purchases?.map((purchase, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">{purchase.user_email}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{purchase.bundle_name || "Custom"}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">₹{purchase.total_amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    purchase.status === 'success' 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    purchase.status === 'pending' 
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {purchase.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- SYSTEM USAGE --- */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between transition-colors">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">System Usage</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium">
                                        <FileCheck size={18} className="text-indigo-500 dark:text-indigo-400" /> Files Processed
                                    </span>
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{data?.usage_metrics?.total_files_processed || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium">
                                        <Users size={18} className="text-emerald-500 dark:text-emerald-400" /> New Users Today
                                    </span>
                                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{data?.stats?.new_users_today || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">ChatBot Engagement (7d)</p>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    {data?.usage_metrics?.chatbot_7d_requests || 0} Req
                                </span>
                            </div>
                            <div className="flex items-end gap-1.5 h-16">
                                {[20, 40, 30, 70, 50, 90, 60].map((h, i) => (
                                    <div 
                                        key={i} 
                                        className="flex-1 bg-indigo-50 dark:bg-slate-700 rounded-t hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-all cursor-help" 
                                        style={{ height: `${h}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* --- PRODUCTIVITY METRICS --- */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="text-indigo-500 dark:text-indigo-400" size={20} /> Productivity Metrics (Today)
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="text-orange-500 dark:text-orange-400" size={18} />
                                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Pomodoro</span>
                                </div>
                                <h4 className="text-2xl font-black text-orange-700 dark:text-orange-200">
                                    {data?.product_metrics?.pomodoros_today || 0}
                                </h4>
                                <p className="text-xs text-orange-600 dark:text-orange-400/80 font-medium">Daily Target Reached</p>
                            </div>

                            <div className="flex flex-col p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="text-emerald-500 dark:text-emerald-400" size={18} />
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Habit Success</span>
                                </div>
                                <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-200">
                                    {data?.product_metrics?.habit_success_rate || 0}%
                                </h4>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400/80 font-medium">{data?.product_metrics?.habits_completed_today || 0} Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* --- SYSTEM ALERTS --- */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-slate-900 p-8 rounded-xl shadow-lg text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-3 text-white">System Communications</h3>
                            <p className="text-indigo-100 dark:text-indigo-200 text-sm mb-6 leading-relaxed">
                                Deploy global alerts or credit-balance notifications to all student dashboards.
                            </p>
                            <button onClick={() => navigate('/admin/notification/')} className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-6 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                                Send Notification
                            </button>
                        </div>
                        <Bell className="absolute -right-6 -bottom-6 text-white dark:text-slate-700 opacity-10 dark:opacity-20 rotate-12" size={160} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;