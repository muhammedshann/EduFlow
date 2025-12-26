import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Users, MoreVertical, User, LogOut, X, Globe, Lock, Link, Image } from "lucide-react";
import { fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useDispatch } from "react-redux";
import { useUser } from "../../Context/UserContext";
import api from "../../api/axios";

// ----------------------------------------------------
// SAFE time formatting
// ----------------------------------------------------
const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ----------------------------------------------------
// Message Bubble UI (UNCHANGED)
// ----------------------------------------------------

const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 text-white text-3xl font-bold"
                onClick={onClose}
            >
                ✕
            </button>

            <img
                src={image}
                alt="preview"
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};


const MessageBubble = ({ message }) => {
    const [previewImage,setPreviewImage] = useState(false);
    const isCurrentUser = message.isCurrentUser;

    const bubbleClasses = isCurrentUser
        ? 'bg-purple-600 text-white rounded-xl rounded-tr-none shadow-md'
        : 'bg-white text-gray-800 rounded-xl rounded-tl-none shadow-sm border border-gray-100';

    const avatarClasses = isCurrentUser
        ? 'bg-purple-100 text-purple-700'
        : 'bg-pink-100 text-pink-700';

    const layoutClasses = isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row';
    const contentAlignClasses = isCurrentUser ? 'items-end' : 'items-start';

    return (
        <div className={`flex w-full px-4 mb-4 ${layoutClasses}`}>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {message.profile_pic ? (
                    <img
                        src={message.profile_pic}
                        alt="profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={`${avatarClasses} w-full h-full flex items-center justify-center`}>
                        <User className="h-4 w-4" />
                    </div>
                )}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col mx-2 ${contentAlignClasses}`}>

                {/* Sender + Time */}
                {!isCurrentUser && (
                    <p className="text-xs font-medium mb-1 text-gray-800">
                        <span>{message.sender}</span>
                        <span className="ml-1 text-gray-400">
                            {formatTime(message.timestamp)}
                        </span>
                    </p>
                )}

                {/* IMAGE BLOCK (NOT constrained by text width) */}
                {message.image && (
                    <div className="max-w-[320px]">
                        <img
                            src={message.image}
                            alt="sent"
                            className="rounded-lg w-full h-auto object-contain"
                            onClick={() => setPreviewImage(message.image)}
                        />

                    </div>
                )}

                {/* TEXT BUBBLE */}
                {message.content && (
                    <div className={`px-4 py-2 mt-1 ${bubbleClasses}`}>
                        <p className="text-sm">{message.content}</p>

                        {isCurrentUser && (
                            <p className="text-xs text-white opacity-75 mt-1 text-right">
                                {formatTime(message.timestamp)}
                            </p>
                        )}
                    </div>
                )}

                {/* Time for image-only messages (current user) */}
                {isCurrentUser && message.image && !message.content && (
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {formatTime(message.timestamp)}
                    </p>
                )}
            </div>
            <ImagePreviewModal
                image={previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
};


// ----------------------------------------------------
// Group Info Modal (UNCHANGED)
// ----------------------------------------------------
const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    if (!open || !group) return null;
    const [copied, setCopied] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 animate-fadeIn">
                {/* UI unchanged */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-gray-800">Group Info</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-purple-600">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500">
                            {group.type === "public" ? "Public Group" : "Private Group"}
                        </p>
                    </div>
                </div>

                <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {group.description || "No description added."}
                    </p>
                </div>

                <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Privacy</h4>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        {group.type === "public" ? (
                            <Globe className="w-5 h-5 text-green-600" />
                        ) : (
                            <Lock className="w-5 h-5 text-red-600" />
                        )}
                        <p className="text-gray-600 text-sm">
                            {group.type === "public"
                                ? "Anyone can join this group"
                                : "Only invited users can join"}
                        </p>
                    </div>
                </div>

                <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Invite via Link</h4>

                    <div
                        className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg cursor-pointer select-none"
                        onClick={() => {
                            navigator.clipboard.writeText(`http://localhost:5173/groups/chat/${group.id}/`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        }}
                    >
                        <Link className="w-5 h-5 text-green-600" />
                        <p className="text-gray-600 text-sm break-all">
                            {`http://localhost:5173/groups/chat/${group.id}/`}
                        </p>
                    </div>

                    {copied && (
                        <p className="text-green-600 text-xs mt-1 ml-2">Copied ✔</p>
                    )}
                </div>

                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Members</h4>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-gray-700 text-sm">
                            {users_count} members
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ----------------------------------------------------
// MAIN COMPONENT (FIXED LOGIC ONLY)
// ----------------------------------------------------
export default function GroupChat() {

    const { groupId } = useParams();
    const messagesEndRef = useRef(null);
    const [group, setGroup] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [socket, setSocket] = useState(null);
    const dispatch = useDispatch();
    const { user } = useUser();

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetch = async () => {
        try {
            const result = await dispatch(fetchGroupDetails(groupId)).unwrap();
            console.log(result);

            setGroupName(result.group.name);
            setTotalUsers(result.users_count);
            setGroup(result.group);

            // FIXED: Normalize serializer fields properly
            setMessages(
                result.group_messages.map(msg => ({
                    id: msg.id,
                    sender: msg.username,
                    profile_pic: msg.profile_pic,
                    image: msg.image,
                    content: msg.message,
                    timestamp: new Date(msg.created_at),
                    isCurrentUser: msg.username === user.username   // <-- FIXED
                }))
            );

        } catch (err) {
            console.log(err);
        }
    };


    useEffect(() => {

        fetch(); // Load messages FIRST

        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${groupId}/`);
        ws.withCredentials = true;

        console.log("WebSocket:", ws);
        setSocket(ws);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            const formattedMessage = {
                id: crypto.randomUUID(),
                sender: data.username,
                content: data.message,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                isCurrentUser: data.username === user.username,
            };

            setMessages(prev => [...prev, formattedMessage]);
        };

        ws.onclose = () => console.log("WebSocket closed");

        return () => ws.close();
    }, [groupId]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const messageData = {
            message: inputValue,
            username: user.username,
        };

        socket.send(JSON.stringify(messageData));
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
            dispatch(LeaveGroup(groupId));
            navigate('/groups/');
        } catch (err) {
            console.log(err);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("group_id", groupId);
        formData.append("image", file);

        try {
            await api.post("/groups/send-image/", formData);
        } catch (err) {
            console.error("Image upload failed:", err);
        }
    };



    // ---------------------------------------------------------
    // UI Section (UNCHANGED)
    // ---------------------------------------------------------
    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 antialiased">

            {/* Header */}
            <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-10">
                <div className="flex items-center justify-between p-4">

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/groups/')}
                            className="p-2 text-gray-500 hover:text-purple-600 rounded-full transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div
                            className="flex items-center space-x-3"
                            onClick={() => setShowInfo(true)}
                        >
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                                <Users className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {groupName}
                                </h1>
                                <p className="text-xs text-gray-500">
                                    {totalUsers} members
                                </p>
                            </div>
                        </div>

                        <GroupInfoModal
                            open={showInfo}
                            onClose={() => setShowInfo(false)}
                            group={group}
                            users_count={totalUsers}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Leave Group
                        </button>

                        <button className="p-2 text-gray-500 hover:text-purple-600 rounded-full transition">
                            <MoreVertical className="h-5 w-5" onClick={() => setShowInfo(true)} />
                        </button>
                    </div>

                    {showLeaveConfirm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Leave Group?
                                </h2>
                                <p className="text-gray-600 text-sm mb-6">
                                    Are you sure you want to leave this group?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowLeaveConfirm(false)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleLeaveGroup();
                                            setShowLeaveConfirm(false);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Leave
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 px-15 space-y-4">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="bg-white border-t pb-10 px-8 border-gray-100 flex-shrink-0 w-full">
                <div className="p-4">

                    <div className="flex items-center space-x-3">

                        {/* LEFT: Image Upload Button */}
                        <label className="cursor-pointer flex items-center">
                            <Image className="w-6 h-6 text-purple-600 hover:text-purple-700" />

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                        handleImageUpload(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>

                        {/* CENTER: Input Field */}
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${groupName}...`}
                            className="flex-1 px-4 py-3 border border-gray-300 bg-gray-50 rounded-full 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow 
                           text-gray-700"
                        />

                        {/* RIGHT: Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className={`p-3 rounded-full transition-colors shadow-md ${!inputValue.trim()
                                ? "bg-purple-300 text-white cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>

                </div>
            </footer>

        </div>
    );
}
