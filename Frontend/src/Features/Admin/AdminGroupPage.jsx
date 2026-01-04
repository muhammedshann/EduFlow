import React, { useEffect, useState } from 'react';
import {
    Users,
    MessageSquare,
    Flag,
    Shield,
    Plus,
    Search,
    Eye,
    Trash2,
    MoreVertical
} from 'lucide-react';

import { useDispatch } from 'react-redux';
import { AdminGroup, AdminHanldeGroupDelete } from '../../Redux/AdminRedux/AdminGroupSlice';
import { CreateGroupModal } from '../CommunityGroups/GroupsPage';
import { CreateGroup } from '../../Redux/GroupsSlice';
import { AdminStatCard } from './AdminUserPage';

const GroupRow = ({ group }) => {
    const dispatch = useDispatch();
    const handleDeleteGroup = async (id) => {
        await dispatch(AdminHanldeGroupDelete({ id }))
        window.location.reload();
    }
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">

            <div className="flex items-center flex-1 min-w-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
                    <Users size={20} />
                </div>

                <div className="flex flex-col min-w-0">
                    <p className="text-base font-semibold text-gray-800 truncate">{group.name}</p>

                    <p className="text-sm text-gray-500 truncate">
                        {group.total_members} members • {group.total_messages} messages • Created {group.created_at.slice(0, 10)}
                    </p>

                    <p className="text-xs text-gray-400">
                        Admin: {group.admin_name ?? "None"}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-6 flex-shrink-0">
                <div className="w-20 text-right">
                    <span className="text-xs font-semibold py-1 px-3 rounded-full bg-green-100 text-green-700">
                        {group.status}
                    </span>
                </div>

                <div className="flex items-center space-x-2 w-20 justify-end">
                    <Trash2 size={18} onClick={() => handleDeleteGroup(group.id)} className="text-gray-400 hover:text-red-600 cursor-pointer" />
                    <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                </div>
            </div>
        </div>
    );
};

export default function GroupsManagement() {

    const [searchTerm, setSearchTerm] = useState('');
    const [groupsData, setGroupsData] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [stats, setStats] = useState({
        totalGroups: 0,
        activeGroups: 0,
        flagged: 0,
        pending: 0,
    });

    const dispatch = useDispatch();

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        setFilteredGroups(
            groupsData.filter(g => g.name.toLowerCase().includes(term))
        );
    };

    const fetchData = async () => {
        const response = await dispatch(AdminGroup()).unwrap();

        const groups = response.groups;
        setGroupsData(groups);
        setFilteredGroups(groups);

        const totalGroups = groups.length;
        const activeGroups = groups.filter(g => g.status === "active").length;
        const flagged = groups.filter(g => g.status === "flagged").length;
        const pending = groups.filter(g => g.status === "pending").length;

        setStats({
            totalGroups,
            activeGroups,
            flagged,
            pending,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateGroup = async (data) => {
        try {
            await dispatch(CreateGroup(data)).unwrap();

            await fetchData(); // refresh list
            setOpenCreateModal(false);
        } catch (err) {
            console.error("Create group failed:", err);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Groups Management</h1>
                    <p className="text-gray-500">Monitor study groups and manage flagged content</p>
                </div>

                <button className="flex items-center px-5 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                    onClick={() => setOpenCreateModal(true)}
                >
                    <Plus size={20} className="mr-2" />
                    Create Community
                </button>
            </header>
            <CreateGroupModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSubmit={handleCreateGroup}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <AdminStatCard
                    title="Total Groups"
                    value={stats.totalGroups}
                    change="+0 today"
                    icon={Users}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                />

                <AdminStatCard
                    title="Active Groups"
                    value={stats.activeGroups}
                    change="+0 today"
                    icon={MessageSquare}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                />

                <AdminStatCard
                    title="Flagged Content"
                    value={stats.flagged}
                    change="+0 today"
                    icon={Flag}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                    valueColor="text-gray-800"
                    changeColor="text-red-600"
                />

                <AdminStatCard
                    title="Pending Approval"
                    value={stats.pending}
                    change="+0 today"
                    icon={Shield}
                    iconBg="bg-yellow-50"
                    iconColor="text-yellow-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">All Groups</h2>

                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map(group => (
                            <GroupRow key={group.id} group={group} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No groups found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
