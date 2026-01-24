import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Zap, X, Sparkles, MessageSquare, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FetchDetailNote } from "../../Redux/LiveTranscriptionSlice";
import { ClearChatBot, FetchChatBot } from "../../Redux/ChatBotSlice";
import { FetchCredit } from "../../Redux/SubscriptionSlice";
import { DeleteConfirmModal } from "../../Components/ConfirmDelete";

export default function ChatPage() {
    const { noteId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");

    const socket = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const fetchData = async () => {
        try {
            const result = await dispatch(FetchChatBot()).unwrap();
            const formattedMessages = result.flatMap((msg) => [
                { role: "user", text: msg.question },
                { role: "bot", text: msg.answer },
            ]);
            setMessages(formattedMessages);
        } catch (err) {
            console.error("Fetch chat bot chat Error:", err);
        }
    };

    useEffect(() => {
        fetchData();
        if (!noteId) {
            setNoteTitle("");
            setNoteContent("");
            return;
        }

        dispatch(FetchDetailNote(noteId))
            .unwrap()
            .then((res) => {
                setNoteTitle(res.title);
                setNoteContent(res.transcript_text);
            })
            .catch(() => {
                setNoteTitle("");
                setNoteContent("");
            });
    }, [noteId, dispatch]);

    useEffect(() => {
        dispatch(FetchCredit());
    }, [messages, dispatch]);

    useEffect(() => {
        socket.current = new WebSocket("ws://localhost:8000/ws/chat-bot/");
        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setIsLoading(false);

            if (data.type === "limit_reached") {
                setShowLimitModal(true);
                setMessages(prev => prev.slice(0, -1));
                return;
            }

            const incomingText = data.reply || "";
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "bot") {
                    return [...prev.slice(0, -1), { role: "bot", text: last.text + incomingText }];
                }
                return [...prev, { role: "bot", text: incomingText }];
            });
        };
        return () => socket.current?.close();
    }, []);

    const sendMessage = (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;
        if (noteId && !noteContent) return;

        setIsLoading(true);
        setMessages((prev) => [...prev, { role: "user", text: input }]);

        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(
                JSON.stringify({
                    message: input,
                    context: noteContent,
                    note_title: noteTitle
                })
            );
        }
        setInput("");
    };

    const HandleClearChat = async () => {
        try {
            setMessages([]);
            await dispatch(ClearChatBot()).unwrap();
            setShowClearConfirm(false)
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] relative">
            
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-indigo-600 w-6 h-6" />
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Assistant</h1>
                </div>

                <div className="flex items-center gap-4">
                    {noteTitle && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 shadow-sm">
                            <Info size={14} />
                            <span className="max-w-[200px] truncate">{noteTitle}</span>
                            <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => navigate('/chat-bot/')} />
                        </div>
                    )}
                    {messages.length > 0 && (
                        <button onClick={() => setShowClearConfirm(true)} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                            Clear Chat
                        </button>
                    )}
                </div>
            </header>

            {/* Chat Body - Wider Width */}
            <div className="flex-1 overflow-y-auto px-8 pb-32 scrollbar-hide">
                <div className="w-full max-w-5xl mx-auto space-y-6">
                    
                    {/* Welcome State with missing sentence restored */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                                <Zap className="text-indigo-600 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you?</h2>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                                You have <span className="text-indigo-600 font-bold">5 free daily messages</span> to get help with your notes or any questions.
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-3`}>
                            <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm border ${
                                m.role === "user" 
                                ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none" 
                                : "bg-white text-slate-700 border-slate-200 rounded-bl-none"
                            } max-w-[85%] min-w-[50px]`}>
                                <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert text-white" : "text-slate-800"}`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {m.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-6 py-4 bg-white border border-slate-200 rounded-3xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Floating Input Box - No white background div */}
            <div className="absolute bottom-10 left-0 right-0 px-8 z-20 pointer-events-none">
                <form 
                    onSubmit={sendMessage} 
                    className="max-w-4xl mx-auto flex items-center bg-white border border-slate-200 rounded-[24px] p-2 shadow-2xl shadow-slate-300/50 pointer-events-auto transition-all focus-within:border-indigo-400"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        className="flex-1 bg-transparent px-5 py-3 text-slate-800 text-base outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 shadow-lg shadow-indigo-100"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>

            {/* Modals - Same logic, updated design */}
                <DeleteConfirmModal
                    isOpen={showClearConfirm}
                    onClose={() => setShowClearConfirm(false)}
                    onConfirm={HandleClearChat}
                    title="Clear History?"
                    message={`This action cannot be undone.`}
                />
                {/* <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-xs text-center">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Clear History?</h2>
                        <p className="text-slate-500 text-sm mb-6 font-medium">This action cannot be undone.</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => { HandleClearChat(); setShowClearConfirm(false); }} className="w-full py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all">Clear Chat</button>
                            <button onClick={() => setShowClearConfirm(false)} className="w-full py-3 text-slate-400 font-bold">Cancel</button>
                        </div>
                    </div>
                </div> */}

            {showLimitModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Zap className="text-indigo-600 fill-indigo-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-3">Daily Limit Hit</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            You've used your 5 free daily messages. Upgrade your plan to unlock unlimited learning!
                        </p>
                        <button onClick={() => navigate('/subscription-plans/')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                            Upgrade Now
                        </button>
                        <button onClick={() => setShowLimitModal(false)} className="mt-4 text-slate-400 text-sm font-bold">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}