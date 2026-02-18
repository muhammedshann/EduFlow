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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-xl shadow-lg w-full max-w-sm border border-white/20 dark:border-slate-700 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Delete Note?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    Are you sure you want to delete this note?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="text-purple-600 dark:text-purple-400" />
                            All Notes
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Your complete notes history
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title..."
                        // FIXED: Subtle transparency for input
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/20 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                        Loading notes...
                    </div>
                )}

                {/* No Notes Saved */}
                {!loading && notes.length === 0 && (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                        <p className="text-lg font-medium">No notes saved yet</p>
                        <p className="text-sm mt-1">
                            Start a live transcription to create your first note
                        </p>
                    </div>
                )}

                {/* No Search Results */}
                {!loading && notes.length > 0 && filteredNotes.length === 0 && (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                        No matching notes found.
                    </div>
                )}

                {/* Notes Grid */}
                {!loading && filteredNotes.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                // FIXED: Subtle glass effect, original size/padding
                                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center transition-colors">
                                            <FileText className="text-purple-600 dark:text-purple-400" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                {note.title || "Untitled Note"}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {new Date(note.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Type:
                                        <span className="ml-1 font-medium text-slate-900 dark:text-slate-200 capitalize">
                                            {note.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/notes/${note.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                        >
                                            <Eye size={16} />
                                            View Details
                                        </button>

                                        <Trash2
                                            size={18}
                                            onClick={() => {
                                                setNoteToDelete(note.id);
                                                setshowDeleteConfirm(true);
                                            }}
                                            className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                                        />

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