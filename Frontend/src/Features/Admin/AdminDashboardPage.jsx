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
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800">Connection Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Retry</button>
                </div>
            </div>
        );
    }

    // UPDATED STATS GRID
    const stats = [
        { 
            name: 'Total Users', 
            value: data?.stats?.total_users?.toLocaleString() || '0', 
            icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' 
        },
        { 
            name: 'Total Revenue', 
            value: `₹${parseFloat(data?.stats?.total_revenue || 0).toLocaleString()}`, 
            icon: Wallet, color: 'text-green-600', bg: 'bg-green-100' 
        },
        { 
            name: 'Total Credits Bought', 
            value: data?.stats?.credits_bought?.toLocaleString() || '0', 
            icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' 
        },
        { 
            name: 'Credits Used', 
            value: data?.stats?.credits_used?.toLocaleString() || '0', 
            icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100' 
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
                        <p className="text-gray-500 text-sm">Platform health and credit economy.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">{stat.name}</p>
                                <h3 className="text-2xl font-extrabold text-gray-800">{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                            <button onClick={() => navigate('/admin/subscriptions')} className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Bundle</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {data?.recent_purchases?.map((purchase, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{purchase.user_email}</td>
                                            <td className="px-6 py-4 text-gray-600">{purchase.bundle_name || "Custom"}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">₹{purchase.total_amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    purchase.status === 'success' ? 'bg-green-100 text-green-700' :
                                                    purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
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

                    {/* UPDATED SYSTEM STATS SECTION */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">System Usage</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <FileCheck size={18} className="text-indigo-500" /> Files Processed
                                    </span>
                                    <span className="text-xl font-bold text-indigo-600">{data?.usage_metrics?.total_files_processed || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <Users size={18} className="text-emerald-500" /> New Users Today
                                    </span>
                                    <span className="text-xl font-bold text-emerald-600">{data?.stats?.new_users_today || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ChatBot Engagement (7d)</p>
                                <span className="text-xs font-bold text-indigo-600">
                                    {data?.usage_metrics?.chatbot_7d_requests || 0} Req
                                </span>
                            </div>
                            <div className="flex items-end gap-1.5 h-16">
                                {[20, 40, 30, 70, 50, 90, 60].map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-50 rounded-t hover:bg-indigo-500 transition-all cursor-help" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BarChart3 className="text-indigo-500" size={20} /> Productivity Metrics (Today)
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="text-orange-500" size={18} />
                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Pomodoro</span>
                                </div>
                                <h4 className="text-2xl font-black text-orange-700">
                                    {data?.product_metrics?.pomodoros_today || 0}
                                </h4>
                                <p className="text-xs text-orange-600 font-medium">Daily Target Reached</p>
                            </div>

                            {/* UPDATED HABIT SUCCESS RATE SECTION */}
                            <div className="flex flex-col p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="text-emerald-500" size={18} />
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Habit Success</span>
                                </div>
                                <h4 className="text-2xl font-black text-emerald-700">
                                    {data?.product_metrics?.habit_success_rate || 0}%
                                </h4>
                                <p className="text-xs text-emerald-600 font-medium">{data?.product_metrics?.habits_completed_today || 0} Completed</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-xl shadow-lg text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-3">System Communications</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                Deploy global alerts or credit-balance notifications to all student dashboards.
                            </p>
                            <button onClick={() => navigate('/admin/notification/')} className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95">
                                Send Notification
                            </button>
                        </div>
                        <Bell className="absolute -right-6 -bottom-6 text-white opacity-10 rotate-12" size={160} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;