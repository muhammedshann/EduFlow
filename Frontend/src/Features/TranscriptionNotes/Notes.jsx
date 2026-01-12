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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Delete Note?
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                    Are you sure you want to delete this note?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

    const [notes, setNotes] = useState([]);      // ✅ always array
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
        <div className="min-h-screen bg-gradient-to-br from-[#f6f3ff] to-[#fafafa] p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-purple-600" />
                            All Notes
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Your complete notes history
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20 text-gray-500">
                        Loading notes...
                    </div>
                )}

                {/* No Notes Saved */}
                {!loading && notes.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg font-medium">No notes saved yet</p>
                        <p className="text-sm mt-1">
                            Start a live transcription to create your first note
                        </p>
                    </div>
                )}

                {/* No Search Results */}
                {!loading && notes.length > 0 && filteredNotes.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No matching notes found.
                    </div>
                )}

                {/* Notes Grid */}
                {!loading && filteredNotes.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                className="group bg-white/70 backdrop-blur rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <FileText className="text-purple-600" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {note.title || "Untitled Note"}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
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
                                    <div className="text-sm text-gray-600">
                                        Type:
                                        <span className="ml-1 font-medium text-gray-900 capitalize">
                                            {note.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/notes/${note.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
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
                                            className="text-gray-400 hover:text-red-600 cursor-pointer"
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
