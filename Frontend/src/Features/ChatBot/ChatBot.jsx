import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Zap, X, Sparkles, Info } from "lucide-react";
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
            console.log(data, " : chat bot mesasage");
            

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
        <div className="w-full h-full relative">
            
            {/* Header */}
            <header className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between flex-shrink-0 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Sparkles className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">AI Assistant</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">EduFlow AI</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {noteTitle && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                            <Info size={14} className="hidden sm:block" />
                            <span className="max-w-[100px] md:max-w-[200px] truncate">{noteTitle}</span>
                            <button onClick={() => navigate('/chat-bot/')} className="hover:text-rose-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {messages.length > 0 && (
                        <button 
                            onClick={() => setShowClearConfirm(true)} 
                            className="text-[10px] md:text-xs font-black text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 uppercase tracking-widest transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </header>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-40 scrollbar-hide">
                <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 mt-6">
                    
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-6">
                                <Zap className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">How can I help you?</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                                You have <span className="text-indigo-600 dark:text-indigo-400 font-black">5 free daily messages</span> to assist with your learning journey.
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-3`}>
                            <div className={`px-5 md:px-6 py-3 md:py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm border transition-all duration-300 ${
                                m.role === "user" 
                                ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none" 
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-bl-none"
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
                            <div className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Floating Input Box */}
            <div className="absolute bottom-6 md:bottom-10 left-0 right-0 px-4 md:px-8 z-20 pointer-events-none">
                <form 
                    onSubmit={sendMessage} 
                    className="max-w-3xl mx-auto flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-2 shadow-2xl shadow-indigo-100 dark:shadow-slate-950 pointer-events-auto transition-all focus-within:border-indigo-400 dark:focus-within:border-indigo-500"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={noteTitle ? "Ask about this note..." : "Ask EduFlow anything..."}
                        disabled={isLoading}
                        className="flex-1 bg-transparent px-4 md:px-6 py-3 text-slate-800 dark:text-slate-100 text-sm md:text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-30 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
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
                message="This will permanently delete all messages from this conversation."
            />

            {showLimitModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 w-full max-w-sm text-center shadow-2xl border border-white/10">
                        <div className="w-16 md:w-20 h-16 md:h-20 bg-indigo-50 dark:bg-indigo-950 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Zap className="text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Daily Limit Hit</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed text-sm">
                            You've used your 5 free messages. Upgrade to Pro for unlimited AI-powered learning!
                        </p>
                        <button onClick={() => navigate('/subscription-plans/')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95">
                            Upgrade Now
                        </button>
                        <button onClick={() => setShowLimitModal(false)} className="mt-4 text-slate-400 dark:text-slate-500 text-sm font-bold hover:text-slate-600 transition-colors">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}