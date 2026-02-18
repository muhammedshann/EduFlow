import React, { useEffect, useState } from "react";
import {
    Search,
    MessageSquare,
    Plus,
    GraduationCap,
    Inbox,
    X
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup } from "../../Redux/GroupsSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Standardized cinematic theme constants
const GRADIENT_CLASS =
    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-600 dark:to-indigo-500 shadow-lg shadow-purple-500/20";
const SOFT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
const CARD_BG = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl";
const BORDER_COLOR = "border-slate-200 dark:border-slate-800";

export const CreateGroupModal = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "public",
    });

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("Group name is required.");
            return;
        }
        onSubmit(formData);
        setFormData({ name: "", description: "", type: "public" });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`${CARD_BG} w-full max-w-lg p-8 rounded-[2.5rem] border ${BORDER_COLOR} shadow-2xl`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Create Group</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Group Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition-all"
                            placeholder="e.g. Advanced Calculus"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition-all resize-none"
                            placeholder="What is this community about?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Privacy</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="public">🌍 Public (Everyone can join)</option>
                            <option value="private">🔒 Private (Invite only)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 rounded-2xl font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-8 py-3.5 text-white font-black rounded-2xl ${GRADIENT_CLASS} active:scale-95 transition-all`}
                        >
                            Create Group
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const EmptyState = ({ text }) => (
    <div className={`${CARD_BG} border ${BORDER_COLOR} rounded-[2rem] py-16 flex flex-col items-center justify-center text-center shadow-sm`}>
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight">{text}</p>
    </div>
);

const GroupCard = ({ name, description, type, actionText, isJoined, onAction }) => {
    const showChat = isJoined && actionText === "Open Chat";

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`${CARD_BG} p-8 rounded-[2.5rem] border ${BORDER_COLOR} shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 flex flex-col h-full group`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-100 dark:bg-indigo-500/10 text-purple-600 dark:text-indigo-400 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                    <GraduationCap className="w-6 h-6" />
                </div>
                {type === "private" && (
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                        Private
                    </span>
                )}
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight mb-3 line-clamp-1">{name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">{description}</p>

            <div className="mt-auto">
                {showChat ? (
                    <button
                        onClick={onAction}
                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <MessageSquare size={16} />
                        Open Chat
                    </button>
                ) : (
                    <button
                        onClick={onAction}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white ${GRADIENT_CLASS} active:scale-95 transition-all`}
                    >
                        Join Community
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const GroupsPage = () => {
    const [createdGroups, setCreatedGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [publicGroups, setPublicGroups] = useState([]);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchGroups = async () => {
        try {
            const res = await dispatch(FetchGroup()).unwrap();
            setCreatedGroups(res.created_groups || []);
            setJoinedGroups(res.joined_groups || []);
            setPublicGroups(res.public_groups || []);
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filterFn = g => g.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
        <div className={`min-h-screen ${SOFT_BG} transition-colors duration-300 pb-32`}>
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                
                {/* Cinematic Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                        Communities<span className="text-purple-600">.</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">
                        Collaborate and grow with learners worldwide
                    </p>
                </header>

                {/* iOS Style Search + Action */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16 max-w-4xl mx-auto">
                    <div className="relative flex-grow">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find a group..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-4 pl-14 pr-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setOpenCreateModal(true)}
                        className={`flex items-center justify-center px-8 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl ${GRADIENT_CLASS} active:scale-95 transition-all`}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Group
                    </button>
                </div>

                {/* SECTIONS */}
                <div className="space-y-20">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-purple-600 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Your Creations</h2>
                        </div>
                        {createdGroups.filter(filterFn).length === 0 ? (
                            <EmptyState text="No groups created yet." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {createdGroups.filter(filterFn).map(group => (
                                    <GroupCard key={group.id} {...group} actionText="Open Chat" isJoined={true} onAction={() => navigate(`/groups/chat/${group.id}`)} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Joined Communities</h2>
                        </div>
                        {joinedGroups.filter(filterFn).length === 0 ? (
                            <EmptyState text="You haven't joined any groups." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {joinedGroups.filter(filterFn).map(group => (
                                    <GroupCard key={group.id} {...group} actionText="Open Chat" isJoined={true} onAction={() => navigate(`/groups/chat/${group.id}`)} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Discover More</h2>
                        </div>
                        {publicGroups.filter(filterFn).length === 0 ? (
                            <EmptyState text="No public groups found." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {publicGroups.filter(filterFn).map(group => (
                                    <GroupCard key={group.id} {...group} actionText="Join" onAction={() => navigate(`/groups/chat/${group.id}`)} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            </div>
        </div>
    );
};

export default GroupsPage;