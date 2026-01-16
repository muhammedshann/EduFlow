import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Zap, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FetchDetailNote } from "../../Redux/LiveTranscriptionSlice";
import { ClearChatBot, FetchChatBot } from "../../Redux/ChatBotSlice";
import { FetchCredit } from "../../Redux/SubscriptionSlice";

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
            // CORRECTED: Map your specific data structure {question, answer} to {role, text}
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
        const credit = dispatch(FetchCredit())
    }, [messages])
    useEffect(() => {
        socket.current = new WebSocket("ws://localhost:8000/ws/chat-bot/");

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setIsLoading(false);
            console.log(data);


            // 1. CHECK FOR LIMIT REACHED TYPE
            if (data.type === "limit_reached") {
                setShowLimitModal(true);
                // Remove the "user" message that was just added since it wasn't processed
                setMessages(prev => prev.slice(0, -1));
                return;
            }

            const incomingText = data.reply ? data.reply : "";
            // ... rest of your incoming text logic
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

        if (!input.trim()) return;

        if (noteId && !noteContent) {
            alert("Note is still loading, please wait...");
            return;
        }

        setIsLoading(true);

        setMessages((prev) => [
            ...prev,
            { role: "user", text: input }
        ]);

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
            setMessages([])
            const result = await dispatch(ClearChatBot()).unwrap();
        } catch (err) {
            console.error("Fetch chat bot chat Error:", err);
        }
    }

    // UI REMAINS EXACTLY THE SAME AS PER YOUR REQUEST
    return (
        <div className="flex flex-col h-[calc(100vh-48px)] w-[calc(100%+48px)] -m-6 bg-gradient-to-b from-[#D1E4FF] to-[#F0F7FF] relative overflow-hidden">
            <header className="bg-white/90 backdrop-blur-md px-10 py-5 border-b border-blue-100 z-20 flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">AI Assistant</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Chat with our intelligent AI</p>
                {noteTitle && (
                    <div className="mt-3 px-4 py-2 rounded-xl bg-blue-100 text-blue-800 text-sm font-medium flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <span>📄 Using note:</span>
                            <span className="font-semibold">{noteTitle}</span>
                        </div>

                        <button
                            onClick={() => {navigate('/chat-bot/') }}
                            className="p-1 hover:bg-blue-200 rounded-full transition-colors duration-200"
                            aria-label="Remove note"
                        >
                            <X size={16} className="text-blue-600" />
                        </button>
                    </div>
                )}
                {messages.length > 0 && (
                    <button onClick={() => setShowClearConfirm(true)} className="mt-2 text-sm text-blue-600 hover:underline">
                        Clear chat
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto px-6 md:px-20 py-8 pb-32 space-y-6 scrollbar-hide scroll-smooth">
                {messages.map((m, i) => (
                    <div key={i} className={`flex items-start gap-3 animate-in fade-in duration-300 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        {m.role === "bot" && (
                            <div className="w-8 h-8 rounded-full bg-[#8A98F2] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-sm">AI</div>
                        )}
                        <div className={`max-w-[85%] px-5 py-2.5 rounded-[22px] text-[14.5px] shadow-sm ${m.role === "user" ? "bg-[#8A98F2] text-white rounded-tr-none" : "bg-[#BBD6FF] text-slate-800 rounded-tl-none"}`}>
                            <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert text-white" : "text-slate-800"}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                            </div>
                        </div>
                        {m.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-[#E589F2] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-sm">U</div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8A98F2] flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                        <div className="flex gap-1 px-3 py-2 bg-[#BBD6FF]/40 rounded-2xl">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-[#F0F7FF] via-[#F0F7FF]/90 to-transparent z-10 pointer-events-none">
                <form onSubmit={sendMessage} className="w-full max-w-4xl mx-auto flex items-center gap-3 pointer-events-auto">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={noteTitle ? "Ask something about this note..." : "Type your message..."}
                            disabled={isLoading}
                            className="w-full bg-white/95 border border-white rounded-full px-8 py-4 text-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                    </div>
                    <button type="submit" disabled={isLoading || !input.trim()} className="w-14 h-14 bg-[#B7B3FF] hover:bg-[#A59FFF] text-white rounded-[20px] flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </form>
            </div>
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Clear Chats?
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to clear this chats?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    HandleClearChat();
                                    setShowClearConfirm(false);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showLimitModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl scale-in-center">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="text-purple-600 fill-purple-600" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Daily Limit Reached</h2>
                        <p className="text-slate-500 font-medium mb-8">
                            You've used your 5 free daily messages. Upgrade your account or buy credits to keep chatting!
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/subscription-plans/')}
                                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all active:scale-[0.98]"
                            >
                                Get More Credits
                            </button>
                            <button
                                onClick={() => setShowLimitModal(false)}
                                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}