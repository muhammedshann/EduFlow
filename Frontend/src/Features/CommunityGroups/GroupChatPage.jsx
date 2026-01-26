import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Users, MoreVertical, User, LogOut, X, Globe, Lock, Link, Image, Loader2 } from "lucide-react";
import { fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useDispatch } from "react-redux";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" onClick={onClose}>
                <X size={32} />
            </button>
            <img src={image} alt="preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

const MessageBubble = ({ message }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const isCurrentUser = message.isCurrentUser;
    
    return (
        <div className={`flex w-full px-2 md:px-4 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                {message.profile_pic ? (
                    <img src={message.profile_pic} alt="profile" className="w-full h-full object-cover" />
                ) : (
                    <User className="h-4 w-4 text-slate-400" />
                )}
            </div>

            {/* Content Group */}
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
                        <div className="mb-2 overflow-hidden rounded-lg cursor-zoom-in">
                            <img src={message.image} alt="sent" className="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform duration-500" onClick={() => setPreviewImage(message.image)} />
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
            <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
        </div>
    );
};

const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    if (!open || !group) return null;
    const [copied, setCopied] = useState(false);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Group Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-4">
                        <Users size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        {group.type === "public" ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-rose-500" />}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group.type} COMMUNITY</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">About</label>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            {group.description || "No description provided."}
                        </p>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Share Link</label>
                        <button 
                            className="w-full flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all group"
                            onClick={() => {
                                navigator.clipboard.writeText(`http://localhost:5173/groups/chat/${group.id}/`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                            }}
                        >
                            <Link size={18} className="text-indigo-600" />
                            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold truncate flex-1 text-left">Click to copy invite link</span>
                            {copied && <span className="text-[10px] text-emerald-600 font-bold animate-pulse">COPIED!</span>}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Active Members</span>
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-indigo-600" />
                            <span className="text-sm font-black text-slate-800 dark:text-white">{users_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function GroupChat() {
    const { groupId } = useParams();
    const messagesEndRef = useRef(null);
    const [group, setGroup] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const { user } = useUser();

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchData = async () => {
        try {
            const result = await dispatch(fetchGroupDetails(groupId)).unwrap();
            setGroupName(result.group.name);
            setTotalUsers(result.users_count);
            setGroup(result.group);
            setMessages(
                result.group_messages.map(msg => ({
                    id: msg.id,
                    sender: msg.username,
                    profile_pic: msg.profile_pic,
                    image: msg.image,
                    content: msg.message,
                    timestamp: new Date(msg.created_at),
                    isCurrentUser: msg.username === user.username
                }))
            );
            setIsLoading(false);
            return true;
        } catch (err) {
            console.log(err);
            return false ;
        }
    };

    useEffect(() => {
        let ws = null;
        const setupChat = async () => {
            const success = await fetchData();
            if (success) {
                ws = new WebSocket(`ws://localhost:8000/ws/chat/${groupId}/`);
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setMessages(prev => [...prev, {
                        id: crypto.randomUUID(),
                        sender: data.username,
                        content: data.message,
                        image: data.image,
                        timestamp: new Date(),
                        isCurrentUser: data.username === user.username,
                    }]);
                };
                setSocket(ws);
            }
        };
        setupChat();
        return () => ws?.close();
    }, [groupId]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !socket) return;
        socket.send(JSON.stringify({
            message: inputValue,
            username: user.username,
        }));
        setInputValue("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await dispatch(LeaveGroup(groupId)).unwrap();
            navigate('/groups/');
        } catch (err) { console.log(err); }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("group_id", groupId);
        formData.append("image", file);
        try {
            await api.post("/groups/send-image/", formData);
        } catch (err) { console.error("Image upload failed:", err); }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            {/* Header - Fixed UI */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 w-full sticky top-0 z-40">
                <div className="flex items-center justify-between p-4 px-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/groups/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowInfo(true)}>
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Users size={18} />
                            </div>
                            <div>
                                <h1 className="text-md font-black text-slate-800 dark:text-white leading-none">
                                    {groupName || "Loading..."}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {totalUsers} Members
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowLeaveConfirm(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                            <LogOut size={14} /> Leave
                        </button>
                        <button onClick={() => setShowInfo(true)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Chat Area - FIX: Massive bottom padding to prevent overlap */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-56 space-y-2 scrollbar-hide">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                    </>
                )}
                {/* FIX: High spacer div ensures the last message stays above the floating box */}
                <div ref={messagesEndRef} className="h-24 w-full" />
            </main>

            {/* Floating Message Box - No footer div wrapper */}
            <div className="absolute bottom-6 md:bottom-10 left-0 right-0 px-4 md:px-8 z-40 pointer-events-none">
                <div className="max-w-4xl mx-auto flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-2 shadow-2xl pointer-events-auto transition-all focus-within:border-indigo-400">
                    <label className="cursor-pointer p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Image className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                    </label>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message ${groupName}...`}
                        className="flex-1 bg-transparent px-2 py-3 text-slate-700 dark:text-slate-100 text-sm md:text-base outline-none placeholder:text-slate-400"
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className={`p-4 rounded-2xl transition-all shadow-lg ${
                            !inputValue.trim()
                            ? "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Modals - (GroupInfoModal and LeaveConfirm remain the same) */}
            <GroupInfoModal open={showInfo} onClose={() => setShowInfo(false)} group={group} users_count={totalUsers} />
            
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center border border-white dark:border-slate-800">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                            <LogOut size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Leave Group?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">Are you sure you want to leave this community? You'll need a new invite link to rejoin.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowLeaveConfirm(false)} className="py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                            <button onClick={handleLeaveGroup} className="py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 dark:shadow-none transition-all">Leave</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}