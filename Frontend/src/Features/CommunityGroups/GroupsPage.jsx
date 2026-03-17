import React, { useEffect, useState, useRef } from "react";
import { 
    Search, Users, Plus, X, LayoutGrid, 
    MessageSquare, Send, ArrowLeft, LogOut, 
    Globe, Lock, Link as LinkIcon, Image as ImageIcon, Loader2,
    Hash, Info, CheckCircle2, UserPlus, Sparkles, Navigation
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- THEME CONSTANTS ---
const PRIMARY_GRADIENT = "bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600";

// --- UTILS ---
const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// --- COMPONENTS ---

// 1. Sleek Message Bubble
const MessageBubble = ({ message, onImageClick }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex w-full mb-5 ${isCurrentUser ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-end gap-2.5 max-w-[85%] md:max-w-[65%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Compact Avatar */}
                <div className="hidden sm:flex w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden shadow-sm items-center justify-center ring-2 ring-white dark:ring-slate-900">
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
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1.5 mb-1.5">
                            {message.sender}
                        </span>
                    )}
                    
                    <div className={`relative px-4 py-2.5 shadow-sm transition-all ${
                        isCurrentUser 
                        ? 'bg-indigo-600 text-white rounded-[20px] rounded-br-sm shadow-indigo-500/20' 
                        : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-100 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700/50'
                    }`}>
                        {message.image && (
                            <div className="mb-2 rounded-xl overflow-hidden cursor-zoom-in ring-1 ring-black/5" onClick={() => onImageClick(message.image)}>
                                <img src={message.image} alt="attachment" className="max-h-60 w-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                            </div>
                        )}
                        {message.content && (
                            <div className={`text-[13px] leading-relaxed prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert text-indigo-50' : 'dark:prose-invert'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                        <div className={`text-[9px] mt-1.5 font-bold flex justify-end opacity-60 tracking-wider ${isCurrentUser ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Modals (Kept exact same functionality, applied new premium glassmorphism styling)
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl w-full max-w-[340px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className={`h-24 ${PRIMARY_GRADIENT} relative`}>
                    <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"><X size={16} /></button>
                </div>
                <div className="px-6 pb-6 -mt-10 text-center">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl mx-auto shadow-xl flex items-center justify-center mb-3 border-[4px] border-white dark:border-slate-900">
                        <Users size={28} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black dark:text-white tracking-tight">{group.name}</h3>
                    <div className="flex justify-center gap-5 mt-3">
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Visibility</span>
                            <span className="flex items-center gap-1 text-[13px] font-bold text-slate-700 dark:text-slate-200">
                                {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                                <span className="capitalize">{group.type}</span>
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 self-end" />
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Members</span>
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{users_count}</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="text-left p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[13px] text-slate-600 dark:text-slate-400 italic font-medium">"{group.description || "No mission statement yet."}"</p>
                        </div>
                        <button 
                            onClick={handleCopyLink} 
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-[360px] p-6 border border-white/20 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black dark:text-white flex items-center gap-2"><Sparkles size={20} className="text-indigo-500"/> New Hub</h2>
                    <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <input type="text" placeholder="Community Name" className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-2xl text-[14px] dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <textarea placeholder="What's this group about?" rows={3} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-2xl text-[14px] dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none font-medium" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <select className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-2xl text-[14px] dark:text-white outline-none font-bold cursor-pointer" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="public">🌍 Public (Anyone can join)</option>
                        <option value="private">🔒 Private (Invite only)</option>
                    </select>
                    <div className="pt-2">
                        <button type="submit" className={`w-full py-3.5 mt-1 text-white text-[14px] font-black rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all tracking-wide ${PRIMARY_GRADIENT}`}>Create Community</button>
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
            <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={onClose}><X size={20} /></button>
            <img src={image} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

const JoinConfirmModal = ({ isOpen, onClose, onConfirm, contextType }) => {
    if (!isOpen) return null;
    const isInvite = contextType === 'invite';
    const title = isInvite ? "You've Been Invited!" : "Join Community?";
    const message = isInvite 
        ? "Would you like to join this private hub and start collaborating?" 
        : "Ready to jump in and collaborate with this public hub?";
    
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-[340px] text-center border border-white/20 dark:border-slate-800">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.25rem] flex items-center justify-center mx-auto mb-5 text-indigo-500 shadow-inner">
                    <UserPlus size={32} />
                </div>
                <h2 className="text-xl font-black dark:text-white mb-2 tracking-tight">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium leading-relaxed mb-8">{message}</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-[13px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wide">Cancel</button>
                    <button onClick={onConfirm} className={`py-3 px-4 text-white text-[13px] rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 uppercase tracking-wide ${PRIMARY_GRADIENT}`}>Join Now</button>
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

    const filterFn = (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const displayList = activeTab === "Discover" ? unjoinedPublicGroups.filter(filterFn) : 
                        activeTab === "Created" ? allData.created.filter(filterFn) : 
                        allData.joined.filter(filterFn);

    return (
        /* The root container is completely transparent and uses the Layout's background. 
           We use 'gap-4 p-4' to create the Floating Islands effect. */
        <div className="flex-1 flex w-full h-full gap-4 md:p-4 md:pb-28 overflow-hidden bg-transparent">
            
            {/* --- ISLAND 1: SIDEBAR --- */}
            <aside className={`w-full md:w-[340px] flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl md:rounded-[2rem] border-r md:border border-white/40 dark:border-slate-800/60 shadow-xl shrink-0 overflow-hidden ${selectedGroupId ? 'hidden md:flex' : 'flex'}`}>
                
                <div className="p-5 pb-3 shrink-0">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-xl font-black tracking-tight dark:text-white">EduFlow Hubs</h1>
                        <button onClick={() => setOpenCreateModal(true)} className={`p-2 text-white rounded-xl shadow-lg active:scale-95 transition-all ${PRIMARY_GRADIENT}`}>
                            <Plus size={18} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="relative mb-5">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search hubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl text-[13px] font-medium dark:text-white focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        />
                    </div>

                    {/* Segmented Control - iOS Style */}
                    <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                        {["Joined", "Created", "Discover"].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
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

                <div className="flex-1 overflow-y-auto px-3 pb-24 md:pb-6 space-y-1 scrollbar-hide">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <LayoutGrid size={36} strokeWidth={1} />
                            <p className="mt-3 text-[13px] font-bold">No hubs found.</p>
                        </div>
                    ) : (
                        displayList.map((group) => (
                            <div 
                                key={group.id} 
                                onClick={() => handleSelectGroup(group.id)} 
                                className={`group flex items-center p-2.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                                    selectedGroupId === group.id 
                                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700' 
                                    : 'hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent'
                                }`}
                            >
                                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                                    selectedGroupId === group.id 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105' 
                                    : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                                }`}>
                                    <Hash size={20} />
                                </div>
                                <div className="ml-3.5 flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={`text-[14px] font-bold truncate tracking-tight ${selectedGroupId === group.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{group.name}</h3>
                                        {group.type === "private" && <Lock size={12} className="text-slate-400" />}
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">{group.description || "Start collaborating..."}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* --- ISLAND 2: CHAT AREA --- */}
            <main className={`flex-1 flex flex-col h-full relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl md:rounded-[2rem] border-white/40 dark:border-slate-800/60 md:border md:shadow-xl overflow-hidden ${!selectedGroupId ? 'hidden md:flex' : 'flex'}`}>
                {selectedGroupId ? (
                    <>
                        {/* Internal Chat Header */}
                        <header className="shrink-0 h-[72px] px-5 md:px-8 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedGroupId(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-black/5 dark:bg-white/5 rounded-xl transition-colors"><ArrowLeft size={18} /></button>
                                <div>
                                    <h2 className="text-[17px] font-black dark:text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity tracking-tight" onClick={() => setShowInfo(true)}>
                                        <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Hash size={14} /></span>
                                        {chatDetails?.group?.name}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1 ml-8">
                                        <Users size={10} />
                                        {chatDetails?.users_count} Members
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowInfo(true)} className="p-2.5 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl transition-all"><Info size={18}/></button>
                                <button onClick={() => setShowLeaveConfirm(true)} className="p-2.5 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl transition-all"><LogOut size={18}/></button>
                            </div>
                        </header>

                        {/* Scrolling Messages */}
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

                        {/* Floating Chat Input (Clears the global sidebar dock) */}
                        <div className="shrink-0 px-4 pt-2 pb-24 md:pb-6 bg-gradient-to-t from-white/90 dark:from-slate-900/90 via-white/80 dark:via-slate-900/80 to-transparent z-20">
                            <div className="max-w-4xl mx-auto relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity duration-500" />
                                
                                <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] p-1.5 shadow-lg transition-all group-focus-within:border-indigo-400 dark:group-focus-within:border-indigo-500/50">
                                    <label className="p-3 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors rounded-[18px] hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <ImageIcon size={20} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                                    </label>
                                    
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder={`Message #${chatDetails?.group?.name}`}
                                        className="flex-1 bg-transparent px-3 py-2.5 text-[14px] font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                                    />
                                    
                                    <button 
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim()}
                                        className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-300 ${
                                            !inputValue.trim() 
                                            ? 'text-slate-300 dark:text-slate-600 bg-transparent' 
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105'
                                        }`}
                                    >
                                        <Navigation size={18} className={`fill-current ${!inputValue.trim() ? '' : 'translate-x-[1px] -translate-y-[1px] transition-transform'} rotate-45`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State Container
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-32">
                        <div className="relative mb-8 group">
                            <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700" />
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-xl border border-white dark:border-slate-700 relative z-10">
                                <MessageSquare size={36} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">EduFlow Hubs</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-[300px] text-[14px] font-medium leading-relaxed">
                            Select a community from the sidebar to start sharing resources, tracking habits, and learning together.
                        </p>
                    </div>
                )}
            </main>

            {/* MODALS */}
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={chatDetails?.group} users_count={chatDetails?.users_count} />
            <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />

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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-[340px] text-center border border-white/20 dark:border-slate-800">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-[1.25rem] flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-inner"><LogOut size={32} /></div>
                        <h2 className="text-xl font-black dark:text-white mb-2 tracking-tight">Leave Group?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-8">You'll need a new invite to rejoin.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowLeaveConfirm(false)} className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-[13px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wide">Cancel</button>
                            <button onClick={handleLeaveGroup} className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-rose-200 dark:shadow-none transition-colors active:scale-95 uppercase tracking-wide">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;