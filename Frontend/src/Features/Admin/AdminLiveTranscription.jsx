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
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    <Mic size={32} className="mr-3 text-purple-600" />
                    Live Transcription Management
                </h1>
                <p className="text-gray-500">
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
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                />

                <AdminStatCard
                    title="Total Transcriptions"
                    value={stats.totalTranscriptions}
                    change="All-time count"
                    icon={Activity}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                />

                <AdminStatCard
                    title="Avg / User"
                    value={stats.averagePerUser}
                    change="Average usage"
                    icon={Mic}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">

                {/* SEARCH */}
                <div className="flex justify-between items-center mb-6 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
                        User Live Transcription Usage
                    </h2>

                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* HEADER */}
                <div className="grid grid-cols-5 text-sm font-semibold text-gray-500 border-b py-3 px-4">
                    <div className="col-span-2">Username</div>
                    <div>Total Live Transcriptions</div>
                    <div className="text-right">Credits Used</div>
                </div>

                {/* ROWS */}
                <div className="divide-y">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.user_id}
                                className="grid grid-cols-5 items-center p-4 hover:bg-gray-50"
                            >
                                <div className="col-span-2 font-medium truncate">
                                    {user.username}
                                </div>

                                <div className="font-semibold text-gray-800">
                                    {user.total_count}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    1
                                </div>
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
