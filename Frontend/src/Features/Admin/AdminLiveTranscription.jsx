import React, { useEffect, useState } from 'react';
import {
    Mic,
    Users,
    Activity,
    Search,
    Eye,
    MoreVertical
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminStatCard } from './AdminUserPage';
import { FetchLiveTranscription } from '../../Redux/AdminRedux/AdminLiveTranscriptionSlice';

export default function LiveTranscriptionManagement() {
    const dispatch = useDispatch();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTranscriptions: 0,
        averagePerUser: 0,
    });

    /* ---------------- FETCH ---------------- */
    const fetch = async () => {
        const res = await dispatch(FetchLiveTranscription()).unwrap();
        const data = res.users;

        setUsers(data);
        setFilteredUsers(data);

        const totalUsers = data.length;
        const totalTranscriptions = data.reduce(
            (sum, u) => sum + u.total_count,
            0
        );

        const averagePerUser =
            totalUsers > 0
                ? (totalTranscriptions / totalUsers).toFixed(1)
                : 0;

        setStats({
            totalUsers,
            totalTranscriptions,
            averagePerUser,
        });
    };

    useEffect(() => {
        fetch();
    }, []);

    /* ---------------- SEARCH ---------------- */
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        setFilteredUsers(
            users.filter(u =>
                u.username.toLowerCase().includes(term)
            )
        );
    };

    return (
        <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1 flex items-center">
                    <Mic size={32} className="mr-3 text-purple-600 dark:text-purple-400" />
                    Live Transcription Management
                </h1>
                <p className="text-gray-500 dark:text-slate-400">
                    Total live transcription usage per user
                </p>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

                <AdminStatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change="Used live transcription"
                    icon={Users}
                    iconBg="bg-purple-100 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                />

                <AdminStatCard
                    title="Total Transcriptions"
                    value={stats.totalTranscriptions}
                    change="All-time count"
                    icon={Activity}
                    iconBg="bg-green-100 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                />

                <AdminStatCard
                    title="Avg / User"
                    value={stats.averagePerUser}
                    change="Average usage"
                    icon={Mic}
                    iconBg="bg-purple-100 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors duration-300">

                {/* SEARCH */}
                <div className="flex justify-between items-center mb-6 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
                        User Live Transcription Usage
                    </h2>

                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-purple-500 dark:focus:border-purple-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* HEADER */}
                <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 py-3 px-4">
                    <div className="col-span-2">Username</div>
                    <div>Total Live Transcriptions</div>
                </div>

                {/* ROWS */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.user_id}
                                className="grid grid-cols-3 items-center p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="col-span-2 font-medium truncate text-gray-700 dark:text-slate-200">
                                    {user.username}
                                </div>

                                <div className="font-semibold text-gray-800 dark:text-white">
                                    {user.total_count}
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