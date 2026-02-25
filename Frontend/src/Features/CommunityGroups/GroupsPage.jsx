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
const PRIMARY_GRADIENT = "bg-gradient-to-tr from-indigo-600 to-purple-600 hover:shadow-indigo-500/20";
const SOFT_BG = "bg-[#f8fafc] dark:bg-[#020617]";

// --- List Tile Component ---
const GroupListTile = ({ name, description, type, onAction, isJoined, isActive }) => (
    <div 
        onClick={onAction}
        className={`flex items-center px-4 py-4 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-slate-800/50
            ${isActive ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50 dark:hover:bg-slate-900/40'}
        `}
    >
        <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm
                ${isJoined ? 'bg-white dark:bg-slate-800 text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}
            `}>
                <Users size={24} />
            </div>
            {type === "private" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white dark:border-slate-950 rounded-full" />
            )}
        </div>

        <div className="ml-4 flex-grow overflow-hidden">
            <div className="flex justify-between items-baseline">
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-slate-100 truncate">{name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 uppercase tracking-tighter">
                    {type}
                </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 truncate mt-1 leading-relaxed">
                {description || "Join this community to start learning together."}
            </p>
        </div>

        <div className="ml-2 opacity-40 group-hover:opacity-100">
            <ChevronRight size={18} />
        </div>
    </div>
);

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
            
            {/* Sidebar / List Section (Responsive width) */}
            <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-900 shadow-xl z-20">
                
                {/* Header Section */}
                <div className="p-5 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight dark:text-white">Communities</h1>
                            <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-widest mt-1">EduFlow Network</p>
                        </div>
                        <button 
                            onClick={() => setOpenCreateModal(true)}
                            className={`p-3 text-white rounded-2xl shadow-lg transition-all active:scale-90 ${PRIMARY_GRADIENT}`}
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a group..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-12 pr-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent focus:border-indigo-500/50 rounded-2xl text-sm dark:text-white transition-all outline-none"
                        />
                    </div>

                    {/* Horizontal Tabs */}
                    <div className="flex gap-2 py-5 overflow-x-auto no-scrollbar scroll-smooth">
                        {["All", "Joined", "Created", "Discover"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab 
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
                                    : "bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800"}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {getDisplayData().length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-30">
                            <LayoutGrid size={48} strokeWidth={1} />
                            <p className="mt-4 text-sm font-semibold">No communities found in this category.</p>
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

            {/* Desktop Preview / Placeholder (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-grow items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
                
                <div className="max-w-md text-center z-10">
                    <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-slate-800">
                        <MessageSquare size={40} className="text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Start Collaborating</h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Select a group from the list to view the conversation and share resources with your fellow students.
                    </p>
                </div>
            </div>

            {/* Modal remains same logic, updated styling */}
            <CreateGroupModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSubmit={handleCreateGroup}
            />
        </div>
    );
};

export default GroupsPage;