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

export default function LiveTranscriptionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // UI State
    const [activeTab, setActiveTab] = useState("live"); // "live" or "upload"
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

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8000/ws/live-transcribe/");
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
            "audio/ogg;codecs=opus",
            "audio/ogg",
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
            setNoteTitle(file.name.split('.')[0]); // Default title from filename
        }
        // UploadTranscription
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

            // 🔥 START POLLING
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
        // Determine payload based on active tab
        const payload = {
            type: activeTab === "live" ? "live" : "file",
            title: noteTitle,
            transcript_text: transcript,
        };

        // If it's a file upload, attach the source ID (stored when file was uploaded)
        if (activeTab === "upload" && selectedFileId) {
            payload.upload_source = selectedFileId;
        }

        const response = await dispatch(SaveLiveNote(payload));

        if (SaveLiveNote.fulfilled.match(response)) {
            setNoteId(response.payload.id);
            setNoteSaved(true);
            // Optional: show success notification
        } else {
            // Handle error (e.g., duplicate title)
            alert(response.payload?.error || "Failed to save note");
        }
    };

    return (
        <div className="min-h-screen bg-[#faf7ff] px-4 py-10">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-purple-600">
                        Smart Notes
                    </h1>
                    <p className="text-gray-500">
                        Convert your speech or audio , video files to text accurately
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-purple-100 inline-flex">
                        <button
                            onClick={() => setActiveTab("live")}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${activeTab === "live" ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:bg-purple-50"}`}
                        >
                            <Mic size={18} />
                            Live Mode
                        </button>
                        <button
                            onClick={() => setActiveTab("file")}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${activeTab === "file" ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:bg-purple-50"}`}
                        >
                            <Upload size={18} />
                            Upload File
                        </button>
                    </div>
                </div>

                {/* Save Note Modal */}
                {showSaveNoteModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex h-full items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">Save Smart Note</h2>
                            <p className="text-gray-500 text-sm mb-6">Give your note a title to save it for later.</p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note Title</label>
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="e.g. Physics – Newton’s Laws"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => { SetShowSaveNoteModal(false); setNoteTitle(""); }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!noteTitle.trim()}
                                    onClick={() => { HandleSaveNote(); SetShowSaveNoteModal(false); setNoteTitle(""); }}
                                    className={`px-5 py-2 rounded-lg text-white transition ${noteTitle.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"}`}
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Action Area */}
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center space-y-6">
                    {activeTab === "live" ? (
                        <>
                            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? "bg-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.6)]" : "bg-purple-100 hover:bg-purple-200"}`}>
                                {isRecording ? <MicOff className="w-14 h-14 text-white" /> : <Mic className="w-14 h-14 text-purple-600" />}
                            </div>
                            <p className="text-lg font-medium">
                                {isRecording ? "Listening…" : isProcessing ? "Processing last audio…" : "Ready to record"}
                            </p>
                            {!isRecording ? (
                                <button onClick={startRecording} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition">
                                    <Play size={20} /> Start Live Note
                                </button>
                            ) : (
                                <button onClick={stopRecording} className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition">
                                    <Square size={18} /> Stop Recording
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="mx-auto w-full max-w-lg border-2 border-dashed border-purple-200 rounded-2xl p-10 hover:bg-purple-50 hover:border-purple-400 transition cursor-pointer group"
                            >
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    accept="audio/*, video/*"
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition">
                                        <Upload size={32} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-gray-700">
                                            {selectedFile ? selectedFile.name : "Choose an audio file"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Audio (MP3, WAV) or Video (MP4, MOV, MKV) supported (Max 25MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={!selectedFile || isProcessing}
                                onClick={handleFileUpload}
                                className={`inline-flex items-center gap-2 px-10 py-3 rounded-lg font-semibold transition ${selectedFile && !isProcessing ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                            >
                                {isProcessing ? "Processing..." : "Transcribe File"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Transcript Display */}
                {showTranscript && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Transcript</h2>
                            {(isListening || isProcessing) && (
                                <span className="text-purple-600 text-sm animate-pulse font-medium">
                                    {isListening ? "listening…" : "processing…"}
                                </span>
                            )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] border border-gray-100">
                            {isEditing ? (
                                <textarea
                                    value={editedTranscript}
                                    onChange={(e) => setEditedTranscript(e.target.value)}
                                    className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed italic">
                                    {transcript || "Speak or upload a file to see transcription…"}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-center gap-4">
                            {!isEditing ? (
                                <>
                                    {noteSaved && (
                                        <button onClick={handleChat} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                                            <MessageSquare size={18} /> Chat
                                        </button>
                                    )}
                                    <button onClick={() => { setEditedTranscript(transcript); setIsEditing(true); }} className="inline-flex items-center gap-2 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                                        <Edit3 size={18} /> Edit
                                    </button>
                                    <button onClick={() => SetShowSaveNoteModal(true)} className="inline-flex items-center gap-2 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                                        <Save size={18} /> Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={saveEdits} className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                                        <Save size={18} /> Save Changes
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 border border-gray-200 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
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
                        <div key={i} className="bg-white rounded-xl shadow p-6 text-center space-y-2 border border-purple-50 hover:border-purple-200 transition">
                            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-gray-800">{f.title}</h3>
                            <p className="text-sm text-gray-500">{f.text}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}