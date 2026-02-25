import React, { useEffect, useState, useRef } from "react";
import { 
    Search, Users, Plus, Inbox, X, ChevronRight, LayoutGrid, 
    MessageSquare, Send, ArrowLeft, MoreVertical, LogOut, 
    Globe, Lock, Link as LinkIcon, Image as ImageIcon, Loader2 
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- THEME & UTILS ---
const PRIMARY_GRADIENT = "bg-gradient-to-tr from-indigo-600 to-purple-600 hover:shadow-indigo-500/20";
const SOFT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";

const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// --- SUB-COMPONENTS ---

// 1. Message Bubble
const MessageBubble = ({ message, onImageClick }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex w-full px-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                {message.profile_pic ? (
                    <img src={message.profile_pic} alt="p" className="w-full h-full object-cover" />
                ) : (
                    <Users size={14} className="text-slate-400" />
                )}
            </div>
            
            <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                {!isCurrentUser && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 uppercase tracking-tight">
                        {message.sender}
                    </span>
                )}
                <div className={`relative px-4 py-2.5 shadow-sm transition-all duration-300 ${
                    isCurrentUser 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700'
                }`}>
                    {message.image && (
                        <div className="mb-2 overflow-hidden rounded-lg cursor-zoom-in" onClick={() => onImageClick(message.image)}>
                            <img src={message.image} alt="sent" className="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                    )}
                    {message.content && (
                        <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${isCurrentUser ? 'prose-invert' : 'dark:prose-invert'}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                    )}
                    <div className={`text-[10px] mt-1 flex justify-end ${isCurrentUser ? 'text-indigo-100/70' : 'text-slate-400'}`}>
                        {formatTime(message.timestamp)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Create Group Modal
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-6 border border-white dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black dark:text-white">New Community</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Group Name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <textarea placeholder="Description" rows={3} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <button type="submit" className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform ${PRIMARY_GRADIENT}`}>Create Group</button>
                </form>
            </div>
        </div>
    );
};

// 3. Group Info Modal
const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    if (!open || !group) return null;
    const [copied, setCopied] = useState(false);
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-white dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black dark:text-white">Details</h2>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl mb-4"><Users size={32} /></div>
                    <h3 className="text-2xl font-bold dark:text-white leading-tight">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.type}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl"><p className="text-sm text-slate-600 dark:text-slate-300">{group.description || "No description provided."}</p></div>
                    <button className="w-full flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50" onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                        <LinkIcon size={18} className="text-indigo-600" />
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold truncate flex-1 text-left">{copied ? "COPIED!" : "COPY LINK"}</span>
                    </button>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Members</span>
                        <div className="flex items-center gap-2"><Users size={14} className="text-indigo-600" /><span className="text-sm font-black dark:text-white">{users_count}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Image Preview Modal
const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={onClose}><X size={32} /></button>
            <img src={image} alt="preview" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const GroupsPage = () => {
    // Left Pane State (List)
    const [allData, setAllData] = useState({ created: [], joined: [], public: [] });
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);

    // Right Pane State (Chat)
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [socket, setSocket] = useState(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    // Chat UI State
    const [showInfo, setShowInfo] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const messagesEndRef = useRef(null);
    
    const dispatch = useDispatch();
    const { user } = useUser();

    // 1. Fetch Group List
    const fetchList = async () => {
        try {
            const res = await dispatch(FetchGroup()).unwrap();
            setAllData({ created: res.created_groups, joined: res.joined_groups, public: res.public_groups });
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // 2. Select Group & Load Chat
    const handleSelectGroup = async (id) => {
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

            const ws = new WebSocket(`wss://api.fresheasy.online/ws/chat/${id}/`);
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

    // 3. Send Message
    const sendMessage = () => {
        if (!inputValue.trim() || !socket) return;
        socket.send(JSON.stringify({ message: inputValue, username: user.username }));
        setInputValue("");
    };

    // 4. Send Image
    const handleImageUpload = async (file) => {
        if (!file || !selectedGroupId) return;
        const formData = new FormData();
        formData.append("group_id", selectedGroupId);
        formData.append("image", file);
        try { await api.post("/groups/send-image/", formData); } 
        catch (err) { console.error(err); }
    };

    // 5. Create Group
    const handleCreateGroup = async (data) => {
        try {
            await dispatch(CreateGroup(data)).unwrap();
            await fetchList();
            setOpenCreateModal(false);
        } catch (err) { console.error(err); }
    };

    // 6. Leave Group
    const handleLeaveGroup = async () => {
        try {
            await dispatch(LeaveGroup(selectedGroupId)).unwrap();
            setShowLeaveConfirm(false);
            setSelectedGroupId(null);
            fetchList();
        } catch (err) { console.error(err); }
    };

    // Filter Logic
    const filterFn = (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const displayList = activeTab === "Discover" ? allData.public.filter(filterFn) : 
                        activeTab === "Created" ? allData.created.filter(filterFn) : 
                        activeTab === "Joined" ? allData.joined.filter(filterFn) : 
                        [...allData.joined, ...allData.created].filter(filterFn);

    return (
        <div className={`flex h-screen overflow-hidden ${SOFT_BG} font-sans`}>
            
            {/* --- LEFT SIDEBAR (List) --- */}
            {/* Hidden on mobile if chat is open, Visible on lg always */}
            <div className={`w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900 z-20 transition-all ${selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                
                {/* Sidebar Header */}
                <div className="p-5 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight dark:text-white">Communities</h1>
                            <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-widest mt-1">EduFlow Network</p>
                        </div>
                        <button onClick={() => setOpenCreateModal(true)} className={`p-3 text-white rounded-2xl shadow-lg active:scale-95 transition-transform ${PRIMARY_GRADIENT}`}>
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="relative group mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search groups..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
                        {["All", "Joined", "Created", "Discover"].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar List */}
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-40">
                            <LayoutGrid size={48} strokeWidth={1} />
                            <p className="mt-4 text-sm font-bold">No groups found.</p>
                        </div>
                    ) : (
                        displayList.map((group) => (
                            <div key={group.id} onClick={() => handleSelectGroup(group.id)} className={`flex items-center px-4 py-4 cursor-pointer transition-all border-b border-slate-50 dark:border-slate-900/50 ${selectedGroupId === group.id ? 'bg-indigo-50/60 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}>
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedGroupId === group.id ? 'bg-white text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}`}><Users size={22} /></div>
                                    {group.type === "private" && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white dark:border-slate-950 rounded-full" />}
                                </div>
                                <div className="ml-4 flex-grow overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-sm font-bold dark:text-white truncate">{group.name}</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">{group.type}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{group.description || "Join to start chatting"}</p>
                                </div>
                                <div className="ml-2 opacity-30"><ChevronRight size={16} /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- RIGHT PANE (Chat) --- */}
            {/* Full screen on mobile if selected, Visible on lg always */}
            <div className={`flex-grow flex flex-col relative bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm ${!selectedGroupId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedGroupId ? (
                    <>
                        {/* Chat Header */}
                        <header className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedGroupId(null)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-indigo-600"><ArrowLeft size={20} /></button>
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfo(true)}>
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none"><Users size={18} /></div>
                                    <div>
                                        <h2 className="text-sm font-black dark:text-white leading-none">{chatDetails?.group?.name || "Loading..."}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{chatDetails?.users_count} Members</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowLeaveConfirm(true)} className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"><LogOut size={12} /> Leave</button>
                                <button onClick={() => setShowInfo(true)} className="p-2 text-slate-400 hover:text-indigo-600"><MoreVertical size={20} /></button>
                            </div>
                        </header>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-hide">
                            {isChatLoading ? (
                                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                            ) : (
                                messages.map(msg => <MessageBubble key={msg.id} message={msg} onImageClick={setPreviewImage} />)
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="max-w-4xl mx-auto flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[24px] p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
                                <label className="cursor-pointer p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ImageIcon size={20} />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                                </label>
                                <input 
                                    type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder={`Message ${chatDetails?.group?.name || "..."}`}
                                    className="flex-1 bg-transparent px-2 text-slate-700 dark:text-slate-100 text-sm outline-none placeholder:text-slate-400"
                                />
                                <button onClick={sendMessage} disabled={!inputValue.trim()} className={`p-3 rounded-2xl transition-all shadow-md ${!inputValue.trim() ? "bg-slate-200 text-slate-400 dark:bg-slate-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}><Send size={18} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State (Desktop)
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800"><MessageSquare size={40} className="text-indigo-600" /></div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">EduFlow Hub</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Select a community from the sidebar to start collaborating, sharing ideas, and learning together.</p>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            <CreateGroupModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateGroup} />
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={chatDetails?.group} users_count={chatDetails?.users_count} />
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />

            {/* Leave Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center border border-white dark:border-slate-800">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500"><LogOut size={32} /></div>
                        <h2 className="text-xl font-black dark:text-white mb-2">Leave Group?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">You'll need a new invite to rejoin.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowLeaveConfirm(false)} className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                            <button onClick={handleLeaveGroup} className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsPage;