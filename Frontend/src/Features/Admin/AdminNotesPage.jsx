import React, { useEffect, useState } from 'react';
import {
    FileText,
    Users,
    Zap,
    BarChart3,
    Search,
    Plus,
    Eye,
    Trash2,
    X,
    MoreVertical
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminStatCard } from './AdminUserPage';
import { AdminFetchNotes } from '../../Redux/AdminRedux/AdminNotesSlice';

const NoteRow = ({ note, onViewNote }) => {

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200">

            <div className="flex items-center flex-1 min-w-0">

                {/* Main Info Columns */}
                <div className="grid grid-cols-3 w-full gap-4 items-center min-w-0">
                    <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">User</p>
                        <p className="text-base font-semibold text-gray-800 dark:text-slate-200 truncate">{note.user}</p>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">Type</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{note.type}</p>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">Title</p>
                        <p className="text-sm text-gray-800 dark:text-slate-200 font-bold truncate">{note.title || "Untitled"}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                <button
                    onClick={() => onViewNote(note)}
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition"
                >
                    View Note
                </button>
            </div>
        </div>
    );
};

export default function NotesManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [notesData, setNotesData] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [stats, setStats] = useState({
        totalNotes: 0,
        activeUsers: 0,
        creditsSpent: 0,
        avgLength: 0,
    });

    const dispatch = useDispatch();

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredNotes(
            notesData.filter(n =>
                n.username.toLowerCase().includes(term) ||
                n.title.toLowerCase().includes(term)
            )
        );
    };

    const fetchData = async () => {
        const response = await dispatch(AdminFetchNotes()).unwrap();
        console.log(response);

        // response IS the array
        setNotesData(response);
        setFilteredNotes(response);

        setStats({
            totalNotes: response.length,
            activeUsers: new Set(response.map(n => n.user)).size,
            creditsSpent: response.reduce((s, n) => s + n.credits_used, 0),
            avgLength: response.length
                ? (response.reduce((s, n) => s + n.transcript_text.length, 0) / response.length / 1000).toFixed(1)
                : 0,
        });
    };


    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Notes Management</h1>
                    <p className="text-gray-500 dark:text-slate-400">Monitor all transcriptions and credit consumption</p>
                </div>
            </header>

            {/* Reusing your StatCard design and grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
                <AdminStatCard
                    title="Total Notes"
                    value={stats.totalNotes}
                    icon={FileText}
                    iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-green-600 dark:text-green-400"
                />

                <AdminStatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={Users}
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-green-600 dark:text-green-400"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Note Records</h2>

                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-purple-500 dark:focus:border-purple-400 outline-none w-64 transition-colors"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map(note => (
                            <NoteRow key={note.id} note={note} onViewNote={(n) => setSelectedNote(n)} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-slate-500 py-8">No notes found.</p>
                    )}
                </div>
            </div>

            {/* CENTERED MODAL VIEW */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Transcription Details</h3>
                            <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedNote.title}</h2>
                            <p className="text-sm text-gray-400 dark:text-slate-500 mb-6 uppercase tracking-widest font-medium">
                                {new Date(selectedNote.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>

                            <div className="h-px bg-gray-100 dark:bg-slate-700 mb-6" />

                            <div className="text-lg leading-relaxed text-gray-800 dark:text-slate-300 whitespace-pre-wrap">
                                {selectedNote.transcript_text}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
                            <div className="flex gap-4">
                                <div className="text-center px-4 border-r border-gray-200 dark:border-slate-700">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">User</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{selectedNote.user}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Credit Cost</p>
                                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{selectedNote.credits_used}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNote(null)} className="px-6 py-2 bg-gray-800 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}