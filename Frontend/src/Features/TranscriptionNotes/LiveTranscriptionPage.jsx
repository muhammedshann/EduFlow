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
    Type
} from "lucide-react";
import { useDispatch } from "react-redux";
import { SaveLiveNote, StartLiveTranscription, UploadTranscription } from "../../Redux/LiveTranscriptionSlice";
import api from "../../api/axios";
import { useTheme } from "../../Context/ThemeContext";

export default function LiveTranscriptionPage() {
    const { isDarkMode } = useTheme(); 
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

    // Theme Constants
    const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl";
    const INPUT_BG = "bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700";

    useEffect(() => {
        const socket = new WebSocket("wss://api.fresheasy.online/ws/live-transcribe/");
        socketRef.current = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (!data.text) return;
            setTranscript(data.text);
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        return () => socket.close();
    }, []);

    const getSupportedMimeType = () => {
        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4", 
            "audio/aac", 
            "audio/ogg;codecs=opus",
        ];
        return types.find((t) => MediaRecorder.isTypeSupported(t)) || null;
    };

    const startRecording = async () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("WebSocket not connected yet.");
            return;
        }
        await dispatch(StartLiveTranscription());
        setIsRecording(true);
        setIsListening(true);
        setShowTranscript(true);

        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedMimeType();
        if (!mimeType) {
            alert("Audio recording not supported in this browser.");
            return;
        }

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
                const data = res.data;
                console.log(data);

                if (data.status === "done") {
                    setTranscript(data.transcript);
                    setShowTranscript(true);
                    setIsProcessing(false);
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
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
            const mediaId = action.payload.id
            SetSelectedFileId(mediaId)
            pollForTranscript(mediaId);
        } catch (err) {
            console.error(err);
            setIsProcessing(false);
        }
    };

    const handleChat = () => {
        navigate(`/chat-bot/${noteId}`);
    };

    const saveEdits = () => {
        setTranscript(editedTranscript);
        setIsEditing(false);
    };

    const HandleSaveNote = async () => {
        const payload = {
            type: activeTab === "live" ? "live" : "file",
            title: noteTitle,
            transcript_text: transcript,
        };

        if (activeTab === "upload" && selectedFileId) {
            payload.upload_source = selectedFileId;
        }

        const response = await dispatch(SaveLiveNote(payload));

        if (SaveLiveNote.fulfilled.match(response)) {
            setNoteId(response.payload.id);
            setNoteSaved(true);
        } else {
            alert(response.payload?.error || "Failed to save note");
        }
    };

    return (
        <div className={`min-h-screen ${GRADIENT_BG} px-4 py-10 transition-colors duration-300 pb-32`}>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-purple-600 dark:text-purple-500 tracking-tight">
                        Smart Notes
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">
                        Convert your speech or audio, video files to text accurately
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center">
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 dark:border-slate-800 inline-flex transition-colors duration-300">
                        <button
                            onClick={() => setActiveTab("live")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "live" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"}`}
                        >
                            <Mic size={18} />
                            Live Mode
                        </button>
                        <button
                            onClick={() => setActiveTab("file")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "file" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"}`}
                        >
                            <Upload size={18} />
                            Upload File
                        </button>
                    </div>
                </div>

                {/* Save Note Modal */}
                {showSaveNoteModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex h-full items-center justify-center z-[100] p-4">
                        <div className={`${GLASS_CARD} p-8 rounded-[2rem] w-full max-w-md animate-fadeIn transition-colors duration-300`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Save Smart Note</h2>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Give your note a title to save it for later.</p>
                            <div className="mb-6">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">Note Title</label>
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="e.g. Physics – Newton’s Laws"
                                    className={`w-full px-4 py-3 rounded-xl ${INPUT_BG} dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all`}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => { SetShowSaveNoteModal(false); setNoteTitle(""); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!noteTitle.trim()}
                                    onClick={() => { HandleSaveNote(); SetShowSaveNoteModal(false); setNoteTitle(""); }}
                                    className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm transition shadow-lg ${noteTitle.trim() ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-gray-300 dark:bg-slate-800 cursor-not-allowed"}`}
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Action Area */}
                <div className={`${GLASS_CARD} rounded-[2.5rem] p-10 text-center space-y-8 transition-colors duration-300`}>
                    {activeTab === "live" ? (
                        <>
                            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? "bg-rose-500 animate-pulse shadow-[0_0_40px_rgba(244,63,94,0.5)]" : "bg-purple-50 dark:bg-slate-800/50 hover:bg-purple-100 dark:hover:bg-slate-800"}`}>
                                {isRecording ? <MicOff className="w-14 h-14 text-white" /> : <Mic className="w-14 h-14 text-purple-600 dark:text-purple-400" />}
                            </div>
                            <p className="text-lg font-bold text-gray-700 dark:text-slate-200">
                                {isRecording ? "Listening…" : isProcessing ? "Processing last audio…" : "Ready to record"}
                            </p>
                            {!isRecording ? (
                                <button onClick={startRecording} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:scale-105 transition shadow-lg shadow-purple-500/20 active:scale-95">
                                    <Play size={20} /> Start Live Note
                                </button>
                            ) : (
                                <button onClick={stopRecording} className="inline-flex items-center gap-2 bg-rose-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-500/20 active:scale-95">
                                    <Square size={18} /> Stop Recording
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="space-y-8">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="mx-auto w-full max-w-lg border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-10 hover:bg-purple-50/50 dark:hover:bg-slate-800/50 hover:border-purple-400 dark:hover:border-slate-600 transition cursor-pointer group"
                            >
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    accept="audio/*, video/*"
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-purple-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                        <Upload size={36} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-800 dark:text-slate-200">
                                            {selectedFile ? selectedFile.name : "Choose an audio file"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">
                                            Audio (MP3, WAV) or Video (MP4, MOV, MKV) supported (Max 25MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={!selectedFile || isProcessing}
                                onClick={handleFileUpload}
                                className={`inline-flex items-center gap-2 px-10 py-3.5 rounded-2xl font-bold transition ${selectedFile && !isProcessing ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 shadow-lg shadow-purple-500/20" : "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"}`}
                            >
                                {isProcessing ? "Processing..." : "Transcribe File"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Transcript Display */}
                {showTranscript && (
                    <div className={`${GLASS_CARD} rounded-[2rem] p-8 space-y-6 animate-fadeIn transition-colors duration-300`}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Transcript</h2>
                            {(isListening || isProcessing) && (
                                <span className="text-purple-600 dark:text-purple-400 text-sm animate-pulse font-bold uppercase tracking-wider">
                                    {isListening ? "• listening" : "• processing"}
                                </span>
                            )}
                        </div>
                        <div className={`${INPUT_BG} rounded-2xl p-6 min-h-[120px] transition-colors duration-300`}>
                            {isEditing ? (
                                <textarea
                                    value={editedTranscript}
                                    onChange={(e) => setEditedTranscript(e.target.value)}
                                    className="w-full h-40 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 dark:text-slate-200 resize-none font-medium leading-relaxed"
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                                    {transcript || "Speak or upload a file to see transcription…"}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {!isEditing ? (
                                <>
                                    {noteSaved && (
                                        <button onClick={handleChat} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 active:scale-95">
                                            <MessageSquare size={18} /> Chat
                                        </button>
                                    )}
                                    <button onClick={() => { setEditedTranscript(transcript); setIsEditing(true); }} className="inline-flex items-center gap-2 border border-gray-300 dark:border-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition active:scale-95">
                                        <Edit3 size={18} /> Edit
                                    </button>
                                    <button onClick={() => SetShowSaveNoteModal(true)} className="inline-flex items-center gap-2 border border-gray-300 dark:border-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition active:scale-95">
                                        <Save size={18} /> Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={saveEdits} className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95">
                                        <Save size={18} /> Save Changes
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 border border-gray-300 dark:border-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 transition active:scale-95">
                                        <X size={18} /> Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Features Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Any Format", text: "Upload MP3, WAV, or OGG files easily", icon: <FileAudio size={20} /> },
                        { title: "High Accuracy", text: "Whisper AI ensures precise text conversion", icon: <Type size={20} /> },
                        { title: "Safe Storage", text: "Your transcripts are encrypted and private", icon: <Save size={20} /> },
                    ].map((f, i) => (
                        <div key={i} className={`${GLASS_CARD} rounded-2xl p-6 text-center space-y-2 hover:shadow-2xl transition-all duration-300`}>
                            <div className="w-12 h-12 mx-auto bg-purple-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-slate-200">{f.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{f.text}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}