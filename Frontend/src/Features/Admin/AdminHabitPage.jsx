import React, { useState, useEffect } from "react";
import {
    Users,
    Activity,
    Flag,
    Search,
    Eye,
    Trash2,
    BarChart3,
    MoreVertical,
    CheckCircle
} from "lucide-react";

import { useDispatch } from "react-redux";
import { AdminFetchHabit } from "../../Redux/AdminRedux/AdminHabitSlice";
import { AdminStatCard } from "./AdminUserPage";

const UserRow = ({ user }) => {
    // Status Logic (if needed later)
    // const statusClass = {
    //     "High Activity": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    //     "Normal Activity": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    //     Inactive: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300",
    // }[user.status] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300";

    return (
        <div className="grid grid-cols-6 items-center p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center col-span-2 min-w-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4 shrink-0">
                    <Users size={20} />
                </div>
                <p className="text-base font-semibold text-gray-800 dark:text-white truncate">{user.username}</p>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-300">{user.total_habits}</p>
            <p className="text-sm text-gray-600 dark:text-slate-300">{user.total_logs}</p>
            <p className="text-sm text-gray-600 dark:text-slate-300">{user.completed_logs}</p>
            <p className="text-sm text-gray-600 dark:text-slate-300">{user.completion_rate}</p>
        </div>
    );
};

export default function HabitManagement() {
    const dispatch = useDispatch();

    const [stats, setStats] = useState(null); // Initialize as null to handle loading state correctly
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const result = await dispatch(AdminFetchHabit());
            if (result?.payload) {
                setStats(result.payload);
                setUsers(result.payload.users);
            }
        };

        fetchData();
    }, [dispatch]);

    const filteredUsers = users.filter((u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!stats)
        return (
            <div className="p-10 text-center text-gray-600 dark:text-slate-400 text-xl min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                Loading data...
            </div>
        );

    return (
        <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                    User Activity Management
                </h1>
                <p className="text-gray-500 dark:text-slate-400">
                    Monitor all user habit activity and logs.
                </p>
            </header>

            {/* ADMIN STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <AdminStatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    valueColor="text-gray-900 dark:text-white"
                    change=""
                    changeColor=""
                />

                <AdminStatCard
                    title="Total Habits"
                    value={stats.total_habits}
                    icon={Activity}
                    iconBg="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    valueColor="text-gray-900 dark:text-white"
                    change=""
                    changeColor=""
                />

                <AdminStatCard
                    title="Total Logs Recorded"
                    value={stats.total_logs}
                    icon={BarChart3}
                    iconBg="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-orange-600 dark:text-orange-400"
                    valueColor="text-gray-900 dark:text-white"
                    change=""
                    changeColor=""
                />

                <AdminStatCard
                    title="Avg Completion Rate"
                    value={`${stats.avg_completion_rate}%`}
                    icon={CheckCircle}
                    iconBg="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                    valueColor="text-gray-900 dark:text-white"
                    change=""
                    changeColor=""
                />
            </div>

            {/* USERS TABLE */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                {/* Search bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">All Tracker Users</h2>

                    <div className="relative w-64">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-purple-500 dark:focus:border-purple-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-6 text-sm font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 py-3 px-4">
                    <div className="col-span-2">User</div>
                    <div>Habits</div>
                    <div>Logs</div>
                    <div>Completed Logs</div>
                    <div>Completion Rate</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
                    ) : (
                        <p className="text-center py-8 text-gray-500 dark:text-slate-500">No users found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}