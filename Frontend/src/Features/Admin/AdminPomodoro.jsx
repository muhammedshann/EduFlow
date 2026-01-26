import React, { useEffect, useState } from 'react';
import {
    Clock,
    Users,
    Target,
    Search
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminPomodoro } from '../../Redux/AdminRedux/AdminPomodoroSlice';
import { AdminStatCard } from './AdminUserPage';

export default function PomodoroManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [userPomodoroData, setUserPomodoroData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSessions: 0,
        averageFocus: 0,
        totalHours: 0,
    });

    const dispatch = useDispatch();

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = userPomodoroData.filter(user =>
            user.username.toLowerCase().includes(term)
        );

        setFilteredUsers(filtered);
    };

    const fetch = async () => {
        const response = await dispatch(AdminPomodoro()).unwrap();
        const users = response.users;

        setUserPomodoroData(users);
        setFilteredUsers(users);

        const totalUsers = users.length;
        const totalSessions = users.reduce(
            (sum, u) => sum + (u.sessions_completed || 0),
            0
        );

        const totalFocusMinutes = users.reduce(
            (sum, u) => sum + (u.focus_minutes || 0),
            0
        );

        const averageFocus = totalUsers > 0
            ? (totalFocusMinutes).toFixed(1)
            : 0;

        const totalBreakMinutes = users.reduce(
            (sum, u) => sum + (u.break_minutes || 0),
            0
        );

        const totalMinutes = totalFocusMinutes + totalBreakMinutes;
        const totalHours = (totalMinutes / 60).toFixed(1);

        setStats({
            totalUsers,
            totalSessions,
            averageFocus,
            totalHours,
        });
    };

    useEffect(() => {
        fetch();
    }, []);

    return (
        <div className="p-4 sm:p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 flex items-center">
                    <Clock size={32} className="mr-3 text-purple-600 dark:text-purple-400" />
                    Pomodoro Management
                </h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">
                    Monitor platform-wide Pomodoro usage and user activity.
                </p>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">

                <AdminStatCard
                    title="Total Active Users"
                    value={stats.totalUsers}
                    change="Pomodoro activity"
                    icon={Users}
                    iconBg="bg-purple-100 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />

                <AdminStatCard
                    title="Total Focus Sessions"
                    value={stats.totalSessions}
                    change="Completed sessions"
                    icon={Clock}
                    iconBg="bg-purple-100 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />

                <AdminStatCard
                    title="Total Focus Time"
                    value={`${stats.averageFocus} min`}
                    change="Across all users"
                    icon={Target}
                    iconBg="bg-green-100 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-green-500 dark:text-green-400"
                />
            </div>

            {/* USER TABLE */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors duration-300">

                {/* Search & Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        User Pomodoro Activity
                    </h2>

                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search users by name..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-purple-500 dark:focus:border-purple-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* TABLE HEADER (Hidden on Mobile) */}
                <div className="hidden sm:grid grid-cols-5 text-sm font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 py-3 px-4">
                    <div className="col-span-2">Username</div>
                    <div>Total Sessions</div>
                    <div>Focus Time</div>
                    <div>Break Time</div>
                </div>

                {/* TABLE ROWS */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.user_id}
                                className="flex flex-col sm:grid sm:grid-cols-5 items-start sm:items-center p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors gap-3 sm:gap-0"
                            >
                                {/* Username Column */}
                                <div className="flex items-center col-span-2 min-w-0 w-full">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4 flex-shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-base font-semibold text-gray-800 dark:text-white truncate">
                                        {user.username}
                                    </p>
                                </div>

                                {/* Mobile Labels & Data */}
                                <div className="w-full flex justify-between sm:block sm:w-auto">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Sessions</span>
                                    <p className="text-sm text-gray-600 dark:text-slate-300">{user.sessions_completed}</p>
                                </div>

                                <div className="w-full flex justify-between sm:block sm:w-auto">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Focus</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                                        {user.focus_minutes} min
                                    </p>
                                </div>

                                <div className="w-full flex justify-between sm:block sm:w-auto">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Break</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                                        {user.break_minutes} min
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-500 py-8">
                            No users found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}