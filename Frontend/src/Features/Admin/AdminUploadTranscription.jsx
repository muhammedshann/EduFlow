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
        <div className="p-4 sm:p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            
            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 flex items-center">
                    <FileAudio size={28} className="mr-3 text-blue-600 dark:text-blue-400" />
                    Upload Transcription Management
                </h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">
                    Total uploaded lecture usage per student
                </p>
            </header>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
                <AdminStatCard
                    title="Active Students"
                    value={stats.totalUsers}
                    change="With uploaded files"
                    icon={Users}
                    iconBg="bg-blue-100 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />
                <AdminStatCard
                    title="Total Smart Scribes"
                    value={stats.totalUploads}
                    change="All-time total"
                    icon={FileText}
                    iconBg="bg-green-100 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />
                <AdminStatCard
                    title="Avg / Student"
                    value={stats.averagePerUser}
                    change="Files per user"
                    icon={Activity}
                    iconBg="bg-blue-100 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                
                {/* SEARCH & HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Student Usage Details</h2>
                    
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* TABLE HEADER (Hidden on Mobile) */}
                <div className="hidden sm:grid grid-cols-4 text-sm font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 py-3 px-4 uppercase tracking-wider">
                    <div className="col-span-3">Student Username</div>
                    <div className="text-right">Total Files Scribed</div>
                </div>

                {/* ROWS */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div 
                                key={user.user_id} 
                                className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors gap-2 sm:gap-0"
                            >
                                {/* Username */}
                                <div className="col-span-3 font-medium text-gray-700 dark:text-slate-200 w-full sm:w-auto">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase block mb-1">Student</span>
                                    {user.username}
                                </div>

                                {/* Count */}
                                <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center sm:text-right font-bold text-gray-900 dark:text-white">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Total Files</span>
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-blue-400" />
                                        {user.total_count}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-500 py-12 italic">
                            No student records found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}