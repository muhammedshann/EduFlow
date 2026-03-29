import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    Trash2,
    FileText,
    Sparkles,
    Plus,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { DeleteNote, FetchNotes, SaveLiveNote } from "../../Redux/LiveTranscriptionSlice";
import { useNavigate } from "react-router-dom";

function DeleteModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
                    Delete Note?
                </h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">
                    Are you sure you want to delete this note?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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

    // Create Note State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");

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

    const handleCreateNote = async () => {
        if (!noteTitle.trim()) return;
        try {
            const payload = {
                type: "manual",
                title: noteTitle.trim(),
                transcript_text: " ",
            };
            const response = await dispatch(SaveLiveNote(payload));
            if (SaveLiveNote.fulfilled.match(response)) {
                if (response.payload?.id) {
                    navigate(`/notes/${response.payload.id}`);
                } else {
                    fetchNotes();
                }
            } else {
                alert(response.payload?.error || "Failed to create note");
            }
        } catch (err) {
            console.error("Create failed:", err);
        } finally {
            setShowCreateModal(false);
            setNoteTitle("");
        }
    };

    return (
        /* FIXED: Applied Cinematic Background Gradient and increased bottom padding to pb-40 */
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-6 pb-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="text-purple-600 dark:text-purple-400" />
                            All Notes
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                            Your complete notes history
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-500/20"
                    >
                        <Plus size={20} />
                        Create Note
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400">
                        Loading notes...
                    </div>
                )}

                {/* No Notes Saved */}
                {!loading && notes.length === 0 && (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400">
                        <p className="text-lg font-medium">No notes saved yet</p>
                        <p className="text-sm mt-1">
                            Start a live transcription to create your first note
                        </p>
                    </div>
                )}

                {/* No Search Results */}
                {!loading && notes.length > 0 && filteredNotes.length === 0 && (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400">
                        No matching notes found.
                    </div>
                )}

                {/* Notes Grid */}
                {!loading && filteredNotes.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                className="group bg-white/70 dark:bg-slate-800 backdrop-blur rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center transition-colors">
                                            <FileText className="text-purple-600 dark:text-purple-400" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                                                {note.title || "Untitled Note"}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
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
                                    <div className="text-sm text-gray-600 dark:text-slate-400">
                                        Type:
                                        <span className="ml-1 font-medium text-gray-900 dark:text-slate-200 capitalize">
                                            {note.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/notes/${note.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
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
                                            className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
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

            {/* Create Note Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex h-full items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Create New Note</h2>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Give your note a title to start.</p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Note Title</label>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="e.g. Physics – Newton’s Laws"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowCreateModal(false); setNoteTitle(""); }}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!noteTitle.trim()}
                                onClick={handleCreateNote}
                                className={`px-5 py-2 rounded-lg text-white transition ${noteTitle.trim() ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-300 dark:bg-slate-700 cursor-not-allowed"}`}
                            >
                                Create Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}