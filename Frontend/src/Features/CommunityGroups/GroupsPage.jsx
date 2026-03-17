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
const PRIMARY_GRADIENT = "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
const SOFT_BG = "bg-[#f8fafc] dark:bg-slate-950";

// --- UTILS ---
const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// --- COMPONENTS ---

// 1. High-UX Message Bubble
const MessageBubble = ({ message, onImageClick }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex w-full mb-6 ${isCurrentUser ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-3 fade-in duration-500`}>
            <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar with Ring */}
                {!isCurrentUser && (
                    <div className="hidden sm:flex w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden shadow-md items-center justify-center ring-2 ring-white dark:ring-slate-900 z-10">
                        {message.profile_pic ? (
                            <img src={message.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-black text-slate-500 uppercase">
                                {message.sender?.substring(0, 2)}
                            </span>
                        )}
                    </div>
                )}
                
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && (
                        <div className="flex items-center gap-2 mb-1.5 ml-1">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                                {message.sender}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400">
                                {formatTime(message.timestamp)}
                            </span>
                        </div>
                    )}
                    
                    <div className={`relative px-5 py-3.5 shadow-md transition-all group-hover:shadow-lg ${
                        isCurrentUser 
                        ? 'bg-indigo-600 text-white rounded-[24px] rounded-br-[8px]' 
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-[24px] rounded-bl-[8px] border border-slate-200/60 dark:border-slate-800'
                    }`}>
                        {message.image && (
                            <div className="mb-3 rounded-xl overflow-hidden cursor-zoom-in ring-1 ring-black/10" onClick={() => onImageClick(message.image)}>
                                <img src={message.image} alt="attachment" className="max-h-64 w-full object-cover hover:scale-[1.03] transition-transform duration-700 ease-out" />
                            </div>
                        )}
                        {message.content && (
                            <div className={`text-[14px] leading-relaxed prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert text-indigo-50' : 'dark:prose-invert'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                        {isCurrentUser && (
                            <div className="text-[9px] mt-2 font-bold flex justify-end opacity-60">
                                {formatTime(message.timestamp)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Modals (Kept structure, enhanced visuals)
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10" onClick={e => e.stopPropagation()}>
                <div className={`h-24 w-full ${PRIMARY_GRADIENT} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-all hover:scale-105"><X size={16} /></button>
                </div>
                
                <div className="px-6 pb-8 -mt-10 text-center relative z-10">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[1.5rem] mx-auto shadow-xl flex items-center justify-center mb-4 border-[4px] border-white dark:border-slate-900 rotate-3 transition-transform hover:rotate-0 duration-300">
                        <Users size={28} className="text-indigo-600" />
                    </div>
                    
                    <h3 className="text-xl font-black dark:text-white tracking-tight">{group.name}</h3>
                    
                    <div className="flex justify-center items-center gap-6 mt-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                                <span className="capitalize">{group.type}</span>
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Members</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{users_count}</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="text-left p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[14px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">"{group.description || "No mission statement yet."}"</p>
                        </div>
                        
                        <button 
                            onClick={handleCopyLink} 
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-wider transition-all active:scale-95 ${
                                copied 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg'
                            }`}
                        >
                            {copied ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
                            {copied ? "Invite Copied!" : "Copy Invite Link"}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-[380px] p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-xl font-black dark:text-white">New Hub</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Hub Name</label>
                        <input type="text" placeholder="e.g. Python Masters" className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm font-medium dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
                        <textarea placeholder="What is the focus?" rows={3} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm font-medium dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Access Level</label>
                        <select className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm font-bold dark:text-white outline-none cursor-pointer focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="public">🌍 Public Space</option>
                            <option value="private">🔒 Private (Invite Only)</option>
                        </select>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className={`w-full py-4 text-white text-sm font-black rounded-xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all hover:opacity-90 ${PRIMARY_GRADIENT}`}>Launch Hub</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md" onClick={onClose}><X size={24} /></button>
            <img src={image} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

const JoinConfirmModal = ({ isOpen, onClose, onConfirm, contextType }) => {
    if (!isOpen) return null;
    const isInvite = contextType === 'invite';
    const title = isInvite ? "You've Been Invited!" : "Join Community";
    const message = isInvite 
        ? "You have a pending invitation to join this private workspace." 
        : "Ready to jump in and collaborate with this public workspace?";
    
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-[360px] text-center border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 border border-indigo-100 dark:border-indigo-500/20">
                    <UserPlus size={32} />
                </div>
                <h2 className="text-xl font-black dark:text-white mb-2">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 py-3.5 text-white text-sm rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 ${PRIMARY_GRADIENT}`}>Join Hub</button>
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
    const [showJoinConfirm, setShowJoinConfirm] = useState(false);
    const [pendingJoinGroupId, setPendingJoinGroupId] = useState(null);
    const [joinContext, setJoinContext] = useState("discover"); 

    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const { user } = useUser();

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

    const joinedGroupIds = new Set([...allData.joined.map(g => g.id), ...allData.created.map(g => g.id)]);
    const unjoinedPublicGroups = allData.public.filter(g => !joinedGroupIds.has(g.id));

    const handleSelectGroup = async (id) => {
        if (unjoinedPublicGroups.some(g => g.id === id)) {
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
    const displayList = activeTab === "Discover" ? unjoinedPublicGroups.filter(filterFn) : 
                        activeTab === "Created" ? allData.created.filter(filterFn) : 
                        allData.joined.filter(filterFn);

    return (
        /* IMPORTANT FIX: Changed h-screen to h-full. The parent container 
           must handle the global header offset. overflow-hidden prevents body scroll. */
        <div className={`flex w-full h-full ${SOFT_BG} font-sans overflow-hidden`}>
            
            {/* --- LEFT SIDEBAR (Fixed internal layout) --- */}
            <aside className={`w-full lg:w-[340px] xl:w-[380px] flex flex-col h-full bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800/60 z-30 shrink-0 ${selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                
                {/* Fixed Sidebar Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 shrink-0 bg-white dark:bg-slate-900/50">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-[22px] font-black tracking-tight dark:text-white">Hubs</h1>
                        <button onClick={() => setOpenCreateModal(true)} className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-md active:scale-95 transition-all hover:opacity-90">
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="relative mb-4 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find a community..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-[14px] font-medium dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </div>

                    {/* Segmented Control */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-[10px]">
                        {["Joined", "Created", "Discover"].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${
                                    activeTab === tab 
                                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm scale-[1.02]" 
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Independently Scrolling List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <LayoutGrid size={40} strokeWidth={1} className="mb-4" />
                            <p className="text-sm font-bold">No hubs found.</p>
                            <p className="text-xs mt-1">Try a different search term.</p>
                        </div>
                    ) : (
                        displayList.map((group) => (
                            <div 
                                key={group.id} 
                                onClick={() => handleSelectGroup(group.id)} 
                                className={`group relative flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                                    selectedGroupId === group.id 
                                    ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-200/50 dark:border-slate-700 z-10' 
                                    : 'hover:bg-white/60 dark:hover:bg-slate-800/40 border border-transparent hover:shadow-sm'
                                }`}
                            >
                                {/* Active State Indicator Line */}
                                {selectedGroupId === group.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 rounded-r-full" />
                                )}

                                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    selectedGroupId === group.id 
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' 
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                                }`}>
                                    <Hash size={20} strokeWidth={selectedGroupId === group.id ? 2.5 : 2} />
                                </div>
                                <div className="ml-4 flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`text-[14px] font-bold truncate ${selectedGroupId === group.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{group.name}</h3>
                                        {group.type === "private" && <Lock size={12} className="text-slate-400 ml-2 shrink-0" />}
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">{group.description || "Start collaborating..."}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* --- RIGHT PANE (Strict Flex Column) --- */}
            <main className={`flex-1 flex flex-col h-full relative bg-transparent ${!selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedGroupId ? (
                    <>
                        {/* 1. FIXED INTERNAL HEADER */}
                        <header className="shrink-0 h-[76px] px-6 flex justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedGroupId(null)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ArrowLeft size={20} /></button>
                                <div>
                                    <h2 className="text-[17px] font-black dark:text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowInfo(true)}>
                                        <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                            <Hash size={14} />
                                        </div>
                                        {chatDetails?.group?.name}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-1 ml-8">
                                        <Users size={12} />
                                        {chatDetails?.users_count} Members
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowInfo(true)} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"><Info size={20}/></button>
                                <button onClick={() => setShowLeaveConfirm(true)} className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><LogOut size={20}/></button>
                            </div>
                        </header>

                        {/* 2. SCROLLING MESSAGES (Takes remaining height perfectly) */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth custom-scrollbar">
                            <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                                {isChatLoading ? (
                                    <div className="flex items-center justify-center h-full my-auto text-indigo-500"><Loader2 className="animate-spin" size={36} /></div>
                                ) : (
                                    messages.map(msg => <MessageBubble key={msg.id} message={msg} onImageClick={setPreviewImage} />)
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </div>

                        {/* 3. FIXED FLOATING INPUT AREA */}
                        <div className="shrink-0 p-4 bg-gradient-to-t from-[#f8fafc] dark:from-slate-950 via-[#f8fafc]/90 dark:via-slate-950/90 to-transparent z-20">
                            <div className="max-w-4xl mx-auto relative group">
                                {/* Glow Effect behind input */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[24px] opacity-10 group-focus-within:opacity-30 blur-lg transition-opacity duration-500" />
                                
                                <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-[24px] p-1.5 shadow-xl transition-all group-focus-within:border-indigo-400 dark:group-focus-within:border-indigo-500/50">
                                    <label className="p-3 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <ImageIcon size={20} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                                    </label>
                                    
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder={`Message #${chatDetails?.group?.name}`}
                                        className="flex-1 bg-transparent px-3 py-2 text-[15px] font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                                    />
                                    
                                    <button 
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim()}
                                        className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-300 ${
                                            !inputValue.trim() 
                                            ? 'text-slate-300 dark:text-slate-600 bg-transparent' 
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        <Send size={18} className={!inputValue.trim() ? '' : 'translate-x-[1px] -translate-y-[1px]'} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Animated Empty State
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent">
                        <div className="relative mb-8 group animate-in slide-in-from-bottom-4 duration-700">
                            <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 blur-2xl rounded-full group-hover:opacity-30 transition-opacity duration-700 animate-pulse" />
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/50 dark:border-slate-800 relative z-10">
                                <MessageSquare size={36} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight animate-in fade-in duration-700 delay-100">Welcome to Hubs</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-[320px] text-[14px] leading-relaxed font-medium animate-in fade-in duration-700 delay-200">
                            Select a community from the sidebar to start sharing resources, tracking habits, and learning together.
                        </p>
                    </div>
                )}
            </main>

            {/* MODALS */}
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={chatDetails?.group} users_count={chatDetails?.users_count} />
            <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
            <JoinConfirmModal isOpen={showJoinConfirm} onClose={() => { setShowJoinConfirm(false); setPendingJoinGroupId(null); }} onConfirm={confirmJoinGroup} contextType={joinContext} />

            {/* Leave Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-[360px] text-center border border-white dark:border-slate-800">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100 dark:border-rose-900/50">
                            <LogOut size={28} />
                        </div>
                        <h2 className="text-xl font-black dark:text-white mb-2">Leave Group?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">You'll need a new invite link to rejoin this space.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={handleLeaveGroup} className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/30 transition-colors active:scale-95">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;