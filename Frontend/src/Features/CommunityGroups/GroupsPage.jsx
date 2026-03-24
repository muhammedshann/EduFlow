import React, { useEffect, useState, useRef } from "react";
import {
    Search, Users, Plus, X, LayoutGrid,
    MessageSquare, Send, ArrowLeft, LogOut,
    Globe, Lock, Link as LinkIcon, Image as ImageIcon, Loader2,
    Hash, Info, CheckCircle2, UserPlus, Sparkles
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- THEME CONSTANTS ---
const PRIMARY_GRADIENT = "bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600";
const SOFT_BG = "bg-[#f8fafc] dark:bg-slate-950";

// --- UTILS ---
const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// --- IMPROVED COMPONENTS ---

// 1. Sleeker Floating Message Bubble
const MessageBubble = ({ message, onImageClick }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex w-full mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-end gap-2.5 max-w-[85%] md:max-w-[65%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Compact Avatar */}
                <div className="hidden sm:flex w-7 h-7 rounded-full flex-shrink-0 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-sm items-center justify-center">
                    {message.profile_pic ? (
                        <img src={message.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                            {message.sender?.charAt(0)}
                        </span>
                    )}
                </div>

                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1.5 mb-1">
                            {message.sender}
                        </span>
                    )}

                    <div className={`relative px-4 py-2.5 shadow-sm transition-all ${isCurrentUser
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                            : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700/50'
                        }`}>
                        {message.image && (
                            <div className="mb-2 rounded-lg overflow-hidden cursor-zoom-in ring-1 ring-black/5" onClick={() => onImageClick(message.image)}>
                                <img src={message.image} alt="attachment" className="max-h-60 w-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        {message.content && (
                            <div className={`text-[13px] leading-relaxed prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert text-indigo-50' : 'dark:prose-invert'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                        <div className={`text-[9px] mt-1.5 font-medium flex justify-end opacity-70 ${isCurrentUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Premium Group Info Modal
const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    if (!open || !group) return null;
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${group.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>

                {/* Hero Header with Animated Gradient */}
                <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 blur-2xl rounded-full"></div>
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-black/10 blur-2xl rounded-full"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all hover:scale-110 active:scale-95">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-8 pb-8 -mt-12 text-center relative z-10">
                    {/* Floating Avatar */}
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[1.5rem] mx-auto shadow-2xl flex items-center justify-center mb-4 border-[4px] border-white dark:border-slate-900 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-[1.2rem] opacity-50"></div>
                        <Users size={36} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1">{group.name}</h3>

                    {/* Stats Pills */}
                    <div className="flex justify-center gap-3 mt-4 mb-6">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                            {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 capitalize tracking-wide">{group.type}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                            <Users size={14} className="text-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wide">{users_count} Members</span>
                        </div>
                    </div>

                    <div className="space-y-5 text-left">
                        {/* Description Card */}
                        <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                            <div className="flex items-start gap-3">
                                <Info size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {group.description || "Welcome to the group! No description provided yet."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCopyLink}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 shadow-lg group ${copied
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-emerald-500/25'
                                    : 'bg-gradient-to-r from-indigo-500 hover:from-indigo-600 to-purple-600 hover:to-purple-700 text-white shadow-indigo-500/25'
                                }`}
                        >
                            {copied ? <CheckCircle2 size={18} className="animate-in zoom-in" /> : <LinkIcon size={18} className="group-hover:rotate-12 transition-transform" />}
                            {copied ? "Invite Link Copied!" : "Copy Invite Link"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-[2rem] shadow-2xl w-full max-w-[380px] p-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                            <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">New Hub</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Create a space to learn and collaborate.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors hover:scale-110 active:scale-95"><X size={16} strokeWidth={2.5} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                        <input type="text" placeholder="e.g. React Native Devs" className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-400" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                        <textarea placeholder="What is the mission of this community?" rows={3} className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-400" onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div className="space-y-1.5 pb-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Privacy</label>
                        <div className="relative">
                            <select className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium text-slate-800 dark:text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                <option value="public">🌍 Public (Anyone can join)</option>
                                <option value="private">🔒 Private (Invite only)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3.5 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-[length:200%_auto] hover:bg-right active:scale-95 transition-all duration-500">
                        Launch Community
                    </button>
                </form>
            </div>
        </div>
    );
};

const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={onClose}><X size={20} /></button>
            <img src={image} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

// --- CONTEXT-AWARE JOIN MODAL ---
const JoinConfirmModal = ({ isOpen, onClose, onConfirm, contextType }) => {
    if (!isOpen) return null;

    const isInvite = contextType === 'invite';
    const title = isInvite ? "You've Been Invited!" : "Join Community?";
    const message = isInvite
        ? "Would you like to join this private hub and start collaborating?"
        : "Ready to jump in and collaborate with this public hub?";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-[340px] text-center border border-white dark:border-slate-800">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-indigo-500">
                    <UserPlus size={28} />
                </div>
                <h2 className="text-lg font-black dark:text-white mb-2">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed mb-6">{message}</p>
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        onClick={onClose}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`py-2.5 px-4 text-white text-sm rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 ${PRIMARY_GRADIENT}`}
                    >
                        Join Now
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const GroupsPage = () => {
    const [allData, setAllData] = useState({ created: [], joined: [], public: [] });
    const [activeTab, setActiveTab] = useState("Joined");
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [socket, setSocket] = useState(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Join Confirmation State
    const [showJoinConfirm, setShowJoinConfirm] = useState(false);
    const [pendingJoinGroupId, setPendingJoinGroupId] = useState(null);
    const [joinContext, setJoinContext] = useState("discover"); // 'invite' | 'discover'

    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const { user } = useUser();

    // URL INVITE INTERCEPTOR
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const inviteId = params.get("invite");

        if (inviteId) {
            setJoinContext("invite");
            setPendingJoinGroupId(inviteId);
            setShowJoinConfirm(true);

            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }
    }, []);

    const fetchList = async () => {
        try {
            const res = await dispatch(FetchGroup()).unwrap();
            setAllData({ created: res.created_groups, joined: res.joined_groups, public: res.public_groups });
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openGroupChat = async (id) => {
        if (selectedGroupId === id) return;
        setSelectedGroupId(id);
        setIsChatLoading(true);
        if (socket) socket.close();

        try {
            const result = await dispatch(fetchGroupDetails(id)).unwrap();
            setChatDetails(result);
            setMessages(result.group_messages.map(msg => ({
                id: msg.id, sender: msg.username, profile_pic: msg.profile_pic, image: msg.image,
                content: msg.message, timestamp: new Date(msg.created_at), isCurrentUser: msg.username === user.username
            })));

            const ws = new WebSocket(`wss://api.eduflow.muhammedshan.info/ws/chat/${id}/`);
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(), sender: data.username, content: data.message,
                    image: data.image, timestamp: new Date(), isCurrentUser: data.username === user.username
                }]);
            };
            setSocket(ws);
        } catch (err) { console.error(err); setSelectedGroupId(null); }
        finally { setIsChatLoading(false); }
    };

    // Derived State: Filter out already joined groups from Discover
    const joinedGroupIds = new Set([
        ...allData.joined.map(g => g.id),
        ...allData.created.map(g => g.id)
    ]);
    const unjoinedPublicGroups = allData.public.filter(g => !joinedGroupIds.has(g.id));

    const handleSelectGroup = async (id) => {
        const isUnjoinedPublicGroup = unjoinedPublicGroups.some(g => g.id === id);

        if (isUnjoinedPublicGroup) {
            setJoinContext("discover");
            setPendingJoinGroupId(id);
            setShowJoinConfirm(true);
            return;
        }

        openGroupChat(id);
    };

    const confirmJoinGroup = async () => {
        if (pendingJoinGroupId) {
            try {
                await openGroupChat(pendingJoinGroupId);
                await fetchList();
                setShowJoinConfirm(false);
                setPendingJoinGroupId(null);
            } catch (err) {
                console.error("Failed to join", err);
                setShowJoinConfirm(false);
            }
        }
    };

    const sendMessage = () => {
        if (!inputValue.trim() || !socket) return;
        socket.send(JSON.stringify({ message: inputValue, username: user.username }));
        setInputValue("");
    };

    const handleImageUpload = async (file) => {
        if (!file || !selectedGroupId) return;
        const formData = new FormData();
        formData.append("group_id", selectedGroupId);
        formData.append("image", file);
        try { await api.post("/groups/send-image/", formData); }
        catch (err) { console.error(err); }
    };

    const handleCreateGroup = async (data) => {
        try {
            await dispatch(CreateGroup(data)).unwrap();
            await fetchList();
            setOpenCreateModal(false);
        } catch (err) { console.error(err); }
    };

    const handleLeaveGroup = async () => {
        try {
            await dispatch(LeaveGroup(selectedGroupId)).unwrap();
            setShowLeaveConfirm(false);
            setSelectedGroupId(null);
            fetchList();
        } catch (err) { console.error(err); }
    };

    // Apply text search filter
    const filterFn = (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Determine which list to show based on tabs
    const displayList = activeTab === "Discover" ? unjoinedPublicGroups.filter(filterFn) :
        activeTab === "Created" ? allData.created.filter(filterFn) :
            allData.joined.filter(filterFn);

    return (
        <div className={`flex h-[calc(100dvh-73px)] w-full relative ${SOFT_BG} font-sans overflow-hidden`}>

            {/* --- LEFT SIDEBAR (Compact UI) --- */}
            <aside className={`w-full lg:w-[320px] xl:w-[360px] flex flex-col h-full bg-white dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all z-30 shrink-0 ${selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>

                <div className="p-5 pb-2 shrink-0">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-[20px] font-black tracking-tight dark:text-white">Groups</h1>
                        <button onClick={() => setOpenCreateModal(true)} className={`p-2 text-white rounded-xl shadow-md active:scale-95 transition-all ${PRIMARY_GRADIENT}`}>
                            <Plus size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="relative mb-5">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find a Group..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 bg-slate-100 dark:bg-slate-800/50 border border-transparent rounded-xl text-[13px] dark:text-white focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        />
                    </div>

                    {/* Segmented Control */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg mb-3">
                        {["Joined", "Created", "Discover"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab
                                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-[88px] lg:pb-6 space-y-0.5 scrollbar-hide">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <LayoutGrid size={36} strokeWidth={1} />
                            <p className="mt-3 text-xs font-bold">No hubs found.</p>
                        </div>
                    ) : (
                        displayList.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => handleSelectGroup(group.id)}
                                className={`group flex items-center p-2.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] ${selectedGroupId === group.id
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${selectedGroupId === group.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700'
                                    }`}>
                                    <Hash size={18} />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={`text-[13px] font-bold truncate ${selectedGroupId === group.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{group.name}</h3>
                                        {group.type === "private" && <Lock size={10} className="text-slate-400" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{group.description || "Start collaborating..."}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* --- RIGHT PANE (Strict Flex Column for fixed header/input) --- */}
            <main className={`flex-1 flex flex-col h-full relative bg-transparent ${!selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedGroupId ? (
                    <>
                        {/* 1. FIXED HEADER */}
                        <header className="shrink-0 h-[72px] px-5 md:px-8 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedGroupId(null)} className="lg:hidden p-1.5 -ml-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ArrowLeft size={18} /></button>
                                <div>
                                    <h2 className="text-[16px] font-black dark:text-white flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowInfo(true)}>
                                        <Hash size={16} className="text-indigo-500" />
                                        {chatDetails?.group?.name}
                                    </h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                        <Users size={10} />
                                        {chatDetails?.users_count} Members
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => setShowInfo(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"><Info size={18} /></button>
                                <button onClick={() => setShowLeaveConfirm(true)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"><LogOut size={18} /></button>
                            </div>
                        </header>

                        {/* 2. SCROLLING MESSAGES */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth scrollbar-hide">
                            <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                                {isChatLoading ? (
                                    <div className="flex items-center justify-center h-full my-auto"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
                                ) : (
                                    messages.map(msg => <MessageBubble key={msg.id} message={msg} onImageClick={setPreviewImage} />)
                                )}
                                <div ref={messagesEndRef} className="h-2" />
                            </div>
                        </div>

                        {/* 3. FIXED INPUT AREA (Dynamic padding on mobile: pb drops when focused) */}
                        <div className="shrink-0 px-4 pt-2 pb-[88px] focus-within:pb-4 lg:pb-6 lg:focus-within:pb-6 bg-gradient-to-t from-[#f8fafc] dark:from-slate-950 via-[#f8fafc]/90 dark:via-slate-950/90 to-transparent z-20 transition-all duration-300">
                            <div className="max-w-4xl mx-auto relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-10 group-focus-within:opacity-20 blur transition-opacity duration-500" />

                                <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[22px] p-1.5 shadow-xl transition-all group-focus-within:border-indigo-400 dark:group-focus-within:border-indigo-500/50">
                                    <label className="p-2.5 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <ImageIcon size={18} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                                    </label>

                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder={`Message #${chatDetails?.group?.name}`}
                                        className="flex-1 bg-transparent px-2 py-1.5 text-[14px] text-slate-700 dark:text-slate-100 outline-none placeholder:text-slate-400"
                                    />

                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim()}
                                        className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all duration-300 ${!inputValue.trim()
                                                ? 'text-slate-300 dark:text-slate-600 bg-transparent'
                                                : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:scale-105'
                                            }`}
                                    >
                                        <Send size={16} className={!inputValue.trim() ? '' : 'translate-x-[1px] -translate-y-[1px]'} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-[88px] lg:pb-4">
                        <div className="relative mb-6 group">
                            <div className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700" />
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 relative z-10">
                                <MessageSquare size={32} className="text-indigo-600" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Welcome to EduFlow Groups</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-[280px] text-[13px] leading-relaxed">
                            Select a groups from the sidebar to start sharing resources, tracking habits, and learning together.
                        </p>
                    </div>
                )}
            </main>

            {/* MODALS */}
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={chatDetails?.group} users_count={chatDetails?.users_count} />
            <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />

            {/* --- CONTEXT-AWARE JOIN MODAL --- */}
            <JoinConfirmModal
                isOpen={showJoinConfirm}
                onClose={() => {
                    setShowJoinConfirm(false);
                    setPendingJoinGroupId(null);
                }}
                onConfirm={confirmJoinGroup}
                contextType={joinContext}
            />

            {/* Leave Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-[340px] text-center border border-white dark:border-slate-800">
                        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500"><LogOut size={28} /></div>
                        <h2 className="text-lg font-black dark:text-white mb-2">Leave Group?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-6">You'll need a new invite to rejoin.</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button onClick={() => setShowLeaveConfirm(false)} className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={handleLeaveGroup} className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-colors active:scale-95">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;