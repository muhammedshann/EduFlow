import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
    Search, Users, Plus, X, LayoutGrid, 
    MessageSquare, Send, ArrowLeft, LogOut, 
    Globe, Lock, Link as LinkIcon, Image as ImageIcon, Loader2,
    Hash, Info, CheckCircle2, UserPlus, Navigation
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── UTILS ───
const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const PRIMARY_GRADIENT = "bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600";

// ─── MESSAGE BUBBLE ───
const MessageBubble = ({ message, onImageClick }) => {
    const self = message.isCurrentUser;
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex w-full mb-4 ${self ? "justify-end" : "justify-start"}`}
        >
            <div className={`flex items-end gap-2.5 max-w-[85%] md:max-w-[70%] ${self ? "flex-row-reverse" : "flex-row"}`}>
                <div className="hidden sm:flex w-7 h-7 rounded-full shrink-0 bg-slate-200 dark:bg-slate-800 overflow-hidden items-center justify-center ring-2 ring-slate-50 dark:ring-slate-950">
                    {message.profile_pic ? (
                        <img src={message.profile_pic} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{message.sender?.charAt(0)}</span>
                    )}
                </div>
                <div className={`flex flex-col ${self ? "items-end" : "items-start"}`}>
                    {!self && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-1.5 mb-1 font-mono">{message.sender}</span>
                    )}
                    <div
                        className={`relative px-4 py-2.5 transition-all ${
                            self
                                ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
                                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm"
                        }`}
                    >
                        {message.image && (
                            <div className="mb-2 rounded-xl overflow-hidden cursor-zoom-in" onClick={() => onImageClick(message.image)}>
                                <img src={message.image} alt="attachment" className="max-h-60 w-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                            </div>
                        )}
                        {message.content && (
                            <div className={`text-[13px] leading-relaxed prose prose-sm max-w-none ${self ? 'prose-invert text-indigo-50' : 'dark:prose-invert'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                        <div className={`text-[9px] mt-1.5 font-medium flex justify-end opacity-70 font-mono ${self ? "text-indigo-200" : "text-slate-400"}`}>
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── GROUP INFO MODAL ───
const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    const [copied, setCopied] = useState(false);
    if (!open || !group) return null;

    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${group.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`h-24 ${PRIMARY_GRADIENT} relative`}>
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 pb-6 -mt-10 text-center">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl mx-auto shadow-lg flex items-center justify-center mb-3 border-4 border-white dark:border-slate-900">
                        <Users size={28} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{group.name}</h3>
                    <div className="flex justify-center gap-6 mt-3">
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Visibility</span>
                            <span className="flex items-center gap-1 text-[13px] font-bold text-slate-800 dark:text-slate-200">
                                {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                                <span className="capitalize">{group.type}</span>
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 self-end" />
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Members</span>
                            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{users_count}</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="text-left p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[13px] text-slate-600 dark:text-slate-400 italic">"{group.description || "No description yet."}"</p>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors ${
                                copied 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20' 
                                : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
                            }`}
                        >
                            {copied ? <CheckCircle2 size={16} /> : <LinkIcon size={16} />}
                            {copied ? "Link Copied!" : "Copy Invite Link"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ─── CREATE GROUP MODAL ───
const CreateGroupModal = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: "", description: "", type: "public" });
    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        onSubmit(formData);
        setFormData({ name: "", description: "", type: "public" });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">New Hub</h2>
                    <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Hub name"
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="What's this hub about?"
                        rows={3}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <select
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="public">🌍 Public (Anyone can join)</option>
                        <option value="private">🔒 Private (Invite only)</option>
                    </select>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[14px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className={`flex-1 py-3.5 rounded-xl text-white text-[14px] font-bold hover:opacity-90 transition-opacity ${PRIMARY_GRADIENT}`}>
                            Create
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ─── IMAGE PREVIEW MODAL ───
const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[120] flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={onClose}>
                <X size={24} />
            </button>
            <img src={image} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

// ─── JOIN CONFIRM MODAL ───
const JoinConfirmModal = ({ isOpen, onClose, onConfirm, contextType }) => {
    if (!isOpen) return null;
    const isInvite = contextType === "invite";
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-xs p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto mb-5">
                    <UserPlus size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{isInvite ? "You're Invited!" : "Join Hub?"}</h2>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {isInvite ? "Join this private hub and start collaborating." : "Ready to jump in and collaborate with this group?"}
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wide">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl text-white text-[13px] font-bold hover:opacity-90 transition-opacity uppercase tracking-wide ${PRIMARY_GRADIENT}`}>Join</button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── LEAVE CONFIRM MODAL ───
const LeaveConfirmModal = ({ open, onClose, onConfirm }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-xs p-8 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-5">
                    <LogOut size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Leave Group?</h2>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">You'll need a new invite to rejoin later.</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wide">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-[13px] font-bold hover:bg-rose-600 transition-colors uppercase tracking-wide">Leave</button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── TABS ───
const tabs = ["Joined", "Created", "Discover"];

// ═══════════════════════════════════════════
// ─── MAIN PAGE COMPONENT ───
// ═══════════════════════════════════════════
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
    
    const [showJoinConfirm, setShowJoinConfirm] = useState(false);
    const [pendingJoinGroupId, setPendingJoinGroupId] = useState(null);
    const [joinContext, setJoinContext] = useState("discover");

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
    
    useEffect(() => { 
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [messages]);

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

    const joinedGroupIds = new Set([...allData.joined.map((g) => g.id), ...allData.created.map((g) => g.id)]);
    const unjoinedPublicGroups = allData.public.filter((g) => !joinedGroupIds.has(g.id));

    const handleSelectGroup = async (id) => {
        if (unjoinedPublicGroups.some((g) => g.id === id)) {
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

    const filterFn = (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const displayList =
        activeTab === "Discover" ? unjoinedPublicGroups.filter(filterFn) : activeTab === "Created" ? allData.created.filter(filterFn) : allData.joined.filter(filterFn);

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* ═══ SIDEBAR ═══ */}
            <aside className={`w-full md:w-[320px] lg:w-[340px] flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 ${selectedGroupId ? "hidden md:flex" : "flex"}`}>
                <div className="px-5 pt-6 pb-4 shrink-0">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Hubs</h1>
                        <button onClick={() => setOpenCreateModal(true)} className={`w-8 h-8 rounded-xl text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-md ${PRIMARY_GRADIENT}`}>
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="relative mb-5">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search hubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
                                    activeTab === tab ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-28 md:pb-28 space-y-0.5 scrollbar-hide">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-600">
                            <Hash size={32} strokeWidth={1.5} />
                            <p className="mt-2 text-[13px] font-bold">No hubs found</p>
                        </div>
                    ) : (
                        displayList.map((group) => {
                            const active = selectedGroupId === group.id;
                            return (
                                <motion.div
                                    key={group.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectGroup(group.id)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-colors duration-150 ${
                                        active ? "bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 text-sm font-bold ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                                        <Hash size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[14px] font-bold truncate tracking-tight ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"}`}>{group.name}</span>
                                            {group.type === "private" && <Lock size={10} className="text-slate-400 shrink-0" />}
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">{group.description || "Start collaborating..."}</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* ═══ CHAT ═══ */}
            <main className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden ${!selectedGroupId ? "hidden md:flex" : "flex"}`}>
                {selectedGroupId && chatDetails ? (
                    <>
                        <header className="shrink-0 h-[72px] px-5 md:px-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setSelectedGroupId(null); setChatDetails(null); }} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors">
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowInfo(true)}>
                                    <h2 className="text-[16px] font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                        <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Hash size={14} /></span>
                                        {chatDetails.group.name}
                                    </h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1 ml-8">
                                        <Users size={10} /> {chatDetails.users_count} members
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setShowInfo(true)} className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Info size={18} />
                                </button>
                                <button onClick={() => setShowLeaveConfirm(true)} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-hide">
                            <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                                {isChatLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                                    </div>
                                ) : (
                                    messages.map((msg) => <MessageBubble key={msg.id} message={msg} onImageClick={setPreviewImage} />)
                                )}
                                <div ref={messagesEndRef} className="h-2" />
                            </div>
                        </div>

                        <div className="shrink-0 px-4 md:px-8 pt-2 pb-28 bg-slate-50 dark:bg-slate-950">
                            <div className="max-w-4xl mx-auto flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-2 py-1.5 focus-within:border-indigo-400 dark:focus-within:border-indigo-500/50 shadow-sm transition-all">
                                <label className="p-2.5 text-slate-400 hover:text-indigo-500 cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <ImageIcon size={20} />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                                </label>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder={`Message #${chatDetails.group.name}`}
                                    className="flex-1 bg-transparent py-2 text-[14px] font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputValue.trim()}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                        inputValue.trim() ? "bg-indigo-600 text-white hover:opacity-90 shadow-md shadow-indigo-200 dark:shadow-none" : "text-slate-400 opacity-50"
                                    }`}
                                >
                                    <Navigation size={18} className={`fill-current rotate-45 ${inputValue.trim() ? "translate-x-[1px] -translate-y-[1px]" : ""}`} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-32">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-500/20">
                                <MessageSquare size={36} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Select a Hub</h2>
                            <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 max-w-[300px] leading-relaxed">
                                Pick a community from the sidebar to start collaborating and sharing ideas.
                            </p>
                        </motion.div>
                    </div>
                )}
            </main>

            {/* ═══ MODALS ═══ */}
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={chatDetails?.group} users_count={chatDetails?.users_count} />
            <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
            <JoinConfirmModal isOpen={showJoinConfirm} onClose={() => { setShowJoinConfirm(false); setPendingJoinGroupId(null); }} onConfirm={confirmJoinGroup} contextType={joinContext} />
            <LeaveConfirmModal open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)} onConfirm={handleLeaveGroup} />
        </div>
    );
};

export default GroupsPage;