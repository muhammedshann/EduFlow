import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Zap, X, Sparkles, Info, Trash2 } from "lucide-react";
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
        socket.current = new WebSocket("wss://api.fresheasy.online/ws/chat-bot/");
        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setIsLoading(false);

            if (data.type === "limit_reached") {
                setShowLimitModal(true);
                setMessages(prev => prev.slice(0, -1));
                return;
            }

            const incomingText = data.reply || data.message || "";

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
            setShowClearConfirm(false);
        } catch (err) { console.error(err); }
    };

    return (
        /* FIXED: Added pb-32. This container now handles the bottom spacing. */
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-colors duration-300 relative overflow-hidden pb-32">
            
            {/* Chat Body Container */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 scrollbar-hide">
                <div className="w-full max-w-4xl mx-auto">
                    
                    {/* Top Floating Controls */}
                    <div className="flex items-center justify-between mb-8 sticky top-0 z-20">
                        {noteTitle ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-indigo-100 dark:border-slate-800 rounded-full text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                                <Info size={14} className="text-indigo-500" />
                                <span className="max-w-[150px] md:max-w-[300px] truncate uppercase tracking-wider">Context: {noteTitle}</span>
                                <button onClick={() => navigate('/chat-bot/')} className="ml-1 p-0.5 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : <div />}

                        {messages.length > 0 && (
                            <button 
                                onClick={() => setShowClearConfirm(true)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all uppercase tracking-widest"
                            >
                                <Trash2 size={12} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="space-y-6 md:space-y-8">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="w-16 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-xl border border-white/20 dark:border-slate-800 mb-6">
                                    <Zap className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">How can I help you?</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                                    Ask anything to assist your learning journey.
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-3`}>
                                <div className={`px-5 md:px-6 py-3 md:py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm border transition-all duration-300 ${
                                    m.role === "user" 
                                    ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none shadow-lg shadow-indigo-500/10" 
                                    : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-700 dark:text-slate-200 border-white/20 dark:border-slate-800 rounded-bl-none"
                                } max-w-[90%] md:max-w-[80%] min-w-[50px]`}>
                                    <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert text-white" : "dark:text-slate-200 dark:prose-invert prose-indigo"}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* FIXED: Input Form is now RELATIVE and inside the padding zone */}
            <div className="relative px-4 md:px-8 z-20 mt-4">
                <form 
                    onSubmit={sendMessage} 
                    className="max-w-3xl mx-auto flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-[28px] p-2 shadow-2xl transition-all focus-within:border-indigo-400"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={noteTitle ? "Ask about this note..." : "Ask EduFlow anything..."}
                        disabled={isLoading}
                        className="flex-1 bg-transparent px-4 md:px-6 py-3 text-slate-800 dark:text-slate-100 text-sm md:text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-30 shadow-lg"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                </form>
            </div>

            <DeleteConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={HandleClearChat}
                title="Clear History?"
                message="Permanently delete this conversation?"
            />
        </div>
    );
}