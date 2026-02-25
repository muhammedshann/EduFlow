import React, { useEffect, useState } from "react";
import {
    Search,
    Users,
    Plus,
    Inbox,
    X,
    ChevronRight,
    LayoutGrid,
    MessageSquare
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup } from "../../Redux/GroupsSlice";
import { useNavigate } from "react-router-dom";

// Theme constants
const PRIMARY_GRADIENT = "bg-gradient-to-tr from-indigo-600 to-purple-600";
const SOFT_BG = "bg-[#f8fafc] dark:bg-[#020617]";

// --- WhatsApp-inspired List Tile (Responsive) ---
const GroupListTile = ({ name, description, type, onAction, isJoined }) => (
    <div 
        onClick={onAction}
        className="flex items-center px-4 py-4 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-900/40"
    >
        <div className="relative flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Users size={26} />
            </div>
            {type === "private" && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-white dark:border-slate-950 rounded-full" />
            )}
        </div>

        <div className="ml-4 flex-grow overflow-hidden">
            <div className="flex justify-between items-baseline">
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-slate-100 truncate">{name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 uppercase tracking-tighter">
                    {type}
                </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 truncate mt-1">
                {description || "Join this community to start learning together."}
            </p>
        </div>

        <div className="ml-2 text-gray-300 dark:text-slate-700">
            {isJoined ? <ChevronRight size={18} /> : <Plus size={18} className="text-indigo-500" />}
        </div>
    </div>
);

// --- Create Group Modal (Updated Styling) ---
export const CreateGroupModal = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: "", description: "", type: "public" });
    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSubmit(formData);
        setFormData({ name: "", description: "", type: "public" });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black dark:text-white">Create Community</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text" placeholder="Group Name"
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setFormData({...formData, name: e.target.value})} required
                    />
                    <textarea
                        placeholder="What is this group about?" rows={3}
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                    <select
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none"
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="public">Public Group</option>
                        <option value="private">Private Group</option>
                    </select>
                    <button type="submit" className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg ${PRIMARY_GRADIENT}`}>
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
    const [activeTab, setActiveTab] = useState("All");

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
        <div className={`flex h-screen overflow-hidden ${SOFT_BG}`}>
            
            {/* --- SIDEBAR LIST (Full width on mobile, Fixed width on laptop) --- */}
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-900 shadow-xl z-20">
                
                {/* Header Section */}
                <div className="px-5 pt-8 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-black tracking-tight dark:text-white">Communities</h1>
                        <button 
                            onClick={() => setOpenCreateModal(true)}
                            className={`p-3 text-white rounded-2xl shadow-lg active:scale-90 transition-transform ${PRIMARY_GRADIENT}`}
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find a group..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-12 pr-4 bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Filter Tabs (Horizontal Scroll on Mobile) */}
                    <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
                        {["All", "Joined", "Created", "Discover"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab 
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
                                    : "bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:bg-gray-200"}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {getDisplayData().length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-30">
                            <LayoutGrid size={48} strokeWidth={1} />
                            <p className="mt-4 text-sm font-semibold">No groups found here.</p>
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
            </div>

            {/* --- DESKTOP PREVIEW (Hidden on Mobile) --- */}
            <div className="hidden lg:flex flex-grow items-center justify-center p-12 relative">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-100 dark:border-slate-800">
                        <MessageSquare size={32} className="text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Your Learning Hub</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        Select a group from the list to start collaborating, sharing notes, and discussing topics with your peers.
                    </p>
                </div>
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