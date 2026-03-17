import React, { useEffect, useState, useRef } from "react";
import { 
    Search, Users, Plus, X, ChevronRight, LayoutGrid, 
    MessageSquare, Send, ArrowLeft, MoreVertical, LogOut, 
    Globe, Lock, Link as LinkIcon, Image as ImageIcon, Loader2,
    Hash, Info, CheckCircle2, UserPlus
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

// 1. Floating Message Bubble
const MessageBubble = ({ message, onImageClick }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex w-full mb-6 ${isCurrentUser ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="hidden sm:flex w-8 h-8 rounded-full flex-shrink-0 bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-900 shadow-sm items-center justify-center">
                    {message.profile_pic ? (
                        <img src={message.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {message.sender?.charAt(0)}
                        </span>
                    )}
                </div>
                
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-2 mb-1">
                            {message.sender}
                        </span>
                    )}
                    
                    <div className={`relative px-5 py-3.5 shadow-sm transition-all ${
                        isCurrentUser 
                        ? 'bg-indigo-600 text-white rounded-[20px] rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700/50'
                    }`}>
                        {message.image && (
                            <div className="mb-3 rounded-xl overflow-hidden cursor-zoom-in ring-1 ring-black/5" onClick={() => onImageClick(message.image)}>
                                <img src={message.image} alt="attachment" className="max-h-72 w-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        {message.content && (
                            <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert text-indigo-50' : 'dark:prose-invert'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                        <div className={`text-[9px] mt-2 font-medium flex justify-end ${isCurrentUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Updated Group Info Modal (With working Copy logic)
const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    if (!open || !group) return null;
    const [copied, setCopied] = useState(false);

    // FIXED COPY LOGIC: Uses URL query param (?invite=id) so you don't need a special router setup
    const handleCopyLink = () => {
        // Creates link like: https://yourdomain.com/groups?invite=group_id
        const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${group.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Premium Banner Header */}
                <div className={`h-24 ${PRIMARY_GRADIENT} relative`}>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"><X size={18} /></button>
                </div>
                
                <div className="px-8 pb-8 -mt-10 text-center">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl mx-auto shadow-xl flex items-center justify-center mb-4 border-4 border-white dark:border-slate-900">
                        <Users size={32} className="text-indigo-600" />
                    </div>
                    
                    <h3 className="text-2xl font-black dark:text-white">{group.name}</h3>
                    
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visibility</span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                                {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                                <span className="capitalize">{group.type}</span>
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 self-end" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Members</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{users_count}</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="text-left p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{group.description || "No mission statement yet."}"</p>
                        </div>
                        
                        {/* Copy Button UI */}
                        <button 
                            onClick={handleCopyLink} 
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                copied 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20' 
                                : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
                            }`}
                        >
                            {copied ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-white dark:border-slate-800">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black dark:text-white">New Hub</h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Community Name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-shadow" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <textarea placeholder="What's this group about?" rows={3} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-shadow resize-none" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none font-medium cursor-pointer" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="public">🌍 Public (Anyone can join)</option>
                        <option value="private">🔒 Private (Invite only)</option>
                    </select>
                    <div className="pt-2">
                        <button type="submit" className={`w-full py-4 mt-2 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all ${PRIMARY_GRADIENT}`}>Create Community</button>
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
            <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={onClose}><X size={24} /></button>
            <img src={image} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

// --- INLINE JOIN CONFIRMATION MODAL ---
const JoinConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm text-center border border-white dark:border-slate-800">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                    <UserPlus size={32} />
                </div>
                <h2 className="text-xl font-black dark:text-white mb-2">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{message}</p>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onClose} 
                        className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={`py-3 px-4 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 ${PRIMARY_GRADIENT}`}
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
    
    // --- STATES FOR JOIN CONFIRMATION ---
    const [showJoinConfirm, setShowJoinConfirm] = useState(false);
    const [pendingJoinGroupId, setPendingJoinGroupId] = useState(null);

    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const { user } = useUser();

    // --- NEW: URL INVITE INTERCEPTOR ---
    useEffect(() => {
        // Checks if the user arrived via an invite link (e.g. ?invite=xyz123)
        const params = new URLSearchParams(window.location.search);
        const inviteId = params.get("invite");
        
        if (inviteId) {
            setPendingJoinGroupId(inviteId);
            setShowJoinConfirm(true);
            
            // Instantly clean the URL so it doesn't pop up again if they refresh the page
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }
    }, []);

    // Data fetching logic
    const fetchList = async () => {
        try {
            const res = await dispatch(FetchGroup()).unwrap();
            setAllData({ created: res.created_groups, joined: res.joined_groups, public: res.public_groups });
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Extracted chat logic into a reusable function
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

    // Modified handleSelectGroup to check if they need to join first
    const handleSelectGroup = async (id) => {
        const isPublicGroup = allData.public.some(g => g.id === id);
        const isAlreadyJoined = allData.joined.some(g => g.id === id) || allData.created.some(g => g.id === id);

        if (isPublicGroup && !isAlreadyJoined) {
            setPendingJoinGroupId(id);
            setShowJoinConfirm(true);
            return; 
        }

        openGroupChat(id);
    };

    // Executes when a user clicks "Join Now" in the modal (from list OR invite link)
    const confirmJoinGroup = async () => {
        if (pendingJoinGroupId) {
            try {
                // If your backend requires a specific API call to join a private group, 
                // dispatch it here before opening the chat. Example:
                // await dispatch(JoinGroupAction(pendingJoinGroupId)).unwrap();

                await openGroupChat(pendingJoinGroupId);
                await fetchList(); 
                setShowJoinConfirm(false);
                setPendingJoinGroupId(null);
            } catch (err) {
                console.error("Failed to join via invite", err);
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
    const displayList = activeTab === "Discover" ? allData.public.filter(filterFn) : 
                        activeTab === "Created" ? allData.created.filter(filterFn) : 
                        allData.joined.filter(filterFn);

    return (
        <div className={`flex h-screen w-full ${SOFT_BG} font-sans overflow-hidden`}>
            
            {/* --- LEFT SIDEBAR (List) --- */}
            <aside className={`w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-white dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all z-30 ${selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight dark:text-white">EduFlow Hubs</h1>
                        </div>
                        <button onClick={() => setOpenCreateModal(true)} className={`p-2.5 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all ${PRIMARY_GRADIENT}`}>
                            <Plus size={22} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find a community..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3.5 pl-11 pr-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl text-sm dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        />
                    </div>

                    {/* Modern iOS-style Segmented Control */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                        {["Joined", "Created", "Discover"].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    activeTab === tab 
                                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-32 space-y-1 scrollbar-hide">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <LayoutGrid size={48} strokeWidth={1} />
                            <p className="mt-4 text-sm font-bold">No hubs found here.</p>
                        </div>
                    ) : (
                        displayList.map((group) => (
                            <div 
                                key={group.id} 
                                onClick={() => handleSelectGroup(group.id)} 
                                className={`group flex items-center p-3 rounded-2xl cursor-pointer transition-all ${
                                    selectedGroupId === group.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                                    selectedGroupId === group.id 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                    <Hash size={20} />
                                </div>
                                <div className="ml-4 flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={`text-sm font-bold truncate ${selectedGroupId === group.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{group.name}</h3>
                                        {group.type === "private" && <Lock size={12} className="text-slate-400" />}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{group.description || "Start collaborating..."}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* --- RIGHT PANE (Chat) --- */}
            <main className={`flex-1 flex flex-col relative transition-all bg-transparent ${!selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedGroupId ? (
                    <>
                        {/* Premium Floating Header */}
                        <header className="h-20 px-6 md:px-8 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedGroupId(null)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                                <div>
                                    <h2 className="text-lg font-black dark:text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowInfo(true)}>
                                        <Hash size={18} className="text-indigo-500" />
                                        {chatDetails?.group?.name}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                        <Users size={10} />
                                        {chatDetails?.users_count} Members
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowInfo(true)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all hidden sm:block"><Info size={20}/></button>
                                <button onClick={() => setShowLeaveConfirm(true)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><LogOut size={20}/></button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 scroll-smooth scrollbar-hide">
                            <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                                {isChatLoading ? (
                                    <div className="flex items-center justify-center h-full my-auto"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                                ) : (
                                    messages.map(msg => <MessageBubble key={msg.id} message={msg} onImageClick={setPreviewImage} />)
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </div>

                        {/* Floating Input Area */}
                        <div className="px-4 py-6 pb-32 md:pb-32 bg-gradient-to-t from-[#f8fafc] dark:from-slate-950 via-[#f8fafc]/90 dark:via-slate-950/90 to-transparent">
                            <div className="max-w-4xl mx-auto relative group">
                                {/* Subtle glow effect behind the input */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[26px] opacity-10 group-focus-within:opacity-20 blur-md transition-opacity duration-500" />
                                
                                <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-1.5 shadow-xl transition-all group-focus-within:border-indigo-400 dark:group-focus-within:border-indigo-500/50">
                                    <label className="p-3 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <ImageIcon size={20} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                                    </label>
                                    
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder={`Message #${chatDetails?.group?.name}`}
                                        className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-700 dark:text-slate-100 outline-none placeholder:text-slate-400"
                                    />
                                    
                                    <button 
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim()}
                                        className={`p-3 rounded-[18px] transition-all duration-300 ${
                                            !inputValue.trim() 
                                            ? 'text-slate-300 dark:text-slate-600 bg-transparent' 
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105'
                                        }`}
                                    >
                                        <Send size={18} className={!inputValue.trim() ? '' : 'translate-x-0.5 -translate-y-0.5 transition-transform'} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center pb-32">
                        <div className="relative mb-8 group">
                            <div className="absolute -inset-6 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700" />
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800 relative z-10">
                                <MessageSquare size={40} className="text-indigo-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Welcome to EduFlow Hubs</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
                            Select a community from the sidebar to start sharing resources, tracking habits, and learning together.
                        </p>
                    </div>
                )}
            </main>

            {/* MODALS */}
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={chatDetails?.group} users_count={chatDetails?.users_count} />
            <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />

            {/* --- INLINE JOIN CONFIRMATION MODAL --- */}
            <JoinConfirmModal
                isOpen={showJoinConfirm}
                onClose={() => {
                    setShowJoinConfirm(false);
                    setPendingJoinGroupId(null);
                }}
                onConfirm={confirmJoinGroup}
                title="You've Been Invited!"
                message="Would you like to join this private hub and start collaborating?"
            />

            {/* Leave Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm text-center border border-white dark:border-slate-800">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500"><LogOut size={32} /></div>
                        <h2 className="text-xl font-black dark:text-white mb-2">Leave Group?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">You'll need a new invite to rejoin.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowLeaveConfirm(false)} className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={handleLeaveGroup} className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-colors">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;