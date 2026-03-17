import React, { useEffect, useState, useRef } from "react";
import { 
    Search, Users, Plus, X, LayoutGrid, 
    MessageSquare, Send, ArrowLeft, LogOut, 
    Globe, Lock, Link as LinkIcon, Image as ImageIcon, Loader2,
    Hash, Info, CheckCircle2, UserPlus, MoreVertical, Paperclip
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- UTILS ---
const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// --- COMPONENTS ---

// 1. Minimalist Message Bubble
const MessageBubble = ({ message, onImageClick }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex w-full mb-6 ${isCurrentUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Minimal Avatar */}
                {!isCurrentUser && (
                    <div className="hidden sm:flex w-8 h-8 rounded-full flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden items-center justify-center">
                        {message.profile_pic ? (
                            <img src={message.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[11px] font-semibold text-zinc-500 uppercase">
                                {message.sender?.substring(0, 2)}
                            </span>
                        )}
                    </div>
                )}
                
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUser && (
                        <div className="flex items-baseline gap-2 mb-1 ml-1">
                            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                                {message.sender}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                                {formatTime(message.timestamp)}
                            </span>
                        </div>
                    )}
                    
                    <div className={`relative px-4 py-3 transition-all ${
                        isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm'
                    }`}>
                        {message.image && (
                            <div className="mb-3 rounded-lg overflow-hidden cursor-zoom-in ring-1 ring-black/5" onClick={() => onImageClick(message.image)}>
                                <img src={message.image} alt="attachment" className="max-h-64 w-full object-cover hover:opacity-95 transition-opacity" />
                            </div>
                        )}
                        {message.content && (
                            <div className={`text-[14px] leading-relaxed prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert text-blue-50' : 'dark:prose-invert text-zinc-800 dark:text-zinc-200'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                        )}
                        {isCurrentUser && (
                            <div className="text-[10px] mt-1.5 flex justify-end opacity-70">
                                {formatTime(message.timestamp)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Sleek Modals
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-800/50">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Community Details</h3>
                    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                            <Hash size={28} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold dark:text-white">{group.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                    {group.type === "public" ? <Globe size={14} /> : <Lock size={14} />}
                                    <span className="capitalize">{group.type}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {users_count} Members
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</h4>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            {group.description || "No mission statement yet."}
                        </p>
                    </div>

                    <button 
                        onClick={handleCopyLink} 
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            copied 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20' 
                            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'
                        }`}
                    >
                        {copied ? <CheckCircle2 size={16} /> : <LinkIcon size={16} />}
                        {copied ? "Invite Link Copied" : "Copy Invite Link"}
                    </button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold dark:text-white">Create New Hub</h2>
                    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Hub Name</label>
                        <input type="text" placeholder="e.g. Python Developers" className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea placeholder="What is the focus of this group?" rows={3} className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Visibility</label>
                        <select className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="public">Public (Anyone can find and join)</option>
                            <option value="private">Private (Invite link required)</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Create Hub</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={onClose}><X size={24} /></button>
            <img src={image} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

const JoinConfirmModal = ({ isOpen, onClose, onConfirm, contextType }) => {
    if (!isOpen) return null;
    const isInvite = contextType === 'invite';
    const title = isInvite ? "Invitation Received" : "Join Community";
    const message = isInvite 
        ? "You've been invited to join this private hub. Ready to collaborate?" 
        : "Join this public hub to participate in the conversation.";
    
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm text-center border border-zinc-200 dark:border-zinc-800">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                    <UserPlus size={24} />
                </div>
                <h2 className="text-lg font-bold dark:text-white mb-2">{title}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{message}</p>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Join Hub</button>
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
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [messages]);

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
        <div className="flex w-full h-full bg-white dark:bg-zinc-950 overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
            
            {/* --- SIDEBAR --- */}
            <aside className={`w-full md:w-[320px] lg:w-[360px] flex flex-col h-full bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 shrink-0 ${selectedGroupId ? 'hidden md:flex' : 'flex'}`}>
                
                {/* Sidebar Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold tracking-tight">Hubs</h1>
                        <button onClick={() => setOpenCreateModal(true)} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Create Hub">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Search hubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2 pl-9 pr-3 bg-zinc-100 dark:bg-zinc-800/80 border border-transparent rounded-lg text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                        />
                    </div>

                    {/* Segmented Control */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg">
                        {["Joined", "Created", "Discover"].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                    activeTab === tab 
                                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" 
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Group List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center text-zinc-400">
                            <LayoutGrid size={24} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">No hubs found.</p>
                        </div>
                    ) : (
                        displayList.map((group) => (
                            <div 
                                key={group.id} 
                                onClick={() => handleSelectGroup(group.id)} 
                                className={`group flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                    selectedGroupId === group.id 
                                    ? 'bg-blue-50 dark:bg-blue-900/10' 
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                    selectedGroupId === group.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                                }`}>
                                    <Hash size={18} />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={`text-sm font-semibold truncate ${selectedGroupId === group.id ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                            {group.name}
                                        </h3>
                                        {group.type === "private" && <Lock size={12} className="text-zinc-400 flex-shrink-0 ml-2" />}
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                        {group.description || "Start collaborating..."}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* --- MAIN CHAT AREA --- */}
            <main className={`flex-1 flex flex-col h-full relative bg-white dark:bg-zinc-950 ${!selectedGroupId ? 'hidden md:flex' : 'flex'}`}>
                {selectedGroupId ? (
                    <>
                        {/* Header */}
                        <header className="shrink-0 h-16 px-4 md:px-6 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-20">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedGroupId(null)} className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md transition-colors"><ArrowLeft size={20} /></button>
                                <div>
                                    <h2 className="text-base font-bold flex items-center gap-2 cursor-pointer hover:underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-4" onClick={() => setShowInfo(true)}>
                                        <Hash size={18} className="text-zinc-400" />
                                        {chatDetails?.group?.name}
                                    </h2>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-500 mr-4">
                                    <Users size={14} /> {chatDetails?.users_count}
                                </span>
                                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mr-2 hidden sm:block"></div>
                                <button onClick={() => setShowInfo(true)} className="p-2 text-zinc-500 hover:text-blue-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Group Info"><Info size={18}/></button>
                                <button onClick={() => setShowLeaveConfirm(true)} className="p-2 text-zinc-500 hover:text-red-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Leave Group"><LogOut size={18}/></button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth bg-zinc-50/50 dark:bg-zinc-950/50">
                            <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                                {isChatLoading ? (
                                    <div className="flex items-center justify-center h-full my-auto text-zinc-400">
                                        <Loader2 className="animate-spin" size={28} />
                                    </div>
                                ) : (
                                    messages.map(msg => <MessageBubble key={msg.id} message={msg} onImageClick={setPreviewImage} />)
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </div>

                        {/* Message Input Dock */}
                        <div className="shrink-0 p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-transparent focus-within:border-blue-500/30">
                                <label className="p-2.5 text-zinc-400 hover:text-blue-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer rounded-lg transition-colors shrink-0">
                                    <Paperclip size={20} />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                                </label>
                                
                                <textarea 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder={`Message #${chatDetails?.group?.name}`}
                                    className="flex-1 max-h-32 bg-transparent py-3 px-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 resize-none overflow-y-auto"
                                    rows={1}
                                />
                                
                                <button 
                                    onClick={sendMessage}
                                    disabled={!inputValue.trim()}
                                    className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                                        !inputValue.trim() 
                                        ? 'text-zinc-300 dark:text-zinc-600 bg-transparent' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                    }`}
                                >
                                    <Send size={18} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                                </button>
                            </div>
                            <div className="max-w-4xl mx-auto mt-2 text-center text-[10px] text-zinc-400">
                                <strong>Return</strong> to send, <strong>Shift + Return</strong> for new line. Supports Markdown.
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30 dark:bg-zinc-900/10">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-400">
                            <MessageSquare size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Select a Hub</h2>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            Choose a community from the sidebar or discover new ones to start collaborating.
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-sm text-center border border-zinc-200 dark:border-zinc-800">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <LogOut size={24} />
                        </div>
                        <h2 className="text-lg font-bold dark:text-white mb-2">Leave {chatDetails?.group?.name}?</h2>
                        <p className="text-zinc-500 text-sm mb-6">You will need an invitation link to rejoin this group later.</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                            <button onClick={handleLeaveGroup} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">Leave Hub</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;