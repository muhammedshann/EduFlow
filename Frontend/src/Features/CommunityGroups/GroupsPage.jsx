import React, { useEffect, useState } from "react";
import {
    Search,
    Users,
    MessageSquare,
    Plus,
    GraduationCap,
    Inbox,
    X,
    ChevronRight
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, JoinGroup } from "../../Redux/GroupsSlice";
import { useNavigate } from "react-router-dom";

// Theme constants
const GRADIENT_CLASS = "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700";
const SOFT_BG = "bg-white dark:bg-slate-950";

// --- NEW COMPONENT: WhatsApp-style List Tile ---
const GroupListTile = ({ name, description, type, onAction, isJoined }) => (
    <div 
        onClick={onAction}
        className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer border-b border-gray-100 dark:border-slate-900 transition-colors"
    >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-indigo-900/30 flex items-center justify-center text-purple-600 dark:text-indigo-400">
                <Users size={28} />
            </div>
            {type === "private" && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full" />
            )}
        </div>

        {/* Content */}
        <div className="ml-4 flex-grow overflow-hidden">
            <div className="flex justify-between items-baseline">
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 truncate">{name}</h3>
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{type}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-0.5">
                {description || "No description available"}
            </p>
        </div>

        {/* Action Icon */}
        <div className="ml-2 flex-shrink-0 text-gray-300 dark:text-slate-700">
            {isJoined ? <ChevronRight size={20} /> : <Plus size={20} className="text-purple-500" />}
        </div>
    </div>
);

// --- MODAL (Kept your logic) ---
export const CreateGroupModal = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: "", description: "", type: "public" });
    if (!open) return null;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSubmit(formData);
        setFormData({ name: "", description: "", type: "public" });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">New Group</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text" name="name" placeholder="Group Name"
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500"
                        onChange={handleChange} required
                    />
                    <textarea
                        name="description" placeholder="Description (Optional)" rows={3}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500"
                        onChange={handleChange}
                    />
                    <select
                        name="type" className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl dark:text-white"
                        onChange={handleChange}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <button type="submit" className={`w-full py-3 text-white font-bold rounded-xl ${GRADIENT_CLASS}`}>
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    );
};

const GroupsPage = () => {
    const [createdGroups, setCreatedGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [publicGroups, setPublicGroups] = useState([]);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All"); // Tabs: All, Joined, Created, Discover

    const dispatch = useDispatch();
    const fetchGroups = async () => {
        try {
            const res = await dispatch(FetchGroup()).unwrap();
            setCreatedGroups(res.created_groups || []);
            setJoinedGroups(res.joined_groups || []);
            setPublicGroups(res.public_groups || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchGroups(); }, []);

    // Filter Logic
    const filterFn = (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const getDisplayData = () => {
        switch(activeTab) {
            case "Joined": return joinedGroups.filter(filterFn);
            case "Created": return createdGroups.filter(filterFn);
            case "Discover": return publicGroups.filter(filterFn);
            default: return [...joinedGroups, ...createdGroups].filter(filterFn);
        }
    };

    const handleCreateGroup = async (data) => {
        try {
            await dispatch(CreateGroup(data)).unwrap();
            await fetchGroups();
            setOpenCreateModal(false);
        } catch (err) { console.error(err); }
    };

    return (
        <div className={`min-h-screen ${SOFT_BG} pb-20`}>
            {/* STICKY HEADER AREA */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-900">
                <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Groups</h1>
                        <button 
                            onClick={() => setOpenCreateModal(true)}
                            className="p-2.5 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
                        >
                            <Plus size={22} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-5">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2.5 pl-11 pr-4 bg-gray-100 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
                        />
                    </div>

                    {/* WhatsApp style Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {["All", "Joined", "Created", "Discover"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab 
                                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                                    : "bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:bg-gray-200"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LIST AREA */}
            <div className="max-w-2xl mx-auto">
                {getDisplayData().length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Inbox size={48} strokeWidth={1} />
                        <p className="mt-4 text-sm font-medium">No groups found here</p>
                    </div>
                ) : (
                    getDisplayData().map((group) => (
                        <GroupListTile
                            key={group.id}
                            {...group}
                            isJoined={activeTab !== "Discover"}
                            onAction={() => window.open(`/groups/chat/${group.id}/`, "_blank")}
                        />
                    ))
                )}
            </div>

            <CreateGroupModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSubmit={handleCreateGroup}
            />
        </div>
    );
};

export default GroupsPage;