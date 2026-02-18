import { useEffect, useState, useRef } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Save, X, Download, ArrowLeft, MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { FetchDetailNote, UpdateNote } from "../../Redux/LiveTranscriptionSlice";
import '../../assets/css/NotePDF.css'
import { useTheme } from "../../Context/ThemeContext";

// Import PDF libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function NoteDetailPage() {
    const { isDarkMode } = useTheme();
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

    const handleExportPDF = () => {
        // 1. Create a new PDF document directly
        const doc = new jsPDF();

        // Configuration variables
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxLineWidth = pageWidth - (margin * 2);
        let yPos = 20; // Current vertical position

        // -- TITLE --
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0); // Force Black
        
        const titleText = title || "Untitled Note";
        const titleLines = doc.splitTextToSize(titleText, maxLineWidth);
        doc.text(titleLines, margin, yPos);
        yPos += (titleLines.length * 10); // Move down based on title height

        // -- DATE --
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Gray
        
        const dateText = formatDate(note.created_at);
        doc.text(dateText, margin, yPos);
        yPos += 15;

        // -- SEPARATOR LINE --
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // -- BODY CONTENT --
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Back to Black

        const bodyText = note.transcript_text || "";
        // Split long text into lines that fit the page width
        const bodyLines = doc.splitTextToSize(bodyText, maxLineWidth);

        // Loop through lines to handle page breaks
        bodyLines.forEach((line) => {
            // If we are at the bottom of the page, add a new one
            if (yPos > pageHeight - margin) {
                doc.addPage();
                yPos = 20; // Reset to top
            }
            doc.text(line, margin, yPos);
            yPos += 7; // Line height
        });

        // -- SAVE --
        doc.save(`${titleText}.pdf`);
    };

    const handleChat = () => {
        navigate(`/chat-bot/${id}`);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-950 text-slate-400" : "bg-white text-gray-400"}`}>
                Loading…
            </div>
        );
    }

    return (
        <div className="w-full p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">

                {/* Top bar */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex gap-4">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={handleChat}
                                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                                >
                                    <MessageCircle size={14} /> Chat
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                                {/* NEW PDF BUTTON */}
                                <button
                                    onClick={handleExportPDF}
                                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
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
                                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="text-sm text-black dark:text-white font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Save size={14} /> Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* This div wraps only what should appear in the PDF */}
                <div ref={printRef} id="pdf-wrapper" className="bg-white dark:bg-slate-950 transition-colors duration-300">
                    {/* Title */}
                    {isEditing ? (
                        <input
                            id="pdf-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled"
                            className="w-full text-5xl font-semibold mb-6 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600"
                        />
                    ) : (
                        <h1 id="pdf-title" className="text-5xl font-semibold mb-6 text-gray-900 dark:text-white">
                            {note.title || "Untitled"}
                        </h1>
                    )}

                    {/* Meta */}
                    <p id="pdf-date" className="text-sm text-gray-400 dark:text-slate-500 mb-12">
                        {formatDate(note.created_at)}
                    </p>

                    {/* Content */}
                    {isEditing ? (
                        <textarea
                            id="pdf-body"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[400px] text-lg leading-relaxed outline-none resize-none bg-transparent text-gray-800 dark:text-slate-300 placeholder-gray-300 dark:placeholder-slate-600"
                            placeholder="Start typing…"
                        />
                    ) : (
                        <div id="pdf-body" className="text-lg leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-slate-300">
                            {note.transcript_text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}