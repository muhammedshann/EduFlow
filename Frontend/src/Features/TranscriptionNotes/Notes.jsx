import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    Trash2,
    FileText,
    Sparkles,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { DeleteNote, FetchNotes } from "../../Redux/LiveTranscriptionSlice";
import { useNavigate } from "react-router-dom";

function DeleteModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl w-full max-w-sm border border-white/20 dark:border-slate-800 transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2 tracking-tight">
                    Delete Note?
                </h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm mb-8 font-medium">
                    Are you sure you want to delete this note?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-wider"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 font-bold text-xs uppercase tracking-wider"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NotesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]); 
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setshowDeleteConfirm] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    /* ================= FETCH NOTES ================= */
    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await dispatch(FetchNotes()).unwrap();
            setNotes(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error("Failed to fetch notes:", err);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    /* ================= FILTER ================= */
    const query = search.trim().toLowerCase();

    const filteredNotes = notes.filter((n) =>
        (n.title || "").toLowerCase().includes(query)
    );

    const handleDelete = async () => {
        if (!noteToDelete) return;

        try {
            await dispatch(DeleteNote(noteToDelete)).unwrap();
            setNotes((prev) => prev.filter((n) => n.id !== noteToDelete));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setshowDeleteConfirm(false);
            setNoteToDelete(null);
        }
    };

    return (
        // FIXED: Cinematic Gradient Background
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-6 transition-colors duration-300 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tighter">
                            <Sparkles className="text-purple-600 dark:text-purple-500 fill-purple-600/20" />
                            All Notes
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 font-medium mt-2">
                            Your complete notes history
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title..."
                        // FIXED: Glassmorphism Input
                        className="w-full pl-14 pr-4 py-4 rounded-2xl border border-white/20 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm font-medium"
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400 font-medium">
                        Loading notes...
                    </div>
                )}

                {/* No Notes Saved */}
                {!loading && notes.length === 0 && (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800">
                        <p className="text-xl font-bold">No notes saved yet</p>
                        <p className="text-sm mt-2 font-medium">
                            Start a live transcription to create your first note
                        </p>
                    </div>
                )}

                {/* No Search Results */}
                {!loading && notes.length > 0 && filteredNotes.length === 0 && (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400 font-medium">
                        No matching notes found.
                    </div>
                )}

                {/* Notes Grid */}
                {!loading && filteredNotes.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                // FIXED: Glassmorphism Card Style
                                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 p-8 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center transition-colors group-hover:bg-purple-600 group-hover:text-white">
                                            <FileText className="text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight line-clamp-1">
                                                {note.title || "Untitled Note"}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wide">
                                                {new Date(note.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                        {note.type}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/notes/${note.id}`)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                        >
                                            <Eye size={14} />
                                            View
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setNoteToDelete(note.id);
                                                setshowDeleteConfirm(true);
                                            }}
                                            className="p-2.5 rounded-xl text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
            {showDeleteConfirm && (
                <DeleteModal
                    onClose={() => {
                        setshowDeleteConfirm(false);
                        setNoteToDelete(null);
                    }}
                    onConfirm={handleDelete}
                />
            )}

        </div>
    );
}