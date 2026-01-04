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
    const statusClass = {
        "High Activity": "bg-purple-100 text-purple-700",
        "Normal Activity": "bg-green-100 text-green-700",
        Inactive: "bg-gray-100 text-gray-700",
    }[user.status] || "bg-gray-100 text-gray-700";

    return (
        <div className="grid grid-cols-6 items-center p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex items-center col-span-2 min-w-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <Users size={20} />
                </div>
                <p className="text-base font-semibold text-gray-800 truncate">{user.username}</p>
            </div>

            <p className="text-sm text-gray-600">{user.total_habits}</p>
            <p className="text-sm text-gray-600">{user.total_logs}</p>
            <p className="text-sm text-gray-600">{user.completed_logs}</p>
            <p className="text-sm text-gray-600">{user.completion_rate}</p>

            {/* <div className="flex items-center justify-between col-span-2 space-x-3">
                <span className={`text-xs font-semibold py-1 px-3 rounded-full ${statusClass}`}>
                    {user.status}
                </span>

                <p className="text-sm text-gray-500 text-right min-w-[100px]">
                    {user.last_active}
                </p>

                <div className="flex items-center space-x-2">
                    <Flag size={18} className={user.flagged > 0 ? "text-red-500" : "text-gray-300"} />
                    <Eye size={18} className="text-gray-400 hover:text-purple-600 cursor-pointer" />
                    <Trash2 size={18} className="text-gray-400 hover:text-red-600 cursor-pointer" />
                    <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                </div>
            </div> */}
        </div>
    );
};


export default function HabitManagement() {
    const dispatch = useDispatch();

    const [stats, setStats] = useState([]);
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
            <div className="p-10 text-center text-gray-600 text-xl">
                Loading data...
            </div>
        );

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    User Activity Management
                </h1>
                <p className="text-gray-500">
                    Monitor all user habit activity and logs.
                </p>
            </header>

            {/* ADMIN STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <AdminStatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    valueColor="text-gray-900"
                    change=""
                    changeColor=""
                />

                <AdminStatCard
                    title="Total Habits"
                    value={stats.total_habits}
                    icon={Activity}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                    valueColor="text-gray-900"
                    change=""
                    changeColor=""
                />

                <AdminStatCard
                    title="Total Logs Recorded"
                    value={stats.total_logs}
                    icon={BarChart3}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                    valueColor="text-gray-900"
                    change=""
                    changeColor=""
                />

                <AdminStatCard
                    title="Avg Completion Rate"
                    value={`${stats.avg_completion_rate}%`}
                    icon={CheckCircle}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    valueColor="text-gray-900"
                    change=""
                    changeColor=""
                />
            </div>

            {/* USERS TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                {/* Search bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">All Tracker Users</h2>

                    <div className="relative w-64">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-6 text-sm font-semibold text-gray-500 border-b py-3 px-4">
                    <div className="col-span-2">User</div>
                    <div>Habits</div>
                    <div>Logs</div>
                    <div>completed logs</div>
                    <div>completion rate</div>
                    {/* <div className="col-span-2 flex justify-between">
                        <span>Status</span>
                        <span>Last Active</span>
                        <span>Actions</span>
                    </div> */}
                </div>

                {/* Table Rows */}
                <div>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
                    ) : (
                        <p className="text-center py-8 text-gray-500">No users found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
