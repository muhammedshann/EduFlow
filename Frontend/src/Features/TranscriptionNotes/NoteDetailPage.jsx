import { useEffect, useState, useRef } from "react"; // Added useRef
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Save, X, Download, ArrowLeft, MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { FetchDetailNote, UpdateNote } from "../../Redux/LiveTranscriptionSlice";
import '../../assets/css/NotePDF.css'

// Import PDF libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function NoteDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const printRef = useRef(); // Create reference for PDF content

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    useEffect(() => {
        const load = async () => {
            const res = await dispatch(FetchDetailNote(id));
            const data = res.payload;
            setNote(data);
            setTitle(data.title || "");
            setContent(data.transcript_text || "");
            setLoading(false);
        };
        load();
    }, [id, dispatch]);

    const handleSave = async () => {
        const res = await dispatch(
            UpdateNote({
                id,
                title,
                transcript_text: content,
            })
        );

        if (!res.error) {
            setNote(res.payload); // 🔥 backend truth
            setIsEditing(false);
        }
    };


    const handleExportPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    // We target the specific elements in the cloned document
                    const container = clonedDoc.getElementById("pdf-wrapper");
                    const titleEl = clonedDoc.getElementById("pdf-title");
                    const dateEl = clonedDoc.getElementById("pdf-date");
                    const bodyEl = clonedDoc.getElementById("pdf-body");

                    // Apply our "Safe" CSS classes that don't use oklch
                    if (container) container.className = "pdf-export-container";
                    if (titleEl) titleEl.className = "pdf-title";
                    if (dateEl) dateEl.className = "pdf-date";
                    if (bodyEl) bodyEl.className = "pdf-body";
                }
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${title || "note"}.pdf`);
        } catch (error) {
            console.error("PDF Export failed:", error);
        }
    };

    const handleChat = () => {
        navigate(`/chat-bot/${id}`);
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-6 py-16">
            <div className="max-w-3xl mx-auto">

                {/* Top bar */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-gray-700 transition"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex gap-4">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={handleChat}
                                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                >
                                    <MessageCircle size={14} /> Chat
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                                {/* NEW PDF BUTTON */}
                                <button
                                    onClick={handleExportPDF}
                                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                >
                                    <Download size={14} /> PDF
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setTitle(note.title);
                                        setContent(note.transcript_text);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="text-sm text-black font-medium flex items-center gap-1"
                                >
                                    <Save size={14} /> Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* This div wraps only what should appear in the PDF */}
                <div ref={printRef} id="pdf-wrapper" className="bg-white">
                    {/* Title */}
                    {isEditing ? (
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled"
                            className="w-full text-5xl font-semibold mb-6 outline-none bg-transparent"
                        />
                    ) : (
                        <h1 id="pdf-title" className="text-5xl font-semibold mb-6">
                            {note.title || "Untitled"}
                        </h1>
                    )}

                    {/* Meta */}
                    <p id="pdf-date" className="text-sm text-gray-400 mb-12">
                        {formatDate(note.created_at)}
                    </p>

                    {/* Content */}
                    {isEditing ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[400px] text-lg leading-relaxed outline-none resize-none bg-transparent"
                            placeholder="Start typing…"
                        />
                    ) : (
                        <div id="pdf-body" className="text-lg leading-relaxed whitespace-pre-wrap text-gray-800">
                            {note.transcript_text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}