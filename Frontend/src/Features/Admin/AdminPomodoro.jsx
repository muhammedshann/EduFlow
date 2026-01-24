import React, { useEffect, useState } from 'react';
import {
    Clock,
    Users,
    Activity,
    Target,
    Search,
    Eye,
    MoreVertical
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
            ? (totalFocusMinutes ).toFixed(1)
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
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    <Clock size={32} className="mr-3 text-purple-600" />
                    Pomodoro Management
                </h1>
                <p className="text-gray-500">
                    Monitor platform-wide Pomodoro usage and user activity.
                </p>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

                {/* Total Active Users */}
                <AdminStatCard
                    title="Total Active Users"
                    value={stats.totalUsers}
                    change="Pomodoro activity"
                    icon={Users}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                />

                <AdminStatCard
                    title="Total Focus Sessions"
                    value={stats.totalSessions}
                    change="Completed sessions"
                    icon={Clock}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                />

                <AdminStatCard
                    title="Total Focus Time"
                    value={`${stats.averageFocus} min`}
                    change="Across all users"
                    icon={Target}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    valueColor="text-gray-800"
                    changeColor="text-green-500"
                />

                {/* <AdminStatCard
                    title="Total Engagement Hours"
                    value={`${stats.totalHours} hrs`}
                    change="Focus + Break time"
                    icon={Activity}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                /> */}

            </div>

            {/* USER TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">

                {/* Search & Header */}
                <div className="flex justify-between items-center mb-6 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
                        User Pomodoro Activity
                    </h2>

                    <div className="flex space-x-3 w-full sm:w-auto">
                        <div className="relative flex-grow">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search users by name..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-5 text-sm font-semibold text-gray-500 border-b border-gray-200 py-3 px-4">
                    <div className="col-span-2">Username</div>
                    <div>Total Sessions</div>
                    <div>Focus Time</div>
                    <div>Break Time</div>
                    {/* <div className="text-right">Actions</div> */}
                </div>

                {/* TABLE ROWS */}
                <div className="divide-y divide-gray-100">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.user_id}
                                className="grid grid-cols-5 items-center p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center col-span-2 min-w-0">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4 flex-shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-base font-semibold text-gray-800 truncate">
                                        {user.username}
                                    </p>
                                </div>

                                <p className="text-sm text-gray-600">{user.sessions_completed}</p>

                                <p className="text-sm font-medium text-gray-800">
                                    {user.focus_minutes} min
                                </p>

                                <p className="text-sm font-medium text-gray-800">
                                    {user.break_minutes} min
                                </p>

                                {/* <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                                    <Eye size={18} className="text-gray-400 hover:text-purple-600 cursor-pointer" />
                                    <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                                </div> */}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">
                            No users found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
