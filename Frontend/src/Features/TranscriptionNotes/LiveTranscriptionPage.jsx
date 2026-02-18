import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mic,
    MicOff,
    Play,
    Square,
    MessageSquare,
    Edit3,
    Save,
    X,
    Upload,
    FileAudio,
    Type,
    Sparkles
} from "lucide-react";
import { useDispatch } from "react-redux";
import { SaveLiveNote, StartLiveTranscription, UploadTranscription } from "../../Redux/LiveTranscriptionSlice";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveTranscriptionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // UI State
    const [activeTab, setActiveTab] = useState("live");
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [noteSaved, setNoteSaved] = useState(false);
    const [noteId, setNoteId] = useState(false);
    const [showSaveNoteModal, SetShowSaveNoteModal] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");

    // File Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Transcription State
    const [transcript, setTranscript] = useState("");
    const [showTranscript, setShowTranscript] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState("");
    const [selectedFileId, SetSelectedFileId] = useState(null);

    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    // Cinematic Constants
    const SOFT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const CARD_BG = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl";
    const BORDER_COLOR = "border-slate-200 dark:border-slate-800";

    useEffect(() => {
        const socket = new WebSocket("wss://api.fresheasy.online/ws/live-transcribe/");
        socketRef.current = socket;
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (!data.text) return;
            setTranscript(data.text);
        };
        return () => socket.close();
    }, []);

    const getSupportedMimeType = () => {
        const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg;codecs=opus"];
        return types.find((t) => MediaRecorder.isTypeSupported(t)) || null;
    };

    const startRecording = async () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        await dispatch(StartLiveTranscription());
        setIsRecording(true);
        setIsListening(true);
        setShowTranscript(true);
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedMimeType();
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType });
        mediaRecorderRef.current.ondataavailable = async (event) => {
            if (event.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
                const buffer = await event.data.arrayBuffer();
                socketRef.current.send(buffer);
            }
        };
        mediaRecorderRef.current.start(1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        setIsListening(false);
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setNoteTitle(file.name.split('.')[0]);
        }
    };

    const pollForTranscript = (mediaId) => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/transcription-notes/media/${mediaId}/`);
                if (res.data.status === "done") {
                    setTranscript(res.data.transcript);
                    setShowTranscript(true);
                    setIsProcessing(false);
                    clearInterval(interval);
                }
            } catch (err) {
                setIsProcessing(false);
                clearInterval(interval);
            }
        }, 5000);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setShowTranscript(true);
        setTranscript("");
        const form = new FormData();
        form.append("file", selectedFile);
        try {
            const action = await dispatch(UploadTranscription(form));
            const mediaId = action.payload.id;
            SetSelectedFileId(mediaId);
            pollForTranscript(mediaId);
        } catch (err) {
            setIsProcessing(false);
        }
    };

    const HandleSaveNote = async () => {
        const payload = {
            type: activeTab === "live" ? "live" : "file",
            title: noteTitle,
            transcript_text: transcript,
        };
        if (activeTab === "upload" && selectedFileId) payload.upload_source = selectedFileId;
        const response = await dispatch(SaveLiveNote(payload));
        if (SaveLiveNote.fulfilled.match(response)) {
            setNoteId(response.payload.id);
            setNoteSaved(true);
        }
    };

    return (
        <div className={`min-h-screen ${SOFT_BG} px-4 py-10 transition-colors duration-300 pb-32`}>
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                        Smart Notes<span className="text-purple-600">.</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Convert speech and media into intelligent study material
                    </p>
                </div>

                {/* iOS Tab Switcher */}
                <div className="flex justify-center">
                    <div className="bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-[2rem] backdrop-blur-md border ${BORDER_COLOR} inline-flex shadow-xl">
                        <button
                            onClick={() => setActiveTab("live")}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === "live" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-indigo-600"}`}
                        >
                            <Mic size={16} /> Live Mode
                        </button>
                        <button
                            onClick={() => setActiveTab("file")}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === "file" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-indigo-600"}`}
                        >
                            <Upload size={16} /> Upload
                        </button>
                    </div>
                </div>

                {/* Main Action Area */}
                <motion.div layout className={`${CARD_BG} rounded-[3rem] border ${BORDER_COLOR} shadow-2xl p-12 text-center space-y-8 relative overflow-hidden`}>
                    {activeTab === "live" ? (
                        <div className="flex flex-col items-center">
                            <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? "bg-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.4)]" : "bg-purple-100 dark:bg-indigo-500/10"}`}>
                                {isRecording && (
                                    <motion.div 
                                        animate={{ scale: [1, 1.4, 1] }} 
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 rounded-full bg-rose-500/30"
                                    />
                                )}
                                {isRecording ? <MicOff className="w-16 h-16 text-white relative z-10" /> : <Mic className="w-16 h-16 text-purple-600 dark:text-indigo-400" />}
                            </div>
                            
                            <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-6 tracking-tight">
                                {isRecording ? "Listening..." : "Ready to Transcribe"}
                            </p>
                            
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`mt-8 inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95 ${isRecording ? "bg-rose-500 hover:bg-rose-600" : "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-indigo-500/20"}`}
                            >
                                {isRecording ? <><Square size={18} /> Stop Session</> : <><Play size={18} /> Start Live Note</>}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="mx-auto w-full max-w-lg border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-12 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group"
                            >
                                <input type="file" hidden ref={fileInputRef} accept="audio/*, video/*" onChange={handleFileChange} />
                                <div className="flex flex-col items-center gap-5">
                                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Upload size={36} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                                            {selectedFile ? selectedFile.name : "Choose Media"}
                                        </p>
                                        <p className="text-sm text-slate-400 font-medium mt-2">MP3, WAV, MP4 supported (Max 25MB)</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={!selectedFile || isProcessing}
                                onClick={handleFileUpload}
                                className={`inline-flex items-center gap-3 px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${selectedFile && !isProcessing ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
                            >
                                {isProcessing ? "Analyzing Audio..." : "Start Transcription"}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Transcript Area */}
                <AnimatePresence>
                    {showTranscript && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${CARD_BG} rounded-[2.5rem] border ${BORDER_COLOR} shadow-2xl p-8 space-y-6`}>
                            <div className="flex justify-between items-center px-2">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Transcript</h2>
                                {(isListening || isProcessing) && <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-widest animate-pulse"><Sparkles size={14}/> {isListening ? "Listening" : "Processing"}</div>}
                            </div>
                            
                            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[1.5rem] p-6 min-h-[160px] border ${BORDER_COLOR}">
                                {isEditing ? (
                                    <textarea
                                        value={editedTranscript}
                                        onChange={(e) => setEditedTranscript(e.target.value)}
                                        className="w-full h-40 p-4 bg-transparent outline-none dark:text-slate-200 font-medium resize-none"
                                    />
                                ) : (
                                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                                        {transcript || "Speak or upload a file to begin..."}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center gap-4">
                                {!isEditing ? (
                                    <>
                                        {noteSaved && (
                                            <button onClick={() => navigate(`/chat-bot/${noteId}`)} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                                                <MessageSquare size={16} /> AI Chat
                                            </button>
                                        )}
                                        <button onClick={() => { setEditedTranscript(transcript); setIsEditing(true); }} className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest border ${BORDER_COLOR} text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
                                            <Edit3 size={16} /> Edit
                                        </button>
                                        <button onClick={() => SetShowSaveNoteModal(true)} className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest border ${BORDER_COLOR} text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
                                            <Save size={16} /> Save Note
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setTranscript(editedTranscript); setIsEditing(false); }} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Save Changes</button>
                                        <button onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest border ${BORDER_COLOR} text-slate-400 active:scale-95 transition-all">Cancel</button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Features Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Universal", text: "MP3, WAV, MP4 & MKV", icon: <FileAudio size={20} /> },
                        { title: "Whisper AI", text: "High Accuracy conversion", icon: <Type size={20} /> },
                        { title: "Encrypted", text: "Your data is private", icon: <Save size={20} /> },
                    ].map((f, i) => (
                        <div key={i} className={`${CARD_BG} rounded-3xl p-8 text-center space-y-3 border ${BORDER_COLOR} hover:shadow-xl transition-all duration-500 group`}>
                            <div className="w-14 h-14 mx-auto bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                {f.icon}
                            </div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{f.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{f.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Note Modal */}
            <AnimatePresence>
                {showSaveNoteModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${CARD_BG} p-10 rounded-[3rem] border ${BORDER_COLOR} shadow-2xl w-full max-w-md`}>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Save Note</h2>
                            <p className="text-slate-400 font-medium mb-8 text-sm">Assign a title to your smart transcription.</p>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border ${BORDER_COLOR} outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white mb-8"
                                placeholder="e.g. Lecture on Neural Networks"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => SetShowSaveNoteModal(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Cancel</button>
                                <button disabled={!noteTitle.trim()} onClick={() => { HandleSaveNote(); SetShowSaveNoteModal(false); }} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg ${noteTitle.trim() ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-800 opacity-50"}`}>Confirm Save</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}