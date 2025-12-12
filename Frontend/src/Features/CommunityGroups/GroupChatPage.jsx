import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Users, MoreVertical, User, LogOut, X, Globe, Lock, Link } from "lucide-react";
import { fetchGroupDetails, LeaveGroup } from "../../Redux/GroupsSlice";
import { useDispatch } from "react-redux";

// Helper to format the time
const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// --- Component: MessageBubble ---
const MessageBubble = ({ message }) => {
    const isCurrentUser = message.isCurrentUser;

    // Determine bubble style
    const bubbleClasses = isCurrentUser
        ? 'bg-purple-600 text-white rounded-xl rounded-tr-none shadow-md'
        : 'bg-white text-gray-800 rounded-xl rounded-tl-none shadow-sm border border-gray-100';

    // Determine avatar style (Approximating the screenshot's color scheme)
    const avatarClasses = isCurrentUser
        ? 'bg-purple-100 text-purple-700'
        : 'bg-pink-100 text-pink-700';

    const layoutClasses = isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row';
    const contentAlignClasses = isCurrentUser ? 'items-end' : 'items-start';

    return (
        <div className={`flex w-full px-4 mb-4 ${layoutClasses}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarClasses}`}>
                <User className="h-4 w-4" />
            </div>

            {/* Message Content */}
            <div className={`flex flex-col max-w-xs lg:max-w-md mx-2 ${contentAlignClasses}`}>
                {/* Sender Name and Time */}
                {/* Note: In the screenshot, the sender name is only present for the incoming message */}
                <p className={`text-xs font-medium mb-1 ${isCurrentUser ? 'text-gray-500' : 'text-gray-800'}`}>
                    {/* Display sender name for others, time for others */}
                    {!isCurrentUser && (
                        <>
                            <span>{message.sender}</span>
                            <span className="ml-1 text-gray-400">{formatTime(message.timestamp)}</span>
                        </>
                    )}
                </p>

                {/* Bubble */}
                <div className={`px-4 py-2 ${bubbleClasses}`}>
                    <p className="text-sm">{message.content}</p>
                    {/* Display time inside bubble for current user (as shown in the screenshot's style) */}
                    {isCurrentUser && (
                        <p className="text-xs text-white opacity-75 mt-1 text-right">
                            {formatTime(message.timestamp)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const GroupInfoModal = ({ open, onClose, group, users_count }) => {
    if (!open || !group) return null;
    const [copied, setCopied] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-gray-800">Group Info</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-purple-600">
                        <X size={22} />
                    </button>
                </div>

                {/* Group Header */}
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

                {/* Description */}
                <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {group.description || "No description added."}
                    </p>
                </div>

                {/* Privacy */}
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


                {/* User Count */}
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


// --- MAIN COMPONENT ---
export default function GroupChat() {
    const { groupId } = useParams();
    const messagesEndRef = useRef(null);
    const [group, setGroup] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    // const [selectedGroup, setSelectedGroup] = useState(null);
    const dispatch = useDispatch();

    const [messages, setMessages] = useState([]);

    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetch = async () => {
        try {
            const result = await dispatch(fetchGroupDetails(groupId)).unwrap()
            await setGroupName(result.group.name)
            await setTotalUsers(result.users_count)
            await setGroup(result.group)
            await setMessages(result.group_messages)
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetch()
    }, [groupId])

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

            // setMessages(prev => [...prev, aiMessage]);
    };

    // Note: Removed type annotation for React.KeyboardEvent
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleLeaveGroup = async () => {
        try {
            dispatch(LeaveGroup(groupId))
            navigate('/groups/')
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 antialiased">

            {/* Header */}
            <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-10">
                <div className="flex items-center justify-between p-4">

                    {/* LEFT SIDE: Back + Group Info */}
                    <div className="flex items-center space-x-4">

                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/groups/')}
                            className="p-2 text-gray-500 hover:text-purple-600 rounded-full transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        {/* Group Icon + Name */}
                        <div className="flex items-center space-x-3"
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
                                    {/* • <span className="text-green-600">12 online</span> */}
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
                                    You will no longer receive updates or messages.
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


            {/* Chat Messages Container */}
            <main className="flex-1 overflow-y-auto p-4 px-15 space-y-4">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area and Footer */}
            <footer className="bg-white border-t pb-10 px-8 border-gray-100 flex-shrink-0 w-full">

                {/* Input Area */}
                <div className="p-4">
                    <div className="flex space-x-3">
                        {/* Input Field */}
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${groupName}...`}
                            className="flex-1 px-4 py-3 border border-gray-300 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow text-gray-700"
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className={`p-3 rounded-full transition-colors shadow-md ${!inputValue.trim()
                                ? 'bg-purple-300 text-white cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
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