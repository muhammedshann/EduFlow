import React, { useEffect, useState } from 'react';
import {
    FileAudio,
    Users,
    Activity,
    Search,
    FileText
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminStatCard } from './AdminUserPage';
import { FetchUploadTranscription } from '../../Redux/AdminRedux/AdminLiveTranscriptionSlice';

export default function UploadTranscriptionManagement() {
    const dispatch = useDispatch();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalUploads: 0,
        averagePerUser: 0,
    });

    const fetch = async () => {
        try {
            const res = await dispatch(FetchUploadTranscription()).unwrap();
            const data = res.users;

            setUsers(data);
            setFilteredUsers(data);

            const totalUsers = data.length;
            const totalUploads = data.reduce((sum, u) => sum + u.total_count, 0);
            const averagePerUser = totalUsers > 0 ? (totalUploads / totalUsers).toFixed(1) : 0;

            setStats({ totalUsers, totalUploads, averagePerUser });
        } catch (err) {
            console.error("Failed to fetch upload stats:", err);
        }
    };

    useEffect(() => { fetch(); }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredUsers(users.filter(u => u.username.toLowerCase().includes(term)));
    };

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    <FileAudio size={32} className="mr-3 text-blue-600" />
                    Upload Tranascription Management
                </h1>
                <p className="text-gray-500">Total uploaded lecture usage per student</p>
            </header>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <AdminStatCard
                    title="Active Students"
                    value={stats.totalUsers}
                    change="With uploaded files"
                    icon={Users}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <AdminStatCard
                    title="Total Smart Scribes"
                    value={stats.totalUploads}
                    change="All-time total"
                    icon={FileText}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                />
                <AdminStatCard
                    title="Avg / Student"
                    value={stats.averagePerUser}
                    change="Files per user"
                    icon={Activity}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Student Usage Details</h2>
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* TABLE HEADER (Adjusted to 4 columns for cleaner look) */}
                <div className="grid grid-cols-4 text-sm font-semibold text-gray-500 border-b py-3 px-4 uppercase tracking-wider">
                    <div className="col-span-3">Student Username</div>
                    <div className="text-right">Total Files Scribed</div>
                </div>

                {/* ROWS */}
                <div className="divide-y">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.user_id} className="grid grid-cols-4 items-center p-4 hover:bg-gray-50 transition-colors">
                                <div className="col-span-3 font-medium text-gray-700">{user.username}</div>
                                <div className="text-right font-bold text-gray-900 flex items-center justify-end gap-2">
                                    <FileText size={16} className="text-blue-400" />
                                    {user.total_count}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-12 italic">No student records found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}