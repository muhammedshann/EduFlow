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
} from "lucide-react";
import { useDispatch } from "react-redux";
import { SaveLiveNote } from "../../Redux/LiveTranscriptionSlice";

export default function LiveTranscriptionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSaveNoteModal, SetShowSaveNoteModal] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");

    const [transcript, setTranscript] = useState("");
    const [showTranscript, setShowTranscript] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState("");

    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8000/ws/live-transcribe/");
        socketRef.current = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (!data.text) return;

            // 🔥 REPLACE transcript (NOT append)
            setTranscript(data.text);
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        return () => socket.close();
    }, []);

    /* ---------------- MIME TYPE ---------------- */
    const getSupportedMimeType = () => {
        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/ogg",
        ];
        return types.find((t) => MediaRecorder.isTypeSupported(t)) || null;
    };

    /* ---------------- START ---------------- */
    const startRecording = async () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("WebSocket not connected yet.");
            return;
        }

        setIsRecording(true);
        setIsListening(true);
        setShowTranscript(true);

        streamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const mimeType = getSupportedMimeType();
        if (!mimeType) {
            alert("Audio recording not supported in this browser.");
            return;
        }

        mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
            mimeType,
        });

        mediaRecorderRef.current.ondataavailable = async (event) => {
            if (
                event.data.size > 0 &&
                socketRef.current.readyState === WebSocket.OPEN
            ) {
                const buffer = await event.data.arrayBuffer();
                socketRef.current.send(buffer);
            }
        };

        mediaRecorderRef.current.start(1000);
    };

    /* ---------------- STOP ---------------- */
    const stopRecording = () => {
        setIsRecording(false);
        setIsListening(false);

        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
    };

    /* ---------------- OTHER ---------------- */
    const handleChat = () => {
        navigate("/chat", { state: { transcript } });
    };

    const saveEdits = () => {
        setTranscript(editedTranscript);
        setIsEditing(false);
    };

    const HandleSaveNote = async () => {
        const response = await dispatch(SaveLiveNote({ type: "live", title: noteTitle, transcript_text: transcript }))
        console.log(response);
    }

    return (
        <div className="min-h-screen bg-[#faf7ff] px-4 py-10">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-purple-600">
                        Live Voice Transcription
                    </h1>
                    <p className="text-gray-500">
                        Real-time speech-to-text using Whisper
                    </p>
                </div>
                {showSaveNoteModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex h-full items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">

                            {/* Header */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                Save Transcription
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Give your note a title to save it for later.
                            </p>

                            {/* Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note Title
                                </label>
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="e.g. Physics – Newton’s Laws"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        SetShowSaveNoteModal(false);
                                        setNoteTitle("");
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={!noteTitle.trim()}
                                    onClick={() => {
                                        HandleSaveNote(noteTitle);
                                        SetShowSaveNoteModal(false);
                                        setNoteTitle("");
                                    }}
                                    className={`px-5 py-2 rounded-lg text-white transition
            ${noteTitle.trim()
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-gray-300 cursor-not-allowed"}
          `}
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recorder */}
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center space-y-6">
                    <div
                        className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300
              ${isRecording
                                ? "bg-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                                : "bg-purple-100 hover:bg-purple-200"
                            }`}
                    >
                        {isRecording ? (
                            <MicOff className="w-14 h-14 text-white" />
                        ) : (
                            <Mic className="w-14 h-14 text-purple-600" />
                        )}
                    </div>

                    <p className="text-lg font-medium">
                        {isRecording
                            ? "Listening…"
                            : isProcessing
                                ? "Processing last audio…"
                                : "Ready to record"}
                    </p>

                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition"
                        >
                            <Play size={20} />
                            Start Live Transcription
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                            <Square size={18} />
                            Stop Recording
                        </button>
                    )}
                </div>

                {/* Transcript */}
                {showTranscript && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Transcript</h2>
                            {isListening && (
                                <span className="text-purple-600 text-sm animate-pulse">
                                    listening…
                                </span>
                            )}
                            {isProcessing && (
                                <span className="text-purple-600 text-sm animate-pulse">
                                    processing…
                                </span>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                            {isEditing ? (
                                <textarea
                                    value={editedTranscript}
                                    onChange={(e) => setEditedTranscript(e.target.value)}
                                    className="w-full h-32 p-2 border rounded-md focus:outline-none"
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-gray-800">
                                    {transcript || "Speak to see transcription…"}
                                </p>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleChat}
                                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition"
                                >
                                    <MessageSquare size={18} />
                                    Chat
                                </button>
                                <button
                                    onClick={() => {
                                        setEditedTranscript(transcript);
                                        setIsEditing(true);
                                    }}
                                    className="inline-flex items-center gap-2 border px-6 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <Edit3 size={18} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => SetShowSaveNoteModal(true)}
                                    className="inline-flex items-center gap-2 border px-6 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <Save size={18} />
                                    Save
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={saveEdits}
                                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg"
                                >
                                    <Save size={18} />
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="inline-flex items-center gap-2 border px-6 py-2 rounded-lg"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Near Real-Time",
                            text: "Optimized chunking for fastest response",
                        },
                        {
                            title: "Always save the note",
                            text: "Current note is temporary. save it for future",
                        },
                        {
                            title: "Talk slow in english",
                            text: "Talking slow can increase the accuracy",
                        },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow p-6 text-center space-y-2"
                        >
                            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                                {i + 1}
                            </div>
                            <h3 className="font-semibold">{f.title}</h3>
                            <p className="text-sm text-gray-500">{f.text}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
