import { useEffect, useState, useRef } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, Save, X, Download, ArrowLeft, MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { FetchDetailNote, UpdateNote } from "../../Redux/LiveTranscriptionSlice";
import '../../assets/css/NotePDF.css'
import { useTheme } from "../../Context/ThemeContext";

// Import PDF libraries
import jsPDF from "jspdf";

export default function NoteDetailPage() {
    const { isDarkMode } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const printRef = useRef(); 

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Cinematic Theme Constants
    const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";

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
            setNote(res.payload); 
            setIsEditing(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxLineWidth = pageWidth - (margin * 2);
        let yPos = 20; 

        // -- TITLE --
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0); 
        
        const titleText = title || "Untitled Note";
        const titleLines = doc.splitTextToSize(titleText, maxLineWidth);
        doc.text(titleLines, margin, yPos);
        yPos += (titleLines.length * 10); 

        // -- DATE --
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); 
        
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
        doc.setTextColor(0, 0, 0); 

        const bodyText = note.transcript_text || "";
        const bodyLines = doc.splitTextToSize(bodyText, maxLineWidth);

        bodyLines.forEach((line) => {
            if (yPos > pageHeight - margin) {
                doc.addPage();
                yPos = 20; 
            }
            doc.text(line, margin, yPos);
            yPos += 7; 
        });

        doc.save(`${titleText}.pdf`);
    };

    const handleChat = () => {
        navigate(`/chat-bot/${id}`);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${GRADIENT_BG} text-slate-400`}>
                Loading…
            </div>
        );
    }

    return (
        // FIXED: Applied Cinematic Gradient
        <div className={`min-h-screen ${GRADIENT_BG} px-6 py-16 transition-colors duration-300`}>
            <div className="max-w-3xl mx-auto">

                {/* Top bar */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex gap-4">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={handleChat}
                                    className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors uppercase tracking-wider"
                                >
                                    <MessageCircle size={16} /> Chat
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors uppercase tracking-wider"
                                >
                                    <Edit3 size={16} /> Edit
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors uppercase tracking-wider"
                                >
                                    <Download size={16} /> PDF
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
                                    className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center gap-2 transition-colors uppercase tracking-wider"
                                >
                                    <X size={16} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 transition-colors uppercase tracking-wider"
                                >
                                    <Save size={16} /> Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Wrapper - Transparent to show gradient */}
                <div ref={printRef} id="pdf-wrapper" className="bg-transparent transition-colors duration-300">
                    {/* Title */}
                    {isEditing ? (
                        <input
                            id="pdf-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled"
                            className="w-full text-5xl font-black mb-6 outline-none bg-transparent text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 tracking-tight"
                        />
                    ) : (
                        <h1 id="pdf-title" className="text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
                            {note.title || "Untitled"}
                        </h1>
                    )}

                    {/* Meta */}
                    <p id="pdf-date" className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-12 uppercase tracking-widest">
                        {formatDate(note.created_at)}
                    </p>

                    {/* Content */}
                    {isEditing ? (
                        <textarea
                            id="pdf-body"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[600px] text-lg leading-loose outline-none resize-none bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 font-medium"
                            placeholder="Start typing…"
                        />
                    ) : (
                        <div id="pdf-body" className="text-lg leading-loose whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-medium">
                            {note.transcript_text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}